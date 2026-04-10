'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DetailPageTemplate, SectionCard, Badge, Button, Skeleton } from '@platform/shared-ui';
import { LICENSE_DETAIL_QUERY, type LicenseDetailData } from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';

export function LicenseDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.PLATFORM_AUDIT_READ);

  const { data, loading, error } = useQuery<LicenseDetailData>(LICENSE_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;
  const l = data?.license.success?.data;

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.governance') },
          { label: t('nav.governance.licenses'), href: '/governance/licenses' },
          { label: l?.licenseCode ?? '…' },
        ],
        title: l ? l.licenseCode : t('common.loading'),
        description: l ? (
          <span className="flex items-center gap-2">
            <Badge tone="info" variant="soft">{l.licenseType}</Badge>
            <Badge tone="neutral" variant="soft">{l.scopeType}</Badge>
            <StatusBadge status={l.status} />
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-LIC-002</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/governance/licenses')}>
            Back
          </Button>
        ),
      }}
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error.message}</div>
      )}
      <SectionCard title="License" description="PlatformLicense">
        {loading && !l ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={22} />)}</div>
        ) : l ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
            <div className="flex gap-3"><span className="w-36 text-fg-muted">License code</span><span className="font-mono text-fg">{l.licenseCode}</span></div>
            <div className="flex gap-3"><span className="w-36 text-fg-muted">License type</span><span className="text-fg">{l.licenseType}</span></div>
            <div className="flex gap-3"><span className="w-36 text-fg-muted">Scope</span><span className="text-fg">{l.scopeType} · {l.scopeId ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-36 text-fg-muted">Country</span><span className="text-fg">{l.allowedCountryCode ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-36 text-fg-muted">Effective from</span><span className="num font-mono text-fg">{formatDateTime(l.effectiveFrom)}</span></div>
            <div className="flex gap-3"><span className="w-36 text-fg-muted">Effective to</span><span className="num font-mono text-fg">{l.effectiveTo ? formatDateTime(l.effectiveTo) : '∞'}</span></div>
            <div className="flex gap-3"><span className="w-36 text-fg-muted">Created</span><span className="num font-mono text-fg">{formatDateTime(l.createdAt)}</span></div>
            <div className="flex gap-3"><span className="w-36 text-fg-muted">Updated</span><span className="num font-mono text-fg">{formatDateTime(l.updatedAt)}</span></div>
            <div className="col-span-2 mt-3">
              <div className="text-fg-muted text-[11px] mb-1">Payload JSON</div>
              <pre className="rounded-md border bg-surface-1 p-3 font-mono text-[11px] text-fg-muted overflow-auto" style={{ borderColor: 'var(--border)' }}>
                {JSON.stringify(l.licensePayloadJson, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </SectionCard>
    </DetailPageTemplate>
  );
}
