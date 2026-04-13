/**
 * 한국어: GraphQL 전역 rate limit plugin. (P2-1)
 *
 *   - key 전략:
 *       · 인증된 요청: `gql:rl:user:${userType}:${userId}`
 *       · refreshSession/logout: `gql:rl:session:${sessionId}` (refresh cookie 기준)
 *       · 익명 요청:   `gql:rl:ip:${ipAddress}`
 *   - RedisService.consumeRateLimit(key, limit, windowSeconds) 에 위임.
 *     Redis 비활성이면 consumeRateLimit 은 allow 상태를 반환하므로 fail-open 이 되지만,
 *     운영에서는 Redis 가 반드시 활성화되어야 함 (CLAUDE.md 규칙).
 *   - 환경변수:
 *       GRAPHQL_RATE_LIMIT_USER_PER_MINUTE (기본 600)
 *       GRAPHQL_RATE_LIMIT_IP_PER_MINUTE      (기본 120)
 *       GRAPHQL_RATE_LIMIT_SESSION_PER_MINUTE (기본 240)
 *   - Persisted query 해석 전 (didResolveOperation) 에 동작. login 단계는 별도의
 *     AuthService 내부 rate limit 이 이미 적용되어 있으므로 이중 방어가 된다.
 *
 * Tiếng Việt: Plugin giới hạn tốc độ GraphQL toàn cục — phòng chống lạm dụng API.
 */
import { ApolloServerPlugin } from '@apollo/server';
import { readRefreshTokenCookie } from '@core/auth/authCookies';
import { GraphQLError, Kind, type OperationDefinitionNode, type SelectionNode } from 'graphql';
import type { RedisService } from '@core/redis/Redis.service';

export interface RateLimitConfig {
  userPerMinute: number;
  ipPerMinute: number;
  sessionPerMinute: number;
  windowSeconds: number;
}

interface GqlRateLimitContext {
  req?: {
    headers?: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string | undefined>;
    ip?: string;
    user?: {
      userType?: string;
      userId?: string;
    };
  };
}

function extractIp(headers: Record<string, string | string[] | undefined> | undefined): string {
  const xff = headers?.['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return xff[0].split(',')[0].trim();
  }
  const xri = headers?.['x-real-ip'];
  if (typeof xri === 'string' && xri.length > 0) return xri;
  return 'unknown';
}

function isFieldSelection(
  selection: SelectionNode,
): selection is Extract<SelectionNode, { kind: typeof Kind.FIELD }> {
  return selection.kind === Kind.FIELD;
}

export function extractRootFieldNames(
  operation: Pick<OperationDefinitionNode, 'selectionSet'> | undefined,
): string[] {
  if (!operation?.selectionSet?.selections?.length) return [];
  return operation.selectionSet.selections
    .filter(isFieldSelection)
    .map((selection) => selection.name.value);
}

export function extractRefreshSessionId(rawRefreshToken: string | null | undefined): string | null {
  if (!rawRefreshToken) return null;
  const dotIndex = rawRefreshToken.indexOf('.');
  if (dotIndex <= 0) return null;
  const sessionId = rawRefreshToken.slice(0, dotIndex).trim();
  return sessionId.length > 0 ? sessionId : null;
}

function isSessionRefreshOperation(rootFields: readonly string[]): boolean {
  return rootFields.includes('refreshSession') || rootFields.includes('logout');
}

export function createGraphqlRateLimitPlugin(
  redis: RedisService,
  config: RateLimitConfig,
): ApolloServerPlugin {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          // Health / introspection 은 제외한다.
          if (requestContext.operationName === 'IntrospectionQuery') return;

          const ctx = requestContext.contextValue as GqlRateLimitContext;
          const user = ctx?.req?.user;
          const headers = ctx?.req?.headers;
          const rootFields = extractRootFieldNames(requestContext.operation);

          let key: string;
          let limit: number;

          if (user?.userType && user?.userId) {
            key = `gql:rl:user:${user.userType}:${user.userId}`;
            limit = config.userPerMinute;
          } else if (isSessionRefreshOperation(rootFields)) {
            const sessionId = extractRefreshSessionId(
              readRefreshTokenCookie(ctx?.req ?? {}),
            );
            if (sessionId) {
              key = `gql:rl:session:${sessionId}`;
              limit = config.sessionPerMinute;
            } else {
              const ip = ctx?.req?.ip ?? extractIp(headers);
              key = `gql:rl:ip:${ip}`;
              limit = config.ipPerMinute;
            }
          } else {
            const ip = ctx?.req?.ip ?? extractIp(headers);
            key = `gql:rl:ip:${ip}`;
            limit = config.ipPerMinute;
          }

          const result = await redis.consumeRateLimit(key, limit, config.windowSeconds);
          if (!result.allowed) {
            throw new GraphQLError('Rate limit exceeded', {
              extensions: {
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfterSeconds: config.windowSeconds,
                limit,
                windowSeconds: config.windowSeconds,
              },
            });
          }
        },
      };
    },
  };
}
