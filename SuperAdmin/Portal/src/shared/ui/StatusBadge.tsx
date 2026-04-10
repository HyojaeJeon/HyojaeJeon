'use client';

import { Badge } from '@platform/shared-ui';

type TenantStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'PENDING'
  | 'TRIAL'
  | 'REVOKED'
  | 'EXPIRED'
  | string;

const TONE_MAP: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  ACTIVE: 'success',
  TRIAL: 'info',
  PENDING: 'warning',
  SUSPENDED: 'warning',
  EXPIRED: 'danger',
  TERMINATED: 'danger',
  REVOKED: 'danger',
};

export function StatusBadge({ status }: { status: TenantStatus }) {
  const tone = TONE_MAP[status] ?? 'neutral';
  return (
    <Badge tone={tone} startDot>
      {status}
    </Badge>
  );
}
