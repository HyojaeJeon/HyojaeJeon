import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../realtime.service';
import { RealtimeTopics } from '../topics/realtime-topics';

export interface BrandProfileChangedPayload {
  requestId: string;
  brandHQId: string;
  status: 'UPDATED';
}

export interface BrandCatalogChangedPayload {
  requestId: string;
  brandHQId: string;
  status: 'UPDATED' | 'PUBLISHED' | 'REVOKED';
}

export interface BrandDeployReleasedPayload {
  requestId: string;
  brandHQId: string;
  releaseId: string;
  status: 'RELEASED';
}

@Injectable()
export class BrandRealtimePublisher {
  constructor(private readonly realtime: RealtimeService) {}

  publishProfileChanged(payload: BrandProfileChangedPayload): void {
    this.realtime.publish(RealtimeTopics.brand.profile.changed(payload.brandHQId), payload);
  }

  publishCatalogChanged(payload: BrandCatalogChangedPayload): void {
    this.realtime.publish(RealtimeTopics.brand.catalog.changed(payload.brandHQId), payload);
  }

  publishDeployReleased(payload: BrandDeployReleasedPayload): void {
    this.realtime.publish(RealtimeTopics.brand.deploy.released(payload.brandHQId), payload);
  }
}
