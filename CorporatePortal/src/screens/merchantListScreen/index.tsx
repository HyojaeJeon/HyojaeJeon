'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { RefreshCw, Eye, UtensilsCrossed } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  Pagination,
  Modal,
  Tabs,
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
  MENU_CATEGORIES_QUERY,
  MENU_ITEMS_QUERY,
  type MerchantEnrollmentsData,
  type MerchantEnrollmentRow,
  type MenuCategoriesData,
  type MenuItemsData,
  type MenuItemRow,
} from '@graphql/queries/merchant';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { formatCurrency, toLocaleTag } from '@shared/utils/format';
import { useAppSelector } from '@store/index';

type LoopType = 'OPEN_LOOP' | 'CLOSED_LOOP';
const LOOP_TYPE_TONE: Record<LoopType, 'info' | 'neutral'> = {
  OPEN_LOOP: 'info',
  CLOSED_LOOP: 'neutral',
};

const CATEGORY_FILTERS = ['ALL', 'OPEN_LOOP', 'CLOSED_LOOP'] as const;

/* ───────────────── Menu Preview Modal ───────────────── */

function MerchantMenuModal({
  merchant,
  open,
  onClose,
}: {
  merchant: MerchantEnrollmentRow | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const localeTag = toLocaleTag(locale);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');

  const brandHQId = merchant?.brandHqId ?? '';

  const { data: catData, loading: catLoading } = useQuery<MenuCategoriesData>(
    MENU_CATEGORIES_QUERY,
    { variables: { brandHQId, skip: 0, take: 100 }, skip: !open || !brandHQId },
  );
  const { data: itemData, loading: itemLoading } = useQuery<MenuItemsData>(
    MENU_ITEMS_QUERY,
    { variables: { brandHQId, skip: 0, take: 100 }, skip: !open || !brandHQId },
  );

  const categories = catData?.menuCategories?.success?.data?.filter((c) => c.isActive) ?? [];
  const allItems = itemData?.menuItems?.success?.data ?? [];
  const filteredItems =
    selectedCategoryId === 'ALL'
      ? allItems
      : allItems.filter((item) => item.categoryId === selectedCategoryId);

  const categoryMap = new Map(categories.map((c) => [c.id, c.categoryName]));

  const tabItems = [
    { key: 'ALL', label: t('merchants.detail.allCategory') },
    ...categories
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => ({ key: c.id, label: c.categoryName })),
  ];

  const loading = catLoading || itemLoading;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${merchant?.brandName ?? '—'} — ${t('merchants.detail.modalTitle')}`}
      width={720}
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              if (merchant) router.push(`/merchants/${merchant.brandHqId}`);
            }}
          >
            {t('merchants.detail.goDetail')}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('merchants.detail.close')}
          </Button>
        </div>
      }
    >
      {/* Sticky Category Tabs */}
      <div
        style={{
          position: 'sticky',
          top: -16,
          zIndex: 10,
          background: 'var(--surface-1)',
          paddingBottom: 12,
          paddingTop: 4,
          marginTop: -4,
          borderBottom: '1px solid var(--border)',
          marginLeft: -20,
          marginRight: -20,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <Tabs
            variant="pill"
            items={tabItems}
            value={selectedCategoryId}
            onChange={(key) => setSelectedCategoryId(key)}
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      <div style={{ paddingTop: 16, minHeight: 200 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={72} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              color: 'var(--fg-muted)',
              fontSize: 13,
            }}
          >
            {t('merchants.detail.noMenuItems')}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
            }}
          >
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                categoryName={categoryMap.get(item.categoryId)}
                localeTag={localeTag}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function MenuItemCard({
  item,
  categoryName,
  localeTag,
  t,
}: {
  item: MenuItemRow;
  categoryName?: string;
  localeTag: string;
  t: (key: string) => string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 12,
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: item.isSoldOut ? 'var(--surface-2)' : 'var(--surface-1)',
        opacity: item.isSoldOut ? 0.65 : 1,
        transition: 'box-shadow 140ms ease, border-color 140ms ease',
      }}
      onMouseEnter={(e) => {
        if (!item.isSoldOut) {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail */}
      {item.profileImageUrl ? (
        <img
          src={item.profileImageUrl}
          alt={item.itemName}
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            objectFit: 'cover',
            flexShrink: 0,
            background: 'var(--surface-2)',
          }}
        />
      ) : (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            background: 'var(--surface-3, var(--surface-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <UtensilsCrossed size={20} style={{ color: 'var(--fg-muted)' }} />
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--fg)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.itemName}
          </span>
          {item.isSoldOut && (
            <Badge tone="danger" size="sm">
              {t('merchants.detail.soldOut')}
            </Badge>
          )}
        </div>

        {categoryName && (
          <span style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 2, display: 'block' }}>
            {categoryName}
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
            {formatCurrency(item.basePrice, 'VND', localeTag)}
          </span>
          <Badge tone="neutral" size="sm">
            {item.itemType}
          </Badge>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Main Screen ─────────────────── */

export function MerchantListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.MERCHANT_READ);
  const canWrite = useHasPermission(PERMISSIONS.MERCHANT_ALLOW_WRITE);

  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  /* Modal state */
  const [modalMerchant, setModalMerchant] = useState<MerchantEnrollmentRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const openModal = (merchant: MerchantEnrollmentRow) => {
    setModalMerchant(merchant);
    setModalOpen(true);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {r.logoUrl ? (
            <img
              src={r.logoUrl}
              alt=""
              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: 'var(--surface-2)' }}
            />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UtensilsCrossed size={15} style={{ color: 'var(--fg-subtle)' }} />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="font-semibold text-fg" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.brandName ?? r.brandHqId.slice(0, 8)}
            </div>
            {r.cuisineType && (
              <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 1 }}>
                {t(`cuisineType.${r.cuisineType}`)}
              </div>
            )}
          </div>
        </div>
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
    {
      key: 'actions',
      header: '',
      width: canWrite ? '160px' : '80px',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            variant="outline"
            size="sm"
            startIcon={<Eye size={13} />}
            onClick={() => openModal(r)}
          >
            {t('merchants.detail.viewButton')}
          </Button>
          {canWrite && (
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
          )}
        </div>
      ),
    },
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

      {/* Menu Preview Modal */}
      <MerchantMenuModal
        merchant={modalMerchant}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalMerchant(null);
        }}
      />
    </DetailPageTemplate>
  );
}
