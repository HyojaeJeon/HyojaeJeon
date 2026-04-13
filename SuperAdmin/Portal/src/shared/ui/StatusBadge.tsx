'use client';

import { Badge } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';

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
  // Contract statuses
  REQUESTED: 'info',
  DRAFT: 'neutral',
  INTERNAL_REVIEW: 'warning',
  SENT_TO_PARTY: 'info',
  NEGOTIATING: 'warning',
  AGREED: 'success',
  PENDING_SIGNATURE: 'warning',
  SIGNING: 'info',
  EXCHANGING: 'info',
  EXPIRING: 'warning',
  RENEWED: 'success',
  CANCELLED: 'danger',
};

export function StatusBadge({ status }: { status: TenantStatus }) {
  const { t } = useI18n();
  const tone = TONE_MAP[status] ?? 'neutral';
  const label = t(`enum.status.${status}`);
  return (
    <Badge tone={tone} startDot>
      {label !== `enum.status.${status}` ? label : status}
    </Badge>
  );
}
