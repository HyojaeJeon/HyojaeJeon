'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Power, PowerOff } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Select,
  DatePicker,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  MERCHANT_ENROLLMENTS_QUERY,
  ENROLL_MERCHANT_MUTATION,
  ACTIVATE_MERCHANT_MUTATION,
  DEACTIVATE_MERCHANT_MUTATION,
  type MerchantEnrollmentsData,
  type MerchantEnrollmentRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatDateTime } from '@shared/utils/format';

const LOOP_TYPES = ['OPEN_LOOP', 'CLOSED_LOOP'] as const;

export function CorporateMerchantsScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_MERCHANT_READ);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_MERCHANT_WRITE);

  const { data, loading, refetch } = useQuery<MerchantEnrollmentsData>(MERCHANT_ENROLLMENTS_QUERY, {
    variables: { skip: 0, take: 50 },
    errorPolicy: 'all',
  });

  const [enroll, { loading: enrolling }] = useMutation(ENROLL_MERCHANT_MUTATION, { onCompleted: () => refetch() });
  const [activate, { loading: activating }] = useMutation(ACTIVATE_MERCHANT_MUTATION, { onCompleted: () => refetch() });
  const [deactivate, { loading: deactivating }] = useMutation(DEACTIVATE_MERCHANT_MUTATION, { onCompleted: () => refetch() });

  const [showEnroll, setShowEnroll] = useState(false);
  const [brandId, setBrandId] = useState('');
  const [loopType, setLoopType] = useState<(typeof LOOP_TYPES)[number]>('OPEN_LOOP');
  const [contractEndsAt, setContractEndsAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const enrollments = data?.mealMerchantEnrollments.success?.data ?? [];
  const brands = data?.brands.success?.data ?? [];
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const columns: DataTableColumn<MerchantEnrollmentRow>[] = [
    {
      key: 'brand',
      header: t('field.brand'),
      render: (r) => {
        const b = brandById.get(r.brandHqId);
        return b ? (
          <span>
            <span className="font-mono text-[12px]">{b.brandCode}</span>
            <span className="ml-2 text-fg-muted">{b.brandName}</span>
          </span>
        ) : (
          <span className="font-mono text-[11px] text-fg-subtle">{r.brandHqId.slice(0, 8)}</span>
        );
      },
    },
    { key: 'loop', header: t('field.loopType'), width: '140px', render: (r) => <Badge tone={r.loopType === 'CLOSED_LOOP' ? 'info' : 'brand'} variant="soft">{r.loopType}</Badge> },
    { key: 'active', header: t('field.status'), width: '120px', render: (r) => r.isActive ? <Badge tone="success" startDot>ACTIVE</Badge> : <Badge tone="neutral" startDot>INACTIVE</Badge> },
    { key: 'enrolled', header: t('field.createdAt'), width: '160px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.enrolledAt)}</span> },
    { key: 'ends', header: t('corporate.merchants.contractEnds'), width: '160px', render: (r) => r.contractEndsAt ? <span className="num text-[12px] text-fg-muted">{formatDateTime(r.contractEndsAt)}</span> : <span className="text-fg-subtle">∞</span> },
    {
      key: 'actions',
      header: '',
      width: '180px',
      align: 'right',
      render: (r) =>
        canWrite && (
          <div className="flex items-center justify-end gap-1">
            {r.isActive ? (
              <button
                type="button"
                onClick={() => deactivate({ variables: { enrollmentId: r.id } })}
                disabled={deactivating}
                className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold text-warn hover:bg-warn-soft disabled:opacity-40"
                style={{ borderColor: 'var(--warn)' }}
              >
                <PowerOff size={11} />
                {t('corporate.merchants.deactivate')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => activate({ variables: { enrollmentId: r.id } })}
                disabled={activating}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-success bg-success-soft px-2 text-[11px] font-semibold text-success hover:bg-success hover:text-white disabled:opacity-40"
              >
                <Power size={11} />
                {t('corporate.merchants.activate')}
              </button>
            )}
          </div>
        ),
    },
  ];

  const handleEnroll = async () => {
    setError(null);
    if (!brandId) {
      setError(t('corporate.errorBrandRequired'));
      return;
    }
    const res = await enroll({
      variables: {
        input: {
          brandHqId: brandId,
          loopType,
          contractEndsAt: contractEndsAt ? new Date(contractEndsAt).toISOString() : null,
        },
      },
    });
    const env = res.data?.mealMerchantEnroll;
    if (env?.error) {
      setError(env.error.message);
      return;
    }
    setShowEnroll(false);
    setBrandId('');
    setContractEndsAt('');
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: params?.id?.slice(0, 8) ?? '—', href: `/tenants/corporates/${corporateId}` },
          { label: t('corporate.detail.subnav.merchants') },
        ],
        title: t('corporate.merchants.title'),
        description: t('corporate.merchants.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-MERCH-001</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${corporateId}`)}>
              {t('action.back')}
            </Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowEnroll((v) => !v)}>
                {t('corporate.action.cta.enrollMerchant')}
              </Button>
            )}
          </>
        ),
      }}
      summaryItems={[
        { label: t('corporate.merchants.summary.enrolled'), value: enrollments.length, tone: 'brand' },
        { label: t('corporate.merchants.summary.active'), value: enrollments.filter((e) => e.isActive).length, tone: 'success' },
        { label: t('corporate.merchants.summary.inactive'), value: enrollments.filter((e) => !e.isActive).length, tone: 'neutral' },
      ]}
    >
      {showEnroll && canWrite && (
        <SectionCard title={t('corporate.merchants.formTitle')} description={t('corporate.merchants.formDescription')}>
          <div className="flex flex-col gap-3">
            {error && <div className="rounded-md border border-danger bg-danger-soft p-2 text-[12px] text-danger">{error}</div>}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[12px] font-medium text-fg-muted">{t('field.brand')}</label>
                <Select
                  value={brandId || null}
                  onChange={(v) => setBrandId(String(v))}
                  options={brands.map((b) => ({ value: b.id, label: `${b.brandCode} · ${b.brandName}` }))}
                  placeholder={t('field.selectBrand')}
                  minWidth="100%"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-fg-muted">{t('field.loopType')}</label>
                <Select
                  value={loopType}
                  onChange={(v) => setLoopType(v as (typeof LOOP_TYPES)[number])}
                  options={LOOP_TYPES.map((l) => ({ value: l, label: l }))}
                  minWidth="100%"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[12px] font-medium text-fg-muted">{t('corporate.merchants.contractEnds')}</label>
                <DatePicker value={contractEndsAt || null} onChange={(v) => setContractEndsAt(v ?? '')} minWidth="100%" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowEnroll(false)}>{t('action.cancel')}</Button>
              <Button variant="primary" loading={enrolling} onClick={handleEnroll}>
                {t('action.create')}
              </Button>
            </div>
          </div>
        </SectionCard>
      )}

      <div className={showEnroll ? 'mt-3' : ''}>
        <SectionCard title={t('corporate.merchants.cardTitle')} description={`${enrollments.length} ${t('corporate.merchants.enrollmentCount')}`} padding="none">
          {loading && enrollments.length === 0 ? (
            <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={32} />)}</div>
          ) : (
            <DataTable columns={columns} rows={enrollments} rowKey={(r) => r.id} compact emptyState={t('corporate.merchants.empty')} />
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}

