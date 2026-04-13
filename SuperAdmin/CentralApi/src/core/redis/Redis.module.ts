/**
 * 한국어:
 *   Redis 모듈 — RedisService를 앱 전체에서 사용할 수 있게 등록합니다.
 *   Redis는 메모리 기반 데이터 저장소로, 캐싱(자주 쓰는 데이터를 빠르게 꺼내기),
 *   분산 락(여러 서버가 동시에 같은 작업을 하지 않게 막기),
 *   속도 제한(API 남용 방지), 메시지 큐(작업을 순서대로 처리) 등에 사용됩니다.
 *
 * Tiếng Việt:
 *   Module Redis — đăng ký RedisService để toàn bộ ứng dụng có thể sử dụng.
 *   Redis là kho dữ liệu trong bộ nhớ, được dùng cho caching (lấy dữ liệu thường dùng nhanh hơn),
 *   distributed lock (ngăn nhiều server thực hiện cùng một tác vụ đồng thời),
 *   rate limiting (chống lạm dụng API), và message queue (xử lý tác vụ theo thứ tự).
 */
import { Global, Module } from '@nestjs/common';
import { RedisService } from './Redis.service';

// @Global() — 앱 어디서든 RedisService를 주입받을 수 있게 전역 등록
// @Global() — Đăng ký toàn cục để inject RedisService ở bất kỳ đâu trong ứng dụng
@Global()
@Module({
  providers: [RedisService],   // Redis 연결 및 명령을 담당하는 서비스 / Service quản lý kết nối và lệnh Redis
  exports: [RedisService],     // 다른 모듈에 공개 / Xuất cho các module khác sử dụng
})
export class RedisModule {}
