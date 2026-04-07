/**
 * CentralApi 루트 모듈
 * 한국어: 전체 애플리케이션의 모듈 조합을 정의한다.
 *         GraphQL-first 설정, 전역 인터셉터/필터, 9개 도메인 모듈을 등록한다.
 * Tiếng Việt: Định nghĩa tổ hợp module của toàn bộ ứng dụng.
 *             Cấu hình GraphQL-first, interceptor/filter toàn cục, và đăng ký 9 module domain.
 */
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import depthLimit from 'graphql-depth-limit';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RedisModule } from './common/redis/redis.module';
import { RedisService } from './common/redis/redis.service';
import { createRequestLoaders } from './common/loaders/create-request-loaders';
import { createQueryComplexityPlugin } from './common/graphql/query-complexity.plugin';
import { ApolloRedisKeyValueCache } from './common/graphql/apollo-redis-key-value-cache';
import { createPersistedQueryAllowListPlugin } from './common/graphql/persisted-query-allow-list.plugin';
import { loadPersistedQueryAllowList } from './common/graphql/persisted-query-allow-list';
import { JwtPayload } from './common/decorators/current-user.decorator';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { AuditModule } from './modules/audit/audit.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PolicyModule } from './modules/policy/policy.module';
import { DeployModule } from './modules/deploy/deploy.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    /**
     * 한국어: ConfigModule을 전역으로 등록하여 모든 모듈에서 환경변수 접근 가능하게 한다.
     * Tiếng Việt: Đăng ký ConfigModule toàn cục để tất cả module có thể truy cập biến môi trường.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,
    RedisModule,

    /**
     * 한국어: Apollo Server + NestJS GraphQL 코드-퍼스트 설정.
     *         autoSchemaFile: true로 데코레이터 기반 스키마 자동 생성.
     *         요청마다 DataLoader를 생성해서 relation N+1을 방지한다.
     *         introspection은 운영 환경에서 비활성화.
     * Tiếng Việt: Cấu hình Apollo Server + NestJS GraphQL code-first.
     *             autoSchemaFile: true để tự động tạo schema từ decorator.
     *             Tạo DataLoader theo từng request để tránh N+1 relation.
     *             Tắt introspection trong môi trường sản xuất.
     */
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, PrismaModule, RedisModule],
      inject: [PrismaService, RedisService],
      useFactory: (prisma: PrismaService, redisService: RedisService) => {
        const apqEnabled = process.env.GRAPHQL_APQ_ENABLED !== 'false';
        const apqTtlSeconds = Number(process.env.GRAPHQL_APQ_TTL_SECONDS ?? 3600);
        const apqCache = new ApolloRedisKeyValueCache(redisService, 'apollo:apq:');
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
          autoSchemaFile: true,
          sortSchema: true,
          playground: process.env.NODE_ENV !== 'production',
          introspection: process.env.NODE_ENV !== 'production',
          persistedQueries: apqEnabled
            ? {
                cache: apqCache,
                ttl: Number.isFinite(apqTtlSeconds) ? apqTtlSeconds : 3600,
              }
            : false,
          validationRules: [
            depthLimit(Number(process.env.GRAPHQL_MAX_DEPTH ?? 10)),
          ],
          plugins: [
            createQueryComplexityPlugin(Number(process.env.GRAPHQL_MAX_COMPLEXITY ?? 200)),
            createPersistedQueryAllowListPlugin(persistedQueryAllowList),
          ],
          formatError: (formattedError) => {
            const safeCodes = new Set([
              'BAD_USER_INPUT',
              'UNAUTHENTICATED',
              'FORBIDDEN',
              'NOT_FOUND',
              'BAD_REQUEST',
              'CONFLICT',
              'QUERY_TOO_COMPLEX',
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
                extensions: {
                  code: 'INTERNAL_SERVER_ERROR',
                },
              };
            }

            return formattedError;
          },
          context: ({ req }: { req: unknown }) => ({
            req,
            loaders: createRequestLoaders(prisma, () => {
              const request = req as { user?: unknown };
              return request.user as JwtPayload | undefined;
            }),
          }),
        };
      },
    }),

    // 도메인 모듈 / Module miền nghiệp vụ
    AuthModule,
    HealthModule,
    ReferenceModule,
    AuditModule,
    TenantModule,
    CatalogModule,
    PolicyModule,
    DeployModule,
    SyncModule,
  ],
  providers: [
    /**
     * 한국어: Prisma 에러(P2002 유니크 위반, P2025 미발견 등)를 GraphQL 에러로 변환하는 전역 필터.
     * Tiếng Việt: Filter toàn cục chuyển đổi lỗi Prisma (P2002 vi phạm unique, P2025 không tìm thấy) thành lỗi GraphQL.
     */
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    /**
     * 한국어: 모든 GraphQL 작업의 실행 시간을 로깅하는 전역 인터셉터.
     * Tiếng Việt: Interceptor toàn cục ghi log thời gian thực thi của tất cả hoạt động GraphQL.
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
