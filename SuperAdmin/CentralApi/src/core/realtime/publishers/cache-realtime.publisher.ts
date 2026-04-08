import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../realtime.service';
import { RealtimeTopics } from '../topics/realtime-topics';
import type { RealtimeAudience } from '../audience/realtime-audience.types';

export interface CacheInvalidatedPayload {
  requestId: string;
  status: 'INVALIDATED';
  namespace: string;
  keys: string[];
  reason: string;
}

@Injectable()
export class CacheRealtimePublisher {
  constructor(private readonly realtime: RealtimeService) {}

  publishInvalidated(
    audience: RealtimeAudience,
    payload: CacheInvalidatedPayload,
  ): void {
    this.realtime.publish(RealtimeTopics.cache.invalidated(audience), payload);
  }
}
