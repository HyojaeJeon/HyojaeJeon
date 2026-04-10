'use client';

import { useState } from 'react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';

type LoopType = 'OPEN_LOOP' | 'CLOSED_LOOP';
type CategoryFilter = '전체' | '한식' | '베트남식' | '카페' | '편의점' | '배달';

interface MerchantRow {
  id: string;
  merchantName: string;
  category: string;
  loopType: LoopType;
  monthlyTxCount: number;
  monthlyAmountVnd: number;
  allowed: boolean;
}

const CATEGORY_FILTERS: CategoryFilter[] = ['전체', '한식', '베트남식', '카페', '편의점', '배달'];

const LOOP_TYPE_TONE: Record<LoopType, 'info' | 'neutral'> = {
  OPEN_LOOP: 'info',
  CLOSED_LOOP: 'neutral',
};

export function MerchantListScreen() {
  const { t } = useI18n();
  const canRead = useHasPermission(PERMISSIONS.MERCHANT_READ);
  const canWrite = useHasPermission(PERMISSIONS.MERCHANT_WRITE);

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('전체');

  // TODO: useQuery(MERCHANT_LIST_QUERY, { variables: { corporateId, category } })
  const merchants: MerchantRow[] = [];
  const loading = false;

  if (!canRead) return <LockedScreen />;

  const handleAllowToggle = (merchantId: string, currentAllowed: boolean) => {
    // TODO: mealCorporateMerchantAllowToggle mutation
    // mutate({ variables: { merchantId, allowed: !currentAllowed } })
    console.log(`Toggle merchant ${merchantId} from ${currentAllowed} to ${!currentAllowed}`);
  };

  const filteredMerchants =
    activeCategory === '전체'
      ? merchants
      : merchants.filter((m) => m.category === activeCategory);

  const cols: DataTableColumn<MerchantRow>[] = [
    {
      key: 'merchantName',
      header: '식당명',
      render: (r) => <span className="font-semibold text-fg">{r.merchantName}</span>,
    },
    {
      key: 'category',
      header: '카테고리',
      width: '120px',
      render: (r) => (
        <Badge tone="neutral" size="sm">
          {r.category}
        </Badge>
      ),
    },
    {
      key: 'loopType',
      header: 'loopType',
      width: '140px',
      render: (r) => (
        <Badge tone={LOOP_TYPE_TONE[r.loopType]} size="sm">
          {r.loopType === 'OPEN_LOOP' ? 'Open Loop' : 'Closed Loop'}
        </Badge>
      ),
    },
    {
      key: 'monthlyTxCount',
      header: '이번달 이용건수',
      width: '130px',
      render: (r) => <span className="num font-semibold">{r.monthlyTxCount}건</span>,
    },
    {
      key: 'monthlyAmount',
      header: '이번달 금액',
      width: '150px',
      render: (r) => (
        <span className="num font-semibold">{formatCurrency(r.monthlyAmountVnd)}</span>
      ),
    },
    ...(canWrite
      ? [
          {
            key: 'allowed' as const,
            header: '허용',
            width: '80px',
            render: (r: MerchantRow) => (
              <button
                type="button"
                role="switch"
                aria-checked={r.allowed}
                onClick={() => handleAllowToggle(r.id, r.allowed)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
                style={{ background: r.allowed ? 'var(--brand)' : 'var(--border)' }}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: r.allowed ? 'translateX(20px)' : 'translateX(0)' }}
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
        description: '가맹 식당 목록을 조회하고 허용 여부를 관리합니다.',
      }}
      summaryItems={[
        { label: '가맹점 수', value: filteredMerchants.length, tone: 'brand' },
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
            {cat}
          </Button>
        ))}
      </div>

      <SectionCard
        title={`가맹 식당 (${activeCategory})`}
        description={`${filteredMerchants.length}개`}
        padding="none"
      >
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={30} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={cols}
            rows={filteredMerchants}
            rowKey={(r) => r.id}
            compact
            emptyState="가맹 식당이 없습니다."
          />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
