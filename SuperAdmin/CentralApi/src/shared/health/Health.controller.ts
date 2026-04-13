/**
 * Health Check 컨트롤러 (REST)
 * 한국어: GET /health 엔드포인트. PostgreSQL 연결 상태를 확인한다.
 *         설계 문서 기준 합법적 REST 엔드포인트 (GraphQL-first 예외).
 *         DB 쿼리에 5초 타임아웃을 적용하여 행(hang) 방지.
 * Tiếng Việt: Endpoint GET /health. Kiểm tra trạng thái kết nối PostgreSQL.
 *             Endpoint REST hợp lệ theo tài liệu thiết kế (ngoại lệ GraphQL-first).
 *             Áp dụng timeout 5 giây cho truy vấn DB để ngăn treo.
 */
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@core/prisma/Prisma.service';
import { RedisService } from '@core/redis/Redis.service';
import { Public } from '@core/auth/decorators/Public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = 'ok';
    try {
      /**
       * 한국어: DB 연결 확인 쿼리. 5초 내 응답이 없으면 타임아웃 처리.
       * Tiếng Việt: Truy vấn kiểm tra kết nối DB. Xử lý timeout nếu không phản hồi trong 5 giây.
       */
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DB health check timeout')), 5000),
        ),
      ]);
    } catch {
      dbStatus = 'error';
    }

    /**
     * 한국어: Redis 연결 상태를 확인한다. Redis가 비활성이면 graceful degradation.
     * Tiếng Việt: Kiểm tra trạng thái kết nối Redis. Nếu Redis không hoạt động thì degradation nhẹ nhàng.
     */
    const redisHealth = await this.redis.healthSnapshot();

    // 한국어: DB와 Redis 모두 정상이면 'ok', 하나라도 이상이면 'degraded' 반환
    // Tiếng Việt: Trả về 'ok' nếu cả DB và Redis đều bình thường, 'degraded' nếu bất kỳ cái nào có vấn đề
    return {
      status: dbStatus === 'ok' && redisHealth.status === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisHealth.status,
      },
    };
  }
}
