/**
 * 한국어: Redis connection settings resolver.
 *   ioredis / node-redis / socket adapter 가 같은 환경변수 규칙을 공유하도록 한다.
 */
import { ConfigService } from '@nestjs/config';

export interface RedisConnectionInfo {
  enabled: boolean;
  url?: string;
  host?: string;
  port: number;
  username?: string;
  password?: string;
  db: number;
}

export function resolveRedisConnectionInfo(
  configService: ConfigService,
): RedisConnectionInfo {
  const redisUrl = configService.get<string>('REDIS_URL');
  const redisHost = configService.get<string>('REDIS_HOST');

  if (redisUrl) {
    return {
      enabled: true,
      url: redisUrl,
      port: 6379,
      db: 0,
    };
  }

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

  return {
    enabled: false,
    port: 6379,
    db: 0,
  };
}
