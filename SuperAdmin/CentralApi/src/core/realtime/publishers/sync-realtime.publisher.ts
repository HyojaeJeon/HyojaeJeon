import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../realtime.service';
import { RealtimeTopics } from '../topics/realtime-topics';

export interface SyncUpstreamAcceptedPayload {
  requestId: string;
  status: 'ACCEPTED';
  eventType: string;
}

export interface SyncUpstreamDuplicatePayload {
  requestId: string;
  status: 'ALREADY_PROCESSED';
  eventType: string;
  reason: 'REDIS_LOCK' | 'P2002';
}

@Injectable()
export class SyncRealtimePublisher {
  constructor(private readonly realtime: RealtimeService) {}

  publishUpstreamAccepted(edgePosId: string, payload: SyncUpstreamAcceptedPayload): void {
    this.realtime.publish(RealtimeTopics.sync.upstream.accepted(edgePosId), payload);
  }

  publishUpstreamDuplicate(edgePosId: string, payload: SyncUpstreamDuplicatePayload): void {
    this.realtime.publish(RealtimeTopics.sync.upstream.duplicate(edgePosId), payload);
  }
}

