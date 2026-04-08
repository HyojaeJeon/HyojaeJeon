import {
  InMemoryLRUCache,
  KeyValueCache,
  KeyValueCacheSetOptions,
} from '@apollo/utils.keyvaluecache';
import { RedisService } from '@core/redis/redis.service';
import { CachePolicies } from '@core/cache/cache-policies';

export class ApolloRedisKeyValueCache implements KeyValueCache<string> {
  private readonly fallback = new InMemoryLRUCache<string>();

  constructor(
    private readonly redisService: RedisService,
    private readonly keyPrefix = CachePolicies.apqPrefix,
  ) {}

  async get(key: string): Promise<string | undefined> {
    const namespacedKey = this.toKey(key);

    if (!this.redisService.isEnabled()) {
      return this.fallback.get(namespacedKey);
    }

    const value = await this.redisService.get(namespacedKey);
    return value ?? undefined;
  }

  async set(
    key: string,
    value: string,
    options?: KeyValueCacheSetOptions,
  ): Promise<void> {
    const namespacedKey = this.toKey(key);

    if (!this.redisService.isEnabled()) {
      await this.fallback.set(namespacedKey, value, options);
      return;
    }

    const ttl = options?.ttl;

    if (typeof ttl === 'number' && ttl > 0) {
      await this.redisService.set(namespacedKey, value, ttl);
      return;
    }

    await this.redisService.set(namespacedKey, value);
  }

  async delete(key: string): Promise<boolean | void> {
    const namespacedKey = this.toKey(key);

    if (!this.redisService.isEnabled()) {
      return this.fallback.delete(namespacedKey);
    }

    await this.redisService.del(namespacedKey);
    return true;
  }

  private toKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }
}
