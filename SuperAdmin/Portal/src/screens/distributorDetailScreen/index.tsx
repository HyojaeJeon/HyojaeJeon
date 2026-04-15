'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DetailPageTemplate, SectionCard, Badge, Button, Skeleton } from '@platform/shared-ui';
import { DISTRIBUTOR_DETAIL_QUERY, type DistributorDetailData } from '@graphql/queries/distributor';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { formatDateTime } from '@shared/utils/format';
import { LicenseSection } from '@screens/common/LicenseSection';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5 text-[12.5px]">
      <span className="w-32 shrink-0 text-fg-muted">{label}</span>
      <span className="text-fg">{value ?? '—'}</span>
    </div>
  );
}

export function DistributorDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.DISTRIBUTOR_PROFILE_READ);

  const { data, loading, error } = useQuery<DistributorDetailData>(DISTRIBUTOR_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;

  const d = data?.distributor.success?.data;

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.distributors'), href: '/tenants/distributors' },
          { label: d?.distributorCode ?? '…' },
        ],
        title: d ? d.companyName : t('common.loading'),
        description: d ? (
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-fg-muted">{d.distributorCode}</span>
            <Badge tone="info" variant="soft">{d.countryCode}</Badge>
            <StatusBadge status={d.status} />
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-DIST-002</code>,
        actions: (
          <Button variant="ghost" size="md" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/tenants/distributors')}>
            Back
          </Button>
        ),
      }}
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
          {error.message}
        </div>
      )}
      <SectionCard title="Overview" description="DistributorProfile">
        {loading && !d ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={20} />)}
          </div>
        ) : d ? (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            <Field label="Distributor code" value={<span className="font-mono">{d.distributorCode}</span>} />
            <Field label="Company name" value={d.companyName} />
            <Field label="Legal name" value={d.legalName} />
            <Field label="Business number" value={d.businessNumber} />
            <Field label="Country" value={d.countryCode} />
            <Field label="Status" value={<StatusBadge status={d.status} />} />
            <Field label="Created" value={<span className="num font-mono">{formatDateTime(d.createdAt)}</span>} />
            <Field label="Updated" value={<span className="num font-mono">{formatDateTime(d.updatedAt)}</span>} />
          </div>
        ) : (
          <div className="text-fg-subtle text-[12.5px]">{t('common.empty')}</div>
        )}
      </SectionCard>

      {/* License Management */}
      {id && d && (
        <div className="mt-4">
          <LicenseSection scopeType="REGIONAL_DISTRIBUTOR" scopeId={id} entityName={d.companyName} />
        </div>
      )}
    </DetailPageTemplate>
  );
}
