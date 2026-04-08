import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../realtime.service';
import { RealtimeTopics } from '../topics/realtime-topics';

export interface EdgePosTerminalChangedPayload {
  requestId: string;
  edgePosId: string;
  branchId?: string;
  status: 'UPDATED' | 'REGISTERED' | 'DECOMMISSIONED';
}

export interface EdgePosRuntimeHeartbeatPayload {
  requestId: string;
  edgePosId: string;
  heartbeatAt: string;
  status: 'HEARTBEAT';
}

@Injectable()
export class EdgePosRealtimePublisher {
  constructor(private readonly realtime: RealtimeService) {}

  publishTerminalChanged(payload: EdgePosTerminalChangedPayload): void {
    this.realtime.publish(RealtimeTopics.edgePos.terminal.changed(payload.edgePosId), payload);
  }

  publishRuntimeHeartbeat(payload: EdgePosRuntimeHeartbeatPayload): void {
    this.realtime.publish(RealtimeTopics.edgePos.runtime.heartbeat(payload.edgePosId), payload);
  }
}

