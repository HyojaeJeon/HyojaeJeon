'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { RefreshCw } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  Pagination,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

import {
  MERCHANT_ENROLLMENTS_QUERY,
  MERCHANT_ACTIVATE_MUTATION,
  MERCHANT_DEACTIVATE_MUTATION,
  type MerchantEnrollmentsData,
  type MerchantEnrollmentRow,
} from '@graphql/queries/merchant';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

type LoopType = 'OPEN_LOOP' | 'CLOSED_LOOP';
const LOOP_TYPE_TONE: Record<LoopType, 'info' | 'neutral'> = {
  OPEN_LOOP: 'info',
  CLOSED_LOOP: 'neutral',
};

const CATEGORY_FILTERS = ['ALL', 'OPEN_LOOP', 'CLOSED_LOOP'] as const;

export function MerchantListScreen() {
  const { t } = useI18n();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.MERCHANT_READ);
  const canWrite = useHasPermission(PERMISSIONS.MERCHANT_ALLOW_WRITE);

  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const corporateId = useCorporateId();
  const { data, loading, refetch } = useQuery<MerchantEnrollmentsData>(MERCHANT_ENROLLMENTS_QUERY, {
    variables: { skip, take },
  });
  const merchants: MerchantEnrollmentRow[] = data?.mealMerchantEnrollments?.success?.data ?? [];
  const totalCount = data?.mealMerchantEnrollments?.success?.totalCount ?? 0;

  const [activate] = useMutation(MERCHANT_ACTIVATE_MUTATION);
  const [deactivate] = useMutation(MERCHANT_DEACTIVATE_MUTATION);

  if (hydrated && !canRead) return <LockedScreen />;

  const handleAllowToggle = async (enrollmentId: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await deactivate({ variables: { enrollmentId } });
      } else {
        await activate({ variables: { enrollmentId } });
      }
      await refetch();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const filteredMerchants =
    activeCategory === 'ALL'
      ? merchants
      : merchants.filter((m) => m.loopType === activeCategory);

  const cols: DataTableColumn<MerchantEnrollmentRow>[] = [
    {
      key: 'brandName',
      header: t('merchant.brandName'),
      render: (r) => (
        <span className="font-semibold text-fg">{r.brandName ?? r.brandHqId.slice(0, 8)}</span>
      ),
    },
    {
      key: 'loopType',
      header: t('merchant.loopType'),
      width: '140px',
      render: (r) => (
        <Badge tone={LOOP_TYPE_TONE[r.loopType as LoopType] ?? 'neutral'} size="sm">
          {t(`loopType.${r.loopType}`)}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: t('merchant.active'),
      width: '120px',
      render: (r) => (
        <Badge tone={r.isActive ? 'success' : 'neutral'} size="sm" startDot>
          {r.isActive ? t('status.ACTIVE') : t('status.INACTIVE')}
        </Badge>
      ),
    },
    {
      key: 'enrolledAt',
      header: t('merchant.enrolledAt'),
      width: '150px',
      render: (r) => <span className="text-fg-muted">{r.enrolledAt ? new Date(r.enrolledAt).toLocaleDateString('ko-KR') : '—'}</span>,
    },
    ...(canWrite
      ? [
          {
            key: 'toggle' as const,
            header: t('merchant.allow'),
            width: '80px',
            render: (r: MerchantEnrollmentRow) => (
              <button
                type="button"
                role="switch"
                aria-checked={r.isActive}
                onClick={() => handleAllowToggle(r.id, r.isActive)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
                style={{ background: r.isActive ? 'var(--brand)' : 'var(--border)' }}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: r.isActive ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.merchants') }],
        title: t('nav.merchants'),
        description: t('merchant.description'),
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
              {t('common.refresh')}
            </Button>
          </div>
        ),
      }}
      summaryItems={[
        { label: t('merchant.totalCount'), value: totalCount, tone: 'brand' },
      ]}
    >
      {/* Category Filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {CATEGORY_FILTERS.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {t(`loopType.${cat}`)}
          </Button>
        ))}
      </div>

      <SectionCard
        title={`${t('merchant.sectionTitle')} (${t(`loopType.${activeCategory}`)})`}
        description={`${filteredMerchants.length}${t('common.count')}`}
        padding="none"
      >
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={30} />
            ))}
          </div>
        ) : (
          <>
            <DataTable
              columns={cols}
              rows={filteredMerchants}
              rowKey={(r) => r.id}
              compact
              emptyState={t('merchant.empty')}
            />
            <div className="p-4">
              <Pagination
                skip={skip}
                take={take}
                total={totalCount}
                onPageChange={(newSkip) => setSkip(newSkip)}
              />
            </div>
          </>
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
