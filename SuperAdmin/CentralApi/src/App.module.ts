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

import { PrismaModule } from '@core/prisma/Prisma.module';
import { PrismaService } from '@core/prisma/Prisma.service';
import { RedisModule } from '@core/redis/Redis.module';
import { RedisService } from '@core/redis/Redis.service';
import { CacheModule } from '@core/cache/Cache.module';
import { LoggingInterceptor } from '@core/interceptors/Logging.interceptor';
import { GraphqlSubscriptionModule } from '@core/graphql/subscriptions/GraphqlSubscription.module';
import { createRequestLoaders } from '@core/graphql/loaders/createRequestLoaders';
import { createQueryComplexityPlugin } from '@core/graphql/plugins/QueryComplexity.plugin';
import { ApolloRedisKeyValueCache } from '@core/graphql/plugins/ApolloRedisKeyValueCache';
import { createGraphqlCookiePlugin } from '@core/graphql/plugins/GraphqlCookie.plugin';
import { createPersistedQueryAllowListPlugin } from '@core/graphql/plugins/PersistedQueryAllowList.plugin';
import { loadPersistedQueryAllowList } from '@core/graphql/plugins/persistedQueryAllowList';
import { createGraphqlRateLimitPlugin } from '@core/graphql/plugins/RateLimit.plugin';
import { registerResponseCookies } from '@core/graphql/responseCookiesRegistry';
import { JwtPayload } from '@core/auth/decorators/CurrentUser.decorator';
import { AuthSessionModule } from '@core/auth/AuthSession.module';
import { TenancyModule } from '@core/tenancy/Tenancy.module';
import { I18nModule } from '@core/i18n/I18n.module';
import { resolveLocale, type SupportedLocale } from '@core/i18n/locale.util';
import { DomainExceptionFilter } from '@core/response/DomainException.filter';
import { WrapResponseInterceptor } from '@core/response/WrapResponse.interceptor';
import { CachePolicies } from '@core/cache/cachePolicies';

import { AuditModule as CoreAuditModule } from '@core/audit/Audit.module';
import { UploadModule } from '@core/upload/Upload.module';
import { EmailModule } from '@core/email/Email.module';

// Platform — superadmin (운영 계층)
import { AuditModule } from '@platform/superadmin/audit/Audit.module';
import { AuthModule } from '@platform/superadmin/auth/Auth.module';
import { GovernanceModule } from '@platform/superadmin/Governance.module';
import { RbacModule } from '@platform/superadmin/rbac/Rbac.module';
import { NotificationModule } from '@platform/superadmin/notification/Notification.module';

// Platform — distributor / brand / branch / edge-pos
import { DistributorModule } from '@platform/distributor/profile/Distributor.module';
import { BrandModule } from '@platform/brand/profile/Brand.module';
import { CatalogModule } from '@platform/brand/catalog/Catalog.module';
import { DeployModule } from '@platform/brand/deploy/Deploy.module';
import { BranchModule } from '@platform/branch/profile/Branch.module';
import { EdgePosModule } from '@platform/edgePos/EdgePos.module';

// Platform — corporate (식권 도메인)
import { CorporateModule } from '@platform/corporate/profile/Corporate.module';
import { WalletModule } from '@platform/corporate/wallet/Wallet.module';
import { PolicyModule } from '@platform/corporate/policy/Policy.module';
import { TransactionModule } from '@platform/corporate/transaction/Transaction.module';
import { SettlementModule } from '@platform/corporate/settlement/Settlement.module';
import { MerchantModule } from '@platform/corporate/merchant/Merchant.module';
import { MerchantSubscriptionModule } from '@platform/corporate/merchantSubscription/MerchantSubscription.module';
import { OrderModule } from '@platform/corporate/order/Order.module';
import { DailyMenuModule } from '@platform/corporate/dailyMenu/DailyMenu.module';
import { EInvoiceModule } from '@shared/einvoice/Einvoice.module';

// Shared (플랫폼 간 공유 도메인)
import { EntitlementModule } from '@shared/entitlement/Entitlement.module';
import { HealthModule } from '@shared/health/Health.module';
import { ReferenceModule } from '@shared/reference/Reference.module';
import { SyncModule } from '@shared/sync/Sync.module';
import { ContractModule } from '@shared/contract/Contract.module';

interface IncomingHttpRequest {
  headers?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string | undefined>;
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
    UploadModule,
    EmailModule,
    GraphqlSubscriptionModule,

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
          subscriptions: {
            'graphql-ws': true,
          },
          persistedQueries: apqEnabled
            ? {
                cache: apqCache,
                ttl: Number.isFinite(apqTtlSeconds) ? apqTtlSeconds : 3600,
              }
            : false,
          validationRules: [depthLimit(Number(process.env.GRAPHQL_MAX_DEPTH ?? 10))],
          plugins: [
            createGraphqlCookiePlugin(),
            createGraphqlRateLimitPlugin(redisService, {
              userPerMinute: Number(process.env.GRAPHQL_RATE_LIMIT_USER_PER_MINUTE ?? 600),
              ipPerMinute: Number(process.env.GRAPHQL_RATE_LIMIT_IP_PER_MINUTE ?? 120),
              sessionPerMinute: Number(process.env.GRAPHQL_RATE_LIMIT_SESSION_PER_MINUTE ?? 240),
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
          context: (...args: unknown[]) => {
            // @as-integrations/fastify calls context(FastifyRequest, FastifyReply) directly.
            // @nestjs/apollo wrapContextResolver passes args through.
            // Detect: is args[0] a FastifyRequest (has .raw, .id, .headers)?
            const firstArg = args[0] as Record<string, unknown> | undefined;
            const isFastifyRequest = firstArg && 'raw' in firstArg && 'id' in firstArg;

            const req = isFastifyRequest
              ? (firstArg as unknown as IncomingHttpRequest)
              : ((firstArg as { req?: IncomingHttpRequest; request?: IncomingHttpRequest } | undefined)?.req
                ?? (firstArg as { request?: IncomingHttpRequest } | undefined)?.request);

            const reply = isFastifyRequest
              ? (args[1] as { raw?: { setHeader?: (name: string, value: string | string[]) => void } } | undefined)
              : (firstArg as { reply?: { raw?: { setHeader?: (name: string, value: string | string[]) => void } } } | undefined)?.reply;

            const requestId =
              headerValue(req?.headers, 'x-request-id') ?? randomUUID();
            const fastifyRequestId =
              (req as { id?: string } | undefined)?.id ?? requestId;
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
            // responseCookies 버퍼를 req/reply.raw 양쪽에 연결한다.
            // 표준 flush 는 GraphqlCookie.plugin 이 수행하고, main.ts onSend hook 이 safety-net 이다.
            const responseCookies: string[] = [];
            registerResponseCookies(fastifyRequestId, responseCookies);
            if (req) (req as Record<string, unknown>).__responseCookies = responseCookies;
            if ((req as Record<string, unknown> | undefined)?.raw) {
              ((req as Record<string, unknown>).raw as Record<string, unknown>).__responseCookies =
                responseCookies;
            }
            if (reply?.raw) {
              (reply.raw as Record<string, unknown>).__responseCookies = responseCookies;
            }
            return {
              req,
              reply,
              responseCookies,
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
    NotificationModule,
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
    MerchantSubscriptionModule,
    OrderModule,
    DailyMenuModule,
    EInvoiceModule,
    // Shared
    EntitlementModule,
    HealthModule,
    ReferenceModule,
    SyncModule,
    ContractModule,
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
