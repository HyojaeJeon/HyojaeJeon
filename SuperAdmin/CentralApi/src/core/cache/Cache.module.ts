/**
 * 한국어:
 *   캐시 모듈 — CacheService를 앱 전체에서 사용할 수 있게 등록합니다.
 *   @Global() 데코레이터 덕분에 다른 모듈에서 별도 import 없이 CacheService를 주입받을 수 있습니다.
 *   내부적으로 Redis를 저장소로 사용하며, RedisModule을 import해서 연결합니다.
 *
 * Tiếng Việt:
 *   Module cache — đăng ký CacheService để toàn bộ ứng dụng có thể sử dụng.
 *   Nhờ decorator @Global(), các module khác có thể inject CacheService mà không cần import riêng.
 *   Bên trong sử dụng Redis làm nơi lưu trữ, kết nối thông qua RedisModule.
 */
import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@core/redis/Redis.module';
import { CacheService } from './Cache.service';

// @Global() — 이 모듈을 전역으로 등록하여, 앱 어디서든 CacheService를 사용 가능하게 합니다
// @Global() — Đăng ký module này ở phạm vi toàn cục, cho phép sử dụng CacheService ở bất kỳ đâu
@Global()
@Module({
  imports: [RedisModule],       // Redis 연결을 제공하는 모듈 / Module cung cấp kết nối Redis
  providers: [CacheService],    // 캐시 로직을 담당하는 서비스 / Service xử lý logic cache
  exports: [CacheService],      // 다른 모듈에 CacheService를 공개 / Xuất CacheService cho các module khác
})
export class CacheModule {}
