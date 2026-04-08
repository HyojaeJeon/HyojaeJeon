import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { randomUUID } from 'crypto';
import { resolveRedisConnectionInfo } from './redis-connection';

type HealthStatus = 'ok' | 'degraded' | 'disabled' | 'error';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly enabled: boolean;
  private readonly client: Redis | null;

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

  async onModuleInit() {
    if (!this.client) return;
    await this.client.connect();
  }

  async onModuleDestroy() {
    if (!this.client) return;
    await this.client.quit();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

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

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

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

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.client) return false;

    if (ttlSeconds && ttlSeconds > 0) {
      const result = await this.client.set(key, value, 'EX', ttlSeconds);
      return result === 'OK';
    }

    const result = await this.client.set(key, value);
    return result === 'OK';
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    return this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client) return false;
    return (await this.client.expire(key, ttlSeconds)) === 1;
  }

  async acquireLock(
    key: string,
    ttlSeconds = 30,
    token: string = randomUUID(),
  ): Promise<string | null> {
    if (!this.client) return null;

    const result = await this.client.call('SET', key, token, 'NX', 'EX', String(ttlSeconds));
    return result === 'OK' ? token : null;
  }

  async releaseLock(key: string, token: string): Promise<boolean> {
    if (!this.client) return false;

    const current = await this.client.get(key);
    if (current !== token) return false;

    await this.client.del(key);
    return true;
  }

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

  async publish(channel: string, payload: Record<string, unknown>): Promise<number | null> {
    if (!this.client) return null;
    return this.client.publish(channel, JSON.stringify(payload));
  }

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

  async healthSnapshot(): Promise<{ enabled: boolean; status: HealthStatus }> {
    return {
      enabled: this.enabled,
      status: await this.ping(),
    };
  }

  private serialize(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof Date) return value.toISOString();
    return JSON.stringify(value);
  }
}
