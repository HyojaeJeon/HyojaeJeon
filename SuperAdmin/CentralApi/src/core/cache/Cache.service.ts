/**
 * 한국어: CacheService — Redis primitive 위에 얇은 cache helper layer + InMemoryLRU fallback.
 *
 *   이 계층은 cache key 생성 규칙(CachePolicies)과 JSON/string read-write,
 *   index 기반 무효화, remember 패턴을 중앙화한다.
 *   RedisService 는 여전히 low-level primitive 로 남기고, policy / TTL 는 이 층에서 다룬다.
 *
 *   P0-4: Redis 비활성/장애 시 내부 InMemoryLRU 로 자동 fallback.
 *         remember/get/set/del 모두 Redis 실패 시에도 안정 동작.
 *   P2-2: rememberJson() 에 single-flight 패턴 적용. 동시 다중 요청이 같은 key 를
 *         로드하려고 할 때 하나만 loader 실행 (process-local).
 *
 * Tiếng Việt: CacheService — lớp helper mỏng phía trên Redis, có fallback LRU cục bộ.
 */
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@core/redis/Redis.service';
import type { CacheDescriptor } from './cachePolicies';

interface LruEntry {
  value: string;
  expiresAt: number; // epoch ms; 0 = no expiry
}

/**
 * 한국어: 최소한의 TTL 지원 LRU 맵. Redis 장애 시 in-process fallback 으로 사용.
 *   - Map 의 삽입 순서 유지를 이용해 가장 오래된 key 를 evict.
 *   - get 호출 시 re-insert 로 recency 갱신.
 */
class SimpleLruCache {
  private readonly store = new Map<string, LruEntry>();
  constructor(private readonly maxEntries: number) {}

  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== 0 && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    // recency 갱신: 재삽입
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: string, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      // evict oldest
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly fallback = new SimpleLruCache(10_000);
  /**
   * P2-2: process-local single-flight. 같은 key 가 이미 in-flight 이면 동일 promise 를 재사용한다.
   *   서버가 수평 확장되어도 각 프로세스 단위의 stampede 만 방어한다. 전역 lock 은
   *   redis.acquireLock 을 사용한 별도 경로에서 강화할 수 있다.
   */
  private readonly inflight = new Map<string, Promise<unknown>>();

  constructor(private readonly redis: RedisService) {}

  isEnabled(): boolean {
    return this.redis.isEnabled();
  }

  async get(key: string): Promise<string | null> {
    if (this.redis.isEnabled()) {
      try {
        const value = await this.redis.get(key);
        if (value !== null) return value;
      } catch (err) {
        this.logger.warn(`Redis get failed for ${key}, using fallback: ${(err as Error).message}`);
      }
    }
    return this.fallback.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Failed to parse cache JSON for ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    this.fallback.set(key, value, ttlSeconds);
    if (this.redis.isEnabled()) {
      try {
        return await this.redis.set(key, value, ttlSeconds);
      } catch (err) {
        this.logger.warn(`Redis set failed for ${key}, fallback only: ${(err as Error).message}`);
      }
    }
    return true; // fallback set 성공
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    if (value === undefined) return false;
    return this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async del(key: string): Promise<number> {
    this.fallback.delete(key);
    if (this.redis.isEnabled()) {
      try {
        return await this.redis.del(key);
      } catch (err) {
        this.logger.warn(`Redis del failed for ${key}, fallback only: ${(err as Error).message}`);
      }
    }
    return 1;
  }

  async delMany(keys: readonly string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.del(key)));
  }

  /**
   * P2-2: single-flight 가 적용된 remember 패턴.
   *   동일 key 에 대해 동시에 여러 요청이 cache miss 를 기록해도 loader 는 한 번만 실행된다.
   */
  async rememberJson<T>(
    descriptor: CacheDescriptor,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.getJson<T>(descriptor.key);
    if (cached !== null) {
      return cached;
    }

    const pending = this.inflight.get(descriptor.key);
    if (pending) {
      return pending as Promise<T>;
    }

    const promise = (async () => {
      try {
        const value = await loader();
        await this.setJson(descriptor.key, value, descriptor.ttlSeconds);

        if (descriptor.indexKey) {
          await this.trackIndex(
            descriptor.indexKey,
            descriptor.key,
            descriptor.indexTtlSeconds ?? descriptor.ttlSeconds * 4,
          );
        }

        return value;
      } finally {
        this.inflight.delete(descriptor.key);
      }
    })();

    this.inflight.set(descriptor.key, promise);
    return promise;
  }

  async trackIndex(
    indexKey: string,
    cacheKey: string,
    ttlSeconds = 240,
  ): Promise<void> {
    const current = (await this.getJson<string[]>(indexKey)) ?? [];
    if (!current.includes(cacheKey)) {
      current.push(cacheKey);
      await this.setJson(indexKey, current, ttlSeconds);
    }
  }

  async invalidateIndex(indexKey: string): Promise<void> {
    const keys = (await this.getJson<string[]>(indexKey)) ?? [];
    if (keys.length > 0) {
      await this.delMany(keys);
    }
    await this.del(indexKey);
  }
}
