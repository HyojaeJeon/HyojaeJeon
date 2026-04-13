/**
 * 한국어:
 *   Redis 연결 설정 해석기 — 환경변수에서 Redis 접속 정보를 읽어옵니다.
 *   ioredis, node-redis, socket adapter 등 여러 라이브러리가 같은 환경변수 규칙을 공유합니다.
 *
 *   Redis에 연결하는 두 가지 방법:
 *   1. REDIS_URL: 전체 연결 문자열 (예: "redis://user:password@localhost:6379/0")
 *      - 클라우드 서비스(AWS ElastiCache 등)에서 흔히 제공하는 형식
 *   2. REDIS_HOST + REDIS_PORT + REDIS_PASSWORD: 개별 설정
 *      - 로컬 개발이나 세밀한 설정이 필요할 때 사용
 *
 *   둘 다 설정되지 않으면 Redis가 비활성화되고, 앱은 캐시 없이 동작합니다.
 *
 * Tiếng Việt:
 *   Redis connection settings resolver — đọc thông tin kết nối Redis từ biến môi trường.
 *   Các thư viện ioredis, node-redis, socket adapter chia sẻ cùng quy tắc biến môi trường.
 *
 *   Hai cách kết nối Redis:
 *   1. REDIS_URL: chuỗi kết nối đầy đủ (ví dụ: "redis://user:password@localhost:6379/0")
 *      - Dạng thường được cung cấp bởi dịch vụ cloud (AWS ElastiCache, v.v.)
 *   2. REDIS_HOST + REDIS_PORT + REDIS_PASSWORD: cấu hình riêng lẻ
 *      - Dùng khi phát triển local hoặc cần cấu hình chi tiết
 *
 *   Nếu không có cả hai, Redis bị vô hiệu hóa và ứng dụng chạy không có cache.
 */
import { ConfigService } from '@nestjs/config';

/**
 * 한국어: Redis 연결 정보를 담는 인터페이스
 * Tiếng Việt: Interface chứa thông tin kết nối Redis
 */
export interface RedisConnectionInfo {
  enabled: boolean;    // 한국어: Redis 활성화 여부 / Tiếng Việt: Redis có bật không
  url?: string;        // 한국어: 전체 연결 URL / Tiếng Việt: URL kết nối đầy đủ
  host?: string;       // 한국어: Redis 서버 주소 / Tiếng Việt: Địa chỉ server Redis
  port: number;        // 한국어: 포트 번호 (기본 6379) / Tiếng Việt: Số port (mặc định 6379)
  username?: string;   // 한국어: 인증 사용자명 / Tiếng Việt: Tên người dùng xác thực
  password?: string;   // 한국어: 인증 비밀번호 / Tiếng Việt: Mật khẩu xác thực
  db: number;          // 한국어: Redis DB 번호 (기본 0) / Tiếng Việt: Số DB Redis (mặc định 0)
}

/**
 * 한국어: 환경변수에서 Redis 연결 정보를 해석하여 반환합니다.
 *   우선순위: REDIS_URL > REDIS_HOST > 비활성화
 *
 * Tiếng Việt: Đọc và trả về thông tin kết nối Redis từ biến môi trường.
 *   Ưu tiên: REDIS_URL > REDIS_HOST > vô hiệu hóa
 */
export function resolveRedisConnectionInfo(
  configService: ConfigService,
): RedisConnectionInfo {
  const redisUrl = configService.get<string>('REDIS_URL');
  const redisHost = configService.get<string>('REDIS_HOST');

  // 방법 1: REDIS_URL이 있으면 URL로 연결 / Cách 1: Nếu có REDIS_URL, kết nối bằng URL
  if (redisUrl) {
    return {
      enabled: true,
      url: redisUrl,
      port: 6379,
      db: 0,
    };
  }

  // 방법 2: REDIS_HOST가 있으면 개별 설정으로 연결 / Cách 2: Nếu có REDIS_HOST, kết nối bằng cấu hình riêng
  if (redisHost) {
    return {
      enabled: true,
      host: redisHost,
      port: configService.get<number>('REDIS_PORT', 6379),
      username: configService.get<string>('REDIS_USERNAME') ?? undefined,
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
      db: configService.get<number>('REDIS_DB', 0),
    };
  }

  // 둘 다 없으면 Redis 비활성화 — 앱은 캐시 없이 동작
  // Không có cả hai — vô hiệu hóa Redis, ứng dụng chạy không cache
  return {
    enabled: false,
    port: 6379,
    db: 0,
  };
}
