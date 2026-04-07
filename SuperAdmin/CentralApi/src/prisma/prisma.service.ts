/**
 * 한국어: Prisma ORM 클라이언트를 NestJS 서비스로 래핑한 클래스.
 *   PrismaClient를 상속하여 NestJS의 의존성 주입(DI) 시스템에서 사용할 수 있게 한다.
 *   OnModuleInit / OnModuleDestroy 라이프사이클 훅을 구현하여,
 *   모듈 초기화 시 DB 연결을 열고, 모듈 파괴 시 연결을 정리한다.
 *   이를 통해 애플리케이션 시작/종료 시 PostgreSQL 연결 풀의 수명을 안전하게 관리한다.
 *
 * Tiếng Việt: Lớp bọc Prisma ORM client dưới dạng dịch vụ NestJS.
 *   Kế thừa PrismaClient để sử dụng được trong hệ thống Dependency Injection (DI) của NestJS.
 *   Triển khai lifecycle hook OnModuleInit / OnModuleDestroy để
 *   mở kết nối DB khi khởi tạo module và dọn dẹp kết nối khi hủy module.
 *   Nhờ đó quản lý an toàn vòng đời connection pool PostgreSQL khi ứng dụng khởi động/tắt.
 */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'warn' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly slowQueryThresholdMs: number;
  private readonly queryLoggingEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // 한국어: PrismaClient의 기본 생성자를 호출. DATABASE_URL 환경변수에서 연결 문자열을 자동으로 읽는다.
    // Tiếng Việt: Gọi constructor mặc định của PrismaClient. Tự động đọc chuỗi kết nối từ biến môi trường DATABASE_URL.
    const slowQueryThresholdMs = Number(configService.get<string>('PRISMA_SLOW_QUERY_MS', '200'));
    const queryLoggingEnabled = configService.get<string>('PRISMA_LOG_QUERIES', 'false') === 'true';
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
  }

  /**
   * 한국어: NestJS 모듈 초기화 시 호출되는 라이프사이클 훅.
   *   PostgreSQL 데이터베이스에 연결을 수립한다.
   *   연결 실패 시 애플리케이션 시작이 중단된다.
   *
   * Tiếng Việt: Lifecycle hook được gọi khi khởi tạo module NestJS.
   *   Thiết lập kết nối đến cơ sở dữ liệu PostgreSQL.
   *   Nếu kết nối thất bại, quá trình khởi động ứng dụng sẽ bị dừng.
   */
  async onModuleInit() {
    this.warnIfPoolParametersAreMissing();
    await this.$connect();
  }

  /**
   * 한국어: NestJS 모듈 파괴 시 호출되는 라이프사이클 훅.
   *   PostgreSQL 연결 풀을 안전하게 종료하여 리소스 누수를 방지한다.
   *   애플리케이션 종료(SIGTERM 등) 시 자동으로 호출된다.
   *
   * Tiếng Việt: Lifecycle hook được gọi khi hủy module NestJS.
   *   Đóng an toàn connection pool PostgreSQL để ngăn rò rỉ tài nguyên.
   *   Tự động được gọi khi ứng dụng tắt (SIGTERM, v.v.).
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  private warnIfPoolParametersAreMissing() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) return;

    try {
      const parsed = new URL(databaseUrl);
      const hasConnectionLimit = parsed.searchParams.has('connection_limit');
      const hasPoolTimeout = parsed.searchParams.has('pool_timeout');

      if (!hasConnectionLimit || !hasPoolTimeout) {
        this.logger.warn(
          'DATABASE_URL is missing recommended Prisma pool tuning params: connection_limit, pool_timeout',
        );
      }
    } catch {
      this.logger.warn('DATABASE_URL could not be parsed for pool tuning validation');
    }
  }
}
