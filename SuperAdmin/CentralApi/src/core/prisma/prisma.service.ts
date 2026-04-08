/**
 * 한국어: Prisma ORM 클라이언트를 NestJS 서비스로 래핑한 클래스.
 *   PrismaClient를 상속하여 NestJS의 의존성 주입(DI) 시스템에서 사용할 수 있게 한다.
 *   OnModuleInit / OnModuleDestroy 라이프사이클 훅을 구현하여,
 *   모듈 초기화 시 DB 연결을 열고, 모듈 파괴 시 연결을 정리한다.
 *
 *   P1-5: DATABASE_POOL_SIZE / DATABASE_POOL_TIMEOUT 환경변수를 읽어
 *         DATABASE_URL 에 자동으로 connection_limit / pool_timeout query string 을 주입한다.
 *         DBA 가 .env 를 수동 편집하지 않아도 Prisma 가 권장 pool 파라미터로 부팅된다.
 *
 * Tiếng Việt: Lớp bọc Prisma ORM client dưới dạng dịch vụ NestJS.
 */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

const DEFAULT_POOL_SIZE = 10;
const DEFAULT_POOL_TIMEOUT_SECONDS = 30;

function buildDatabaseUrl(
  rawUrl: string | undefined,
  poolSize: number,
  poolTimeoutSeconds: number,
  logger: Logger,
): string | undefined {
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);

    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', String(poolSize));
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', String(poolTimeoutSeconds));
    }

    return url.toString();
  } catch {
    logger.warn(
      'DATABASE_URL could not be parsed for pool tuning. Using raw value unchanged.',
    );
    return rawUrl;
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'warn' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  private static readonly bootLogger = new Logger(`${PrismaService.name}:boot`);
  private readonly logger = new Logger(PrismaService.name);
  private readonly slowQueryThresholdMs: number;
  private readonly queryLoggingEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // 한국어: PrismaClient 생성자에 datasourceUrl 을 명시 주입하면 환경변수 파싱을 우회할 수 있다.
    //   DATABASE_POOL_SIZE / DATABASE_POOL_TIMEOUT 을 읽어 connection_limit / pool_timeout 자동 주입.
    // Tiếng Việt: Tự động thêm connection_limit và pool_timeout vào DATABASE_URL.
    const rawUrl = configService.get<string>('DATABASE_URL');
    const poolSize = Number(
      configService.get<string>('DATABASE_POOL_SIZE', String(DEFAULT_POOL_SIZE)),
    );
    const poolTimeoutSeconds = Number(
      configService.get<string>(
        'DATABASE_POOL_TIMEOUT',
        String(DEFAULT_POOL_TIMEOUT_SECONDS),
      ),
    );
    const effectiveUrl = buildDatabaseUrl(
      rawUrl,
      Number.isFinite(poolSize) && poolSize > 0 ? poolSize : DEFAULT_POOL_SIZE,
      Number.isFinite(poolTimeoutSeconds) && poolTimeoutSeconds > 0
        ? poolTimeoutSeconds
        : DEFAULT_POOL_TIMEOUT_SECONDS,
      PrismaService.bootLogger,
    );

    const slowQueryThresholdMs = Number(
      configService.get<string>('PRISMA_SLOW_QUERY_MS', '200'),
    );
    const queryLoggingEnabled =
      configService.get<string>('PRISMA_LOG_QUERIES', 'false') === 'true';
    const shouldEmitQueryEvents = queryLoggingEnabled || slowQueryThresholdMs > 0;
    const log: Array<Prisma.LogLevel | Prisma.LogDefinition> = [
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
      ...(shouldEmitQueryEvents
        ? ([{ emit: 'event', level: 'query' }] as Prisma.LogDefinition[])
        : []),
    ];

    super({
      log,
      ...(effectiveUrl ? { datasourceUrl: effectiveUrl } : {}),
    });

    this.slowQueryThresholdMs = slowQueryThresholdMs;
    this.queryLoggingEnabled = queryLoggingEnabled;

    if (shouldEmitQueryEvents) {
      this.$on('query', (event: Prisma.QueryEvent) => {
        if (event.duration >= this.slowQueryThresholdMs) {
          this.logger.warn(
            `Slow query ${event.duration}ms: ${event.query} -- params=${event.params}`,
          );
          return;
        }

        if (this.queryLoggingEnabled) {
          this.logger.debug(`Query ${event.duration}ms: ${event.query}`);
        }
      });
    }

    if (effectiveUrl && effectiveUrl !== rawUrl) {
      PrismaService.bootLogger.log(
        `DATABASE_URL augmented with connection_limit=${poolSize}, pool_timeout=${poolTimeoutSeconds}`,
      );
    }
  }

  /**
   * 한국어: NestJS 모듈 초기화 시 호출되는 라이프사이클 훅.
   *   PostgreSQL 데이터베이스에 연결을 수립한다. 실패 시 애플리케이션 시작이 중단된다.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * 한국어: NestJS 모듈 파괴 시 호출되는 라이프사이클 훅.
   *   PostgreSQL 연결 풀을 안전하게 종료하여 리소스 누수를 방지한다.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
