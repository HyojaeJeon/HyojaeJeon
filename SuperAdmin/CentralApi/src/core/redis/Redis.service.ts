/**
 * 한국어:
 *   Redis 서비스 — Redis(인메모리 데이터 저장소)와 통신하는 핵심 서비스입니다.
 *   Redis는 데이터를 메모리(RAM)에 저장하므로 DB보다 훨씬 빠릅니다.
 *
 *   주요 기능:
 *   - 캐싱 (get/set/del): 자주 조회하는 데이터를 임시 저장하여 DB 부하를 줄임
 *   - 분산 락 (acquireLock/releaseLock): 여러 서버가 동시에 같은 작업을 하지 않게 잠금
 *   - 메시지 큐 (enqueueStream): 작업을 순서대로 대기열에 넣어 처리
 *   - 속도 제한 (consumeRateLimit): API를 너무 자주 호출하는 것을 막아 남용 방지
 *   - 헬스 체크 (healthSnapshot): Redis 연결 상태를 확인
 *
 *   Redis가 꺼져 있거나 연결에 실패해도 서버는 정상 부팅됩니다 (fail-soft 방식).
 *   이 경우 캐시 미스, 락 건너뜀 등 기능이 저하(degraded)되지만 서비스는 계속됩니다.
 *
 * Tiếng Việt:
 *   Redis Service — service cốt lõi giao tiếp với Redis (kho dữ liệu trong bộ nhớ).
 *   Redis lưu dữ liệu trong RAM nên nhanh hơn database rất nhiều.
 *
 *   Chức năng chính:
 *   - Caching (get/set/del): lưu tạm dữ liệu hay truy vấn để giảm tải DB
 *   - Distributed lock (acquireLock/releaseLock): khóa để nhiều server không chạy cùng tác vụ
 *   - Message queue (enqueueStream): xếp hàng tác vụ để xử lý theo thứ tự
 *   - Rate limiting (consumeRateLimit): ngăn gọi API quá nhiều lần, chống lạm dụng
 *   - Health check (healthSnapshot): kiểm tra trạng thái kết nối Redis
 *
 *   Nếu Redis tắt hoặc kết nối thất bại, server vẫn khởi động bình thường (fail-soft).
 *   Khi đó chức năng bị giảm (cache miss, bỏ qua lock) nhưng dịch vụ vẫn hoạt động.
 */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { randomUUID } from 'crypto';
import { resolveRedisConnectionInfo } from './redisConnection';

// Redis 연결 상태 타입 / Kiểu trạng thái kết nối Redis
// ok: 정상 | degraded: 성능저하 | disabled: 비활성 | error: 오류
type HealthStatus = 'ok' | 'degraded' | 'disabled' | 'error';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private enabled: boolean;
  private client: Redis | null;

  /**
   * 한국어: 생성자 — 환경변수에서 Redis 연결 정보를 읽어 클라이언트를 생성합니다.
   *   - REDIS_URL이 있으면 URL로 연결 (예: redis://localhost:6379)
   *   - REDIS_HOST가 있으면 호스트/포트/비밀번호로 개별 연결
   *   - 둘 다 없으면 Redis를 비활성화하고 null 클라이언트로 동작
   *   lazyConnect: true는 실제 사용 시점까지 연결을 미루는 옵션입니다.
   *
   * Tiếng Việt: Constructor — đọc thông tin kết nối Redis từ biến môi trường và tạo client.
   *   - Nếu có REDIS_URL: kết nối bằng URL (ví dụ: redis://localhost:6379)
   *   - Nếu có REDIS_HOST: kết nối bằng host/port/password riêng lẻ
   *   - Nếu không có cả hai: vô hiệu hóa Redis, dùng client null
   *   lazyConnect: true nghĩa là trì hoãn kết nối cho đến khi thực sự cần.
   */
  constructor(private readonly configService: ConfigService) {
    const info = resolveRedisConnectionInfo(this.configService);

    if (info.url) {
      this.enabled = true;
      this.client = new Redis(info.url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
      });
      return;
    }

    if (info.host) {
      const options: RedisOptions = {
        host: info.host,
        port: info.port,
        username: info.username,
        password: info.password || undefined,
        db: info.db,
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
      };

      this.enabled = true;
      this.client = new Redis(options);
      return;
    }

    this.enabled = false;
    this.client = null;
    this.logger.warn('Redis is disabled because REDIS_URL / REDIS_HOST is not configured');
  }

  /**
   * 한국어: 모듈 초기화 시 Redis 연결을 시도합니다. (fail-soft 방식)
   *   제한 시간(기본 5초) 내에 연결되지 않으면 Redis를 비활성화하고 서버는 계속 부팅합니다.
   *   즉, Redis가 죽어있어도 서버는 정상 작동하되 캐시 기능만 빠집니다.
   *
   * Tiếng Việt: Kết nối Redis khi module khởi tạo. (fail-soft)
   *   Nếu không kết nối được trong thời gian giới hạn (mặc định 5 giây), Redis bị vô hiệu hóa
   *   nhưng server vẫn khởi động bình thường. Chỉ mất chức năng cache.
   */
  async onModuleInit() {
    if (!this.client) return;
    // fail-soft: Redis 가 다운되어도 서버 부팅을 막지 않는다.
    //   - 5초 timeout 내에 연결 실패하면 client 를 disable
    //   - 이후 모든 메서드는 disabled 분기 (이미 client === null 체크 존재)
    //   - 서비스 단위 기능은 cache miss / publish skip 으로 degrade
    const CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 5000);
    try {
      await Promise.race([
        this.client.connect(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Redis connect timeout (${CONNECT_TIMEOUT_MS}ms)`)), CONNECT_TIMEOUT_MS),
        ),
      ]);
      this.logger.log('Redis connected');
    } catch (error) {
      this.logger.warn(
        `Redis connect failed (degraded mode, server will continue): ${(error as Error).message}`,
      );
      // disable client so all subsequent calls return safe defaults
      try {
        this.client.disconnect();
      } catch {
        // ignore
      }
      this.client = null;
      this.enabled = false;
    }
  }

  // 한국어: 앱 종료 시 Redis 연결을 안전하게 닫습니다
  // Tiếng Việt: Đóng kết nối Redis an toàn khi ứng dụng tắt
  async onModuleDestroy() {
    if (!this.client) return;
    await this.client.quit();
  }

  // 한국어: Redis가 활성화되어 있는지 확인 / Tiếng Việt: Kiểm tra Redis có đang hoạt động không
  isEnabled(): boolean {
    return this.enabled;
  }

  // 한국어: 별도의 Redis 연결을 복제 생성 (구독 등 독립 연결이 필요할 때)
  // Tiếng Việt: Tạo bản sao kết nối Redis riêng (khi cần kết nối độc lập cho subscription, v.v.)
  duplicateConnection(): Redis | null {
    if (!this.client) return null;
    return this.client.duplicate({
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });
  }

  // 한국어: Redis 서버에 PING을 보내 응답 상태를 확인합니다
  // Tiếng Việt: Gửi PING đến Redis server để kiểm tra trạng thái phản hồi
  async ping(): Promise<HealthStatus> {
    if (!this.client) return 'disabled';

    try {
      const pong = await this.client.ping();
      return pong === 'PONG' ? 'ok' : 'error';
    } catch (error) {
      this.logger.error(`Redis ping failed: ${(error as Error).message}`);
      return 'error';
    }
  }

  // ── 기본 캐시 조작 (Basic cache operations) ──────────────────────────
  // 한국어: 키로 값을 조회합니다. Redis가 비활성이면 null 반환 (캐시 미스와 동일하게 처리)
  // Tiếng Việt: Lấy giá trị theo key. Nếu Redis tắt, trả về null (xử lý giống cache miss)
  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  // 한국어: JSON 문자열을 파싱하여 객체로 반환. 파싱 실패 시 null
  // Tiếng Việt: Parse chuỗi JSON thành object. Trả về null nếu parse thất bại
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(`Failed to parse Redis JSON for key ${key}: ${(error as Error).message}`);
      return null;
    }
  }

  // 한국어: 키-값 쌍을 저장합니다. ttlSeconds를 지정하면 그 시간 후 자동 삭제됩니다.
  // Tiếng Việt: Lưu cặp key-value. Nếu chỉ định ttlSeconds, tự xóa sau khoảng thời gian đó.
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.client) return false;

    if (ttlSeconds && ttlSeconds > 0) {
      const result = await this.client.set(key, value, 'EX', ttlSeconds);
      return result === 'OK';
    }

    const result = await this.client.set(key, value);
    return result === 'OK';
  }

  // 한국어: 객체를 JSON 문자열로 변환하여 저장 / Tiếng Việt: Chuyển object thành chuỗi JSON rồi lưu
  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    return this.set(key, JSON.stringify(value), ttlSeconds);
  }

  // 한국어: 키를 삭제합니다. 삭제된 키 수를 반환 / Tiếng Việt: Xóa key. Trả về số key đã xóa
  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.del(key);
  }

  // 한국어: 키의 숫자 값을 1 증가시킵니다 (카운터 용도) / Tiếng Việt: Tăng giá trị số của key lên 1 (dùng làm counter)
  async incr(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.incr(key);
  }

  // 한국어: 키의 만료 시간을 설정합니다 (초 단위) / Tiếng Việt: Đặt thời gian hết hạn cho key (tính bằng giây)
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client) return false;
    return (await this.client.expire(key, ttlSeconds)) === 1;
  }

  // ── 분산 락 (Distributed Locking) ──────────────────────────────────
  /**
   * 한국어: 분산 락을 획득합니다.
   *   여러 서버가 동시에 같은 작업(예: 결제 처리)을 실행하면 중복 문제가 생깁니다.
   *   이 메서드는 Redis의 SET NX(키가 없을 때만 설정) 명령으로 "잠금"을 걸어,
   *   한 서버만 작업을 수행하게 합니다. ttlSeconds 후 자동으로 잠금이 풀립니다.
   *   반환값: 잠금 성공 시 token(해제 시 필요), 실패 시 null
   *
   * Tiếng Việt: Chiếm distributed lock.
   *   Khi nhiều server chạy cùng tác vụ (ví dụ: xử lý thanh toán), sẽ gây trùng lặp.
   *   Method này dùng lệnh SET NX của Redis (chỉ set khi key chưa tồn tại) để "khóa",
   *   chỉ cho phép một server thực hiện. Lock tự mở sau ttlSeconds.
   *   Trả về: token nếu thành công (cần khi giải khóa), null nếu thất bại
   */
  async acquireLock(
    key: string,
    ttlSeconds = 30,
    token: string = randomUUID(),
  ): Promise<string | null> {
    if (!this.client) return null;

    const result = await this.client.call('SET', key, token, 'NX', 'EX', String(ttlSeconds));
    return result === 'OK' ? token : null;
  }

  /**
   * 한국어: 분산 락을 해제합니다. 본인이 건 잠금(token 일치)만 해제할 수 있습니다.
   * Tiếng Việt: Giải phóng distributed lock. Chỉ giải được lock do chính mình tạo (token khớp).
   */
  async releaseLock(key: string, token: string): Promise<boolean> {
    if (!this.client) return false;

    const current = await this.client.get(key);
    if (current !== token) return false;

    await this.client.del(key);
    return true;
  }

  // ── 메시지 큐 (Message Queue) ──────────────────────────────────────
  /**
   * 한국어: Redis Stream에 메시지를 추가합니다 (메시지 큐 역할).
   *   작업을 바로 처리하지 않고 대기열에 넣어서, 워커가 순서대로 꺼내 처리합니다.
   *   maxLength는 스트림 최대 길이로, 오래된 메시지는 자동 정리됩니다.
   *
   * Tiếng Việt: Thêm message vào Redis Stream (dùng làm hàng đợi tin nhắn).
   *   Thay vì xử lý ngay, đưa tác vụ vào hàng đợi để worker lấy ra xử lý theo thứ tự.
   *   maxLength là độ dài tối đa của stream, message cũ tự động bị dọn.
   */
  async enqueueStream(
    streamKey: string,
    payload: Record<string, unknown>,
    maxLength = 10000,
  ): Promise<string | null> {
    if (!this.client) return null;

    const entries: string[] = [];
    for (const [key, value] of Object.entries(payload)) {
      entries.push(key, this.serialize(value));
    }

    return this.client.xadd(streamKey, 'MAXLEN', '~', maxLength, '*', ...entries);
  }

  // 한국어: Pub/Sub 채널에 메시지를 발행합니다 (구독 중인 모든 클라이언트에 전달)
  // Tiếng Việt: Phát message lên kênh Pub/Sub (gửi đến tất cả client đang subscribe)
  async publish(channel: string, payload: Record<string, unknown>): Promise<number | null> {
    if (!this.client) return null;
    return this.client.publish(channel, JSON.stringify(payload));
  }

  // ── 속도 제한 (Rate Limiting) ──────────────────────────────────────
  /**
   * 한국어: API 호출 속도를 제한합니다 (남용 방지).
   *   windowSeconds(시간 창) 동안 limit(최대 횟수)를 초과하면 allowed: false를 반환합니다.
   *   예: 로그인 시도를 60초 동안 5회로 제한 → consumeRateLimit('login:user1', 5, 60)
   *   Redis가 비활성이면 항상 허용합니다 (서비스 중단보다 허용이 낫다는 판단).
   *
   * Tiếng Việt: Giới hạn tốc độ gọi API (chống lạm dụng).
   *   Nếu vượt quá limit (số lần tối đa) trong windowSeconds (cửa sổ thời gian),
   *   trả về allowed: false.
   *   Ví dụ: giới hạn đăng nhập 5 lần trong 60 giây → consumeRateLimit('login:user1', 5, 60)
   *   Nếu Redis tắt, luôn cho phép (ưu tiên hoạt động hơn là từ chối).
   */
  async consumeRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; count: number; remaining: number }> {
    if (!this.client) {
      return {
        allowed: true,
        count: 0,
        remaining: limit,
      };
    }

    const count = await this.incr(key);
    if (count === 1) {
      await this.expire(key, windowSeconds);
    }

    return {
      allowed: count <= limit,
      count,
      remaining: Math.max(limit - count, 0),
    };
  }

  // 한국어: Redis 전체 상태를 한눈에 확인 (활성화 여부 + 연결 상태)
  // Tiếng Việt: Xem tổng quan trạng thái Redis (có bật không + trạng thái kết nối)
  async healthSnapshot(): Promise<{ enabled: boolean; status: HealthStatus }> {
    return {
      enabled: this.enabled,
      status: await this.ping(),
    };
  }

  // 한국어: 다양한 타입의 값을 문자열로 변환하는 내부 헬퍼 (Redis는 문자열만 저장 가능)
  // Tiếng Việt: Helper nội bộ chuyển đổi các kiểu giá trị thành chuỗi (Redis chỉ lưu chuỗi)
  private serialize(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof Date) return value.toISOString();
    return JSON.stringify(value);
  }
}
