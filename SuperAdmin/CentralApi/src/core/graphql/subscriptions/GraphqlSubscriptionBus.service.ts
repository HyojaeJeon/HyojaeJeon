import { randomUUID } from 'node:crypto';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type Redis from 'ioredis';
import { PubSub } from 'graphql-subscriptions';
import { RedisService } from '@core/redis/Redis.service';

interface SubscriptionEnvelope {
  sourceInstanceId: string;
  topic: string;
  payload: unknown;
}

@Injectable()
export class GraphqlSubscriptionBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GraphqlSubscriptionBusService.name);
  private readonly pubSub = new PubSub();
  private readonly instanceId = randomUUID();
  private readonly redisChannel = 'graphql:subscription';
  private subscriber: Redis | null = null;

  constructor(private readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {
    const subscriber = this.redis.duplicateConnection();
    if (!subscriber) return;
    this.subscriber = subscriber;

    try {
      await subscriber.connect();
      await subscriber.subscribe(this.redisChannel);
      subscriber.on('message', (_channel, message) => {
        void this.handleRedisMessage(message);
      });
    } catch (error) {
      this.logger.warn(
        `Redis subscription bus disabled (continuing in local-only mode): ${(error as Error).message}`,
      );
      try {
        subscriber.disconnect();
      } catch {
        // ignore
      }
      this.subscriber = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.subscriber) return;
    await this.subscriber.quit();
  }

  async publish<TPayload>(topic: string, payload: TPayload): Promise<void> {
    await this.pubSub.publish(topic, { [topic]: payload });

    if (!this.redis.isEnabled()) return;
    await this.redis.publish(this.redisChannel, {
      sourceInstanceId: this.instanceId,
      topic,
      payload,
    });
  }

  asyncIterator<TPayload>(topic: string) {
    return this.pubSub.asyncIterableIterator<{ [key: string]: TPayload }>(topic);
  }

  private async handleRedisMessage(rawMessage: string): Promise<void> {
    try {
      const envelope = JSON.parse(rawMessage) as SubscriptionEnvelope;
      if (!envelope.topic || envelope.sourceInstanceId === this.instanceId) return;
      await this.pubSub.publish(envelope.topic, {
        [envelope.topic]: envelope.payload,
      });
    } catch (error) {
      this.logger.warn(`Failed to process redis subscription payload: ${(error as Error).message}`);
    }
  }
}
