/**
 * 한국어: CacheService 단위 테스트. (P0-1 / P0-4 / P2-2)
 *   - InMemoryLRU fallback 이 Redis 비활성/장애 시 동작하는지
 *   - rememberJson 의 single-flight 가 동시 다중 호출에서 loader 를 한 번만 실행하는지
 *   - invalidateIndex 가 index 와 키 모두 제거하는지
 */
import { CacheService } from './Cache.service';
import type { CacheDescriptor } from './cachePolicies';

class FakeRedis {
  enabled: boolean;
  store = new Map<string, string>();

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }
  isEnabled() {
    return this.enabled;
  }
  async get(key: string) {
    return this.store.get(key) ?? null;
  }
  async set(key: string, value: string) {
    this.store.set(key, value);
    return true;
  }
  async del(key: string) {
    return this.store.delete(key) ? 1 : 0;
  }
}

const descriptor: CacheDescriptor = { key: 'k1', ttlSeconds: 60 };

describe('CacheService — Redis fallback (P0-4)', () => {
  it('reads from in-memory fallback when Redis is disabled', async () => {
    const redis = new FakeRedis(false);
    const svc = new CacheService(redis as never);
    expect(svc.isEnabled()).toBe(false);

    await svc.set('k1', 'v1');
    const value = await svc.get('k1');
    expect(value).toBe('v1');
    expect(redis.store.size).toBe(0); // fallback only
  });

  it('writes through to Redis AND fallback when Redis is enabled', async () => {
    const redis = new FakeRedis(true);
    const svc = new CacheService(redis as never);

    await svc.set('k1', 'v1');
    expect(redis.store.get('k1')).toBe('v1');
    expect(await svc.get('k1')).toBe('v1');
  });

  it('falls back to in-memory when Redis throws on get', async () => {
    const redis = new FakeRedis(true);
    const error = new Error('connection refused');
    redis.get = jest.fn(async () => {
      throw error;
    });
    const svc = new CacheService(redis as never);

    // 미리 set 으로 fallback 에 저장 (Redis set 은 정상)
    await svc.set('k1', 'fallback-value');
    const result = await svc.get('k1');
    expect(result).toBe('fallback-value');
  });
});

describe('CacheService — single-flight rememberJson (P2-2)', () => {
  it('runs loader only once for concurrent requests on the same key', async () => {
    const redis = new FakeRedis(true);
    const svc = new CacheService(redis as never);
    let calls = 0;
    const loader = jest.fn(async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 10));
      return { hello: 'world' };
    });

    const [a, b, c] = await Promise.all([
      svc.rememberJson(descriptor, loader),
      svc.rememberJson(descriptor, loader),
      svc.rememberJson(descriptor, loader),
    ]);

    expect(a).toEqual({ hello: 'world' });
    expect(b).toEqual({ hello: 'world' });
    expect(c).toEqual({ hello: 'world' });
    expect(calls).toBe(1);
  });

  it('serves subsequent calls from cache without invoking loader again', async () => {
    const redis = new FakeRedis(true);
    const svc = new CacheService(redis as never);
    const loader = jest.fn(async () => ({ n: 1 }));

    await svc.rememberJson(descriptor, loader);
    await svc.rememberJson(descriptor, loader);
    expect(loader).toHaveBeenCalledTimes(1);
  });
});

describe('CacheService — index invalidation', () => {
  it('removes all tracked keys + the index itself', async () => {
    const redis = new FakeRedis(true);
    const svc = new CacheService(redis as never);

    await svc.setJson('rbac:perms:index:BRAND_ADMIN:u1', ['k:scope-a', 'k:scope-b']);
    await svc.set('k:scope-a', 'v-a');
    await svc.set('k:scope-b', 'v-b');

    await svc.invalidateIndex('rbac:perms:index:BRAND_ADMIN:u1');

    expect(await svc.get('k:scope-a')).toBeNull();
    expect(await svc.get('k:scope-b')).toBeNull();
    expect(await svc.get('rbac:perms:index:BRAND_ADMIN:u1')).toBeNull();
  });
});
