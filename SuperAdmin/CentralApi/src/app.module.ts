/**
 * CentralApi 루트 모듈
 * 한국어: 전체 애플리케이션의 모듈 조합을 정의한다.
 *         GraphQL-first 설정 + 표준 응답(success/error) wiring + i18n 을 등록한다.
 * Tiếng Việt: Định nghĩa tổ hợp module toàn ứng dụng + chuẩn hoá response + i18n.
 */
import { randomUUID } from 'node:crypto';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import depthLimit from 'graphql-depth-limit';

import { PrismaModule } from '@core/prisma/prisma.module';
import { PrismaService } from '@core/prisma/prisma.service';
import { RedisModule } from '@core/redis/redis.module';
import { RedisService } from '@core/redis/redis.service';
import { CacheModule } from '@core/cache/cache.module';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import { createRequestLoaders } from '@core/graphql/loaders/create-request-loaders';
import { createQueryComplexityPlugin } from '@core/graphql/plugins/query-complexity.plugin';
import { ApolloRedisKeyValueCache } from '@core/graphql/plugins/apollo-redis-key-value-cache';
import { createPersistedQueryAllowListPlugin } from '@core/graphql/plugins/persisted-query-allow-list.plugin';
import { loadPersistedQueryAllowList } from '@core/graphql/plugins/persisted-query-allow-list';
import { createGraphqlRateLimitPlugin } from '@core/graphql/plugins/rate-limit.plugin';
import { JwtPayload } from '@core/auth/decorators/current-user.decorator';
import { AuthSessionModule } from '@core/auth/auth-session.module';
import { TenancyModule } from '@core/tenancy/tenancy.module';
import { I18nModule } from '@core/i18n/i18n.module';
import { resolveLocale, type SupportedLocale } from '@core/i18n/locale.util';
import { DomainExceptionFilter } from '@core/response/domain-exception.filter';
import { WrapResponseInterceptor } from '@core/response/wrap-response.interceptor';
import { RealtimeModule } from '@core/realtime/realtime.module';
import { CachePolicies } from '@core/cache/cache-policies';

import { AuditModule as CoreAuditModule } from '@core/audit/audit.module';

// Platform — superadmin (운영 계층)
import { AuditModule } from '@platform/superadmin/audit/audit.module';
import { AuthModule } from '@platform/superadmin/auth/auth.module';
import { GovernanceModule } from '@platform/superadmin/governance.module';
import { RbacModule } from '@platform/superadmin/rbac/rbac.module';

// Platform — distributor / brand / branch / edge-pos
import { DistributorModule } from '@platform/distributor/profile/distributor.module';
import { BrandModule } from '@platform/brand/profile/brand.module';
import { CatalogModule } from '@platform/brand/catalog/catalog.module';
import { DeployModule } from '@platform/brand/deploy/deploy.module';
import { BranchModule } from '@platform/branch/profile/branch.module';
import { EdgePosModule } from '@platform/edge-pos/edge-pos.module';

// Platform — corporate (식권 도메인)
import { CorporateModule } from '@platform/corporate/profile/corporate.module';
import { WalletModule } from '@platform/corporate/wallet/wallet.module';
import { PolicyModule } from '@platform/corporate/policy/policy.module';
import { TransactionModule } from '@platform/corporate/transaction/transaction.module';
import { SettlementModule } from '@platform/corporate/settlement/settlement.module';
import { MerchantModule } from '@platform/corporate/merchant/merchant.module';
import { EInvoiceModule } from '@platform/corporate/einvoice/einvoice.module';

// Shared (플랫폼 간 공유 도메인)
import { EntitlementModule } from '@shared/entitlement/entitlement.module';
import { HealthModule } from '@shared/health/health.module';
import { ReferenceModule } from '@shared/reference/reference.module';
import { SyncModule } from '@shared/sync/sync.module';

interface IncomingHttpRequest {
  headers?: Record<string, string | string[] | undefined>;
  user?: JwtPayload;
}

function headerValue(
  headers: Record<string, string | string[] | undefined> | undefined,
  name: string,
): string | undefined {
  const v = headers?.[name];
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,
    RedisModule,
    CacheModule,
    AuthSessionModule,
    TenancyModule,
    I18nModule,
    CoreAuditModule,
    RealtimeModule,

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, PrismaModule, RedisModule],
      inject: [PrismaService, RedisService],
      useFactory: (prisma: PrismaService, redisService: RedisService) => {
        const apqEnabled = process.env.GRAPHQL_APQ_ENABLED !== 'false';
        const apqTtlSeconds = Number(process.env.GRAPHQL_APQ_TTL_SECONDS ?? 3600);
        const apqCache = new ApolloRedisKeyValueCache(redisService, CachePolicies.apqPrefix);
        const persistedQueryAllowListEnabled =
          process.env.GRAPHQL_PERSISTED_QUERY_ALLOW_LIST_ENABLED != null
            ? process.env.GRAPHQL_PERSISTED_QUERY_ALLOW_LIST_ENABLED !== 'false'
            : process.env.NODE_ENV === 'production';
        const requirePersistedQueries =
          process.env.GRAPHQL_REQUIRE_PERSISTED_QUERIES != null
            ? process.env.GRAPHQL_REQUIRE_PERSISTED_QUERIES !== 'false'
            : persistedQueryAllowListEnabled;
        const persistedQueryAllowList = loadPersistedQueryAllowList({
          enabled: persistedQueryAllowListEnabled,
          requirePersistedQueries,
          manifestPath: process.env.GRAPHQL_PERSISTED_QUERY_ALLOW_LIST_PATH,
        });

        return {
          // P1-1: schema 를 파일로 emit 하여 SharedContracts codegen / operation 정합성 검증의
          //   "single source of truth" 로 삼는다. prebuild 파이프라인이 이 파일을 읽는다.
          autoSchemaFile:
            process.env.GRAPHQL_SCHEMA_EMIT_PATH ||
            'src/core/graphql/schema.generated.graphql',
          sortSchema: true,
          playground: process.env.NODE_ENV !== 'production',
          introspection: process.env.NODE_ENV !== 'production',
          persistedQueries: apqEnabled
            ? {
                cache: apqCache,
                ttl: Number.isFinite(apqTtlSeconds) ? apqTtlSeconds : 3600,
              }
            : false,
          validationRules: [depthLimit(Number(process.env.GRAPHQL_MAX_DEPTH ?? 10))],
          plugins: [
            createGraphqlRateLimitPlugin(redisService, {
              userPerMinute: Number(process.env.GRAPHQL_RATE_LIMIT_USER_PER_MINUTE ?? 600),
              ipPerMinute: Number(process.env.GRAPHQL_RATE_LIMIT_IP_PER_MINUTE ?? 120),
              windowSeconds: 60,
            }),
            createQueryComplexityPlugin(Number(process.env.GRAPHQL_MAX_COMPLEXITY ?? 200)),
            createPersistedQueryAllowListPlugin(persistedQueryAllowList),
          ],
          /**
           * 한국어: GraphQL transport 단계의 fault (parsing/validation/persisted-query 등) 만 errors 배열에 노출.
           *   business 실패는 DomainExceptionFilter 가 표준 error 응답으로 변환하므로 여기 들어오지 않는다.
           */
          formatError: (formattedError) => {
            const safeCodes = new Set([
              'BAD_USER_INPUT',
              'GRAPHQL_PARSE_FAILED',
              'GRAPHQL_VALIDATION_FAILED',
              'QUERY_TOO_COMPLEX',
              'RATE_LIMIT_EXCEEDED',
              'PERSISTED_QUERY_NOT_FOUND',
              'PERSISTED_QUERY_NOT_SUPPORTED',
              'PERSISTED_QUERY_NOT_ALLOWED',
              'PERSISTED_QUERY_ONLY',
              'PERSISTED_QUERY_HASH_MISMATCH',
            ]);
            if (
              process.env.NODE_ENV === 'production' &&
              !safeCodes.has(String(formattedError.extensions?.code))
            ) {
              return {
                message: 'Internal server error',
                locations: formattedError.locations,
                path: formattedError.path,
                extensions: { code: 'INTERNAL_SERVER_ERROR' },
              };
            }
            return formattedError;
          },
          /**
           * 한국어: 요청 컨텍스트.
           *   - req:           원본 요청
           *   - requestId:     x-request-id 헤더 또는 신규 uuid
           *   - acceptLanguage: 원본 헤더 (디버깅용)
           *   - locale:        normalize 된 지원 locale
           *   - user:          JwtStrategy 가 채운 인증 사용자 (존재 시)
           *   - tenantContext: user.tenantContext (존재 시)
           *   - loaders:       request-scoped DataLoader bag
           */
          context: ({ req }: { req: IncomingHttpRequest }) => {
            const requestId =
              headerValue(req?.headers, 'x-request-id') ?? randomUUID();
            const acceptLanguage = headerValue(req?.headers, 'accept-language');
            // 한국어: locale 은 GqlAuthGuard 가 req.user 를 채우기 전(context 생성 시점) 에는
            //   사용자 언어를 알 수 없다. 따라서 lazy 하게 해석한다.
            //   실제 메시지 해석 (interceptor/filter) 시점에 req.user 가 채워져 있으므로
            //   getLocale() 호출이 정확한 fallback 을 반환한다.
            // Tiếng Việt: Phân giải locale theo yêu cầu — req.user chỉ có sau guard.
            const getLocale = (): SupportedLocale =>
              resolveLocale({
                acceptLanguage,
                userLanguage: req?.user?.defaultLanguage ?? null,
                tenantLanguage: null,
              });
            return {
              req,
              requestId,
              acceptLanguage,
              getLocale,
              get locale(): SupportedLocale {
                return getLocale();
              },
              get user() {
                return req?.user;
              },
              get tenantContext() {
                return req?.user?.tenantContext;
              },
              loaders: createRequestLoaders(prisma, () => req?.user),
            };
          },
        };
      },
    }),

    // Platform — superadmin (운영 계층)
    AuditModule,
    AuthModule,
    GovernanceModule,
    RbacModule,
    // Platform — distributor / brand / branch / edge-pos
    DistributorModule,
    BrandModule,
    CatalogModule,
    DeployModule,
    BranchModule,
    EdgePosModule,
    // Platform — corporate (식권 도메인)
    CorporateModule,
    WalletModule,
    PolicyModule,
    TransactionModule,
    SettlementModule,
    MerchantModule,
    EInvoiceModule,
    // Shared
    EntitlementModule,
    HealthModule,
    ReferenceModule,
    SyncModule,
  ],
  providers: [
    /**
     * 한국어: 모든 예외를 표준 error 응답으로 변환하는 전역 필터.
     *   Prisma P2002/P2025, DomainError, Nest HttpException 을 일관 처리한다.
     */
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    /**
     * 한국어: GraphQL Query/Mutation 의 raw 반환 값을 표준 success 응답으로 자동 wrapping.
     *   ResolveField/Subscription/REST 는 무시한다.
     */
    { provide: APP_INTERCEPTOR, useClass: WrapResponseInterceptor },
    /**
     * 한국어: GraphQL 작업 실행 시간 로깅 인터셉터.
     */
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
