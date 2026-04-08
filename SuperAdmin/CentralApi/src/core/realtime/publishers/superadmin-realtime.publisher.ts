import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../realtime.service';
import { RealtimeTopics } from '../topics/realtime-topics';

export interface SuperAdminAuditCreatedPayload {
  requestId: string;
  auditId: string;
  status: 'CREATED' | 'UPDATED';
}

export interface SuperAdminPolicyChangedPayload {
  requestId: string;
  policyId: string;
  status: 'UPDATED';
}

export interface SuperAdminLicenseChangedPayload {
  requestId: string;
  licenseId: string;
  status: 'UPDATED' | 'REVOKED' | 'ISSUED';
}

@Injectable()
export class SuperAdminRealtimePublisher {
  constructor(private readonly realtime: RealtimeService) {}

  publishAuditCreated(payload: SuperAdminAuditCreatedPayload): void {
    this.realtime.publish(RealtimeTopics.platform.superadmin.auditCreated(), payload);
  }

  publishPolicyChanged(payload: SuperAdminPolicyChangedPayload): void {
    this.realtime.publish(RealtimeTopics.platform.superadmin.policyChanged(), payload);
  }

  publishLicenseChanged(payload: SuperAdminLicenseChangedPayload): void {
    this.realtime.publish(RealtimeTopics.platform.superadmin.licenseChanged(), payload);
  }
}
