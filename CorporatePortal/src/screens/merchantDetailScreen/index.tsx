'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { ArrowLeft, Store, CalendarDays, Clock, ShieldCheck, UtensilsCrossed, MapPin, Phone } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  Button,
  Badge,
  Skeleton,
  Tabs,
  type TabItem,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import {
  MERCHANT_ENROLLMENT_DETAIL_QUERY,
  MERCHANT_BRANCHES_QUERY,
  MENU_CATEGORIES_QUERY,
  MENU_ITEMS_QUERY,
  type MerchantEnrollmentDetailData,
  type MerchantBranchesData,
  type MenuCategoriesData,
  type MenuItemsData,
  type MenuItemRow,
} from '@graphql/queries/merchant';
import { formatCurrency, toLocaleTag } from '@shared/utils/format';
import { useAppSelector } from '@store/index';

/* ─────────────────────── Types ─────────────────────── */

type TabKey = 'overview' | 'menu';

const LOOP_TYPE_TONE: Record<string, 'info' | 'neutral'> = {
  OPEN_LOOP: 'info',
  CLOSED_LOOP: 'neutral',
};

/* ─────────────────── Info Row helper ─────────────────── */

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 160, flexShrink: 0, fontSize: 13, color: 'var(--fg-muted)', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ flex: 1, fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>
        {children}
      </span>
    </div>
  );
}

/* ─────────────────── Overview Tab ─────────────────── */

function OverviewTab({ brandHqId }: { brandHqId: string }) {
  const { t } = useI18n();

  const { data, loading } = useQuery<MerchantEnrollmentDetailData>(
    MERCHANT_ENROLLMENT_DETAIL_QUERY,
    { variables: { brandHqId }, skip: !brandHqId },
  );
  const { data: branchData, loading: branchLoading } = useQuery<MerchantBranchesData>(
    MERCHANT_BRANCHES_QUERY,
    { variables: { brandHQId: brandHqId, skip: 0, take: 1 }, skip: !brandHqId },
  );

  const merchant = data?.mealMerchantEnrollment?.success?.data;
  const branch = branchData?.branches?.success?.data?.[0] ?? null;
  const isLoading = loading || branchLoading;

  if (isLoading) {
    return (
      <SectionCard title={t('merchants.detailPage.overview')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={36} />
          ))}
        </div>
      </SectionCard>
    );
  }

  if (!merchant) {
    return (
      <SectionCard title={t('merchants.detailPage.overview')}>
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
          {t('merchant.empty')}
        </div>
      </SectionCard>
    );
  }

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Enrollment Info */}
      <SectionCard title={t('merchants.detailPage.overview')}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <InfoRow label={t('merchants.detailPage.info.brandName')}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{merchant.brandName ?? '—'}</span>
          </InfoRow>
          {merchant.cuisineType && (
            <InfoRow label={t('merchants.detailPage.info.cuisineType')}>
              <Badge tone="brand" size="sm">{t(`cuisineType.${merchant.cuisineType}`)}</Badge>
            </InfoRow>
          )}
          <InfoRow label={t('merchants.detailPage.info.loopType')}>
            <Badge tone={LOOP_TYPE_TONE[merchant.loopType] ?? 'neutral'} size="sm">
              {t(`loopType.${merchant.loopType}`)}
            </Badge>
          </InfoRow>
          <InfoRow label={t('merchants.detailPage.info.status')}>
            <Badge tone={merchant.isActive ? 'success' : 'neutral'} size="sm" startDot>
              {merchant.isActive ? t('status.ACTIVE') : t('status.INACTIVE')}
            </Badge>
          </InfoRow>
          <InfoRow label={t('merchants.detailPage.info.enrolledAt')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarDays size={13} style={{ color: 'var(--fg-subtle)' }} />
              {formatDate(merchant.enrolledAt)}
            </div>
          </InfoRow>
          <InfoRow label={t('merchants.detailPage.info.contractEndsAt')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} style={{ color: 'var(--fg-subtle)' }} />
              {merchant.contractEndsAt
                ? formatDate(merchant.contractEndsAt)
                : t('merchants.detailPage.info.noContract')}
            </div>
          </InfoRow>
        </div>
      </SectionCard>

      {/* Branch / Location Info */}
      {branch && (
        <SectionCard title={t('merchants.detailPage.info.location')}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {branch.addressLine1 && (
              <InfoRow label={t('merchants.detailPage.info.address')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} style={{ color: 'var(--fg-subtle)', flexShrink: 0 }} />
                  <span>{branch.addressLine1}</span>
                </div>
              </InfoRow>
            )}
            {branch.phone && (
              <InfoRow label={t('merchants.detailPage.info.phone')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={13} style={{ color: 'var(--fg-subtle)' }} />
                  <span>{branch.phone}</span>
                </div>
              </InfoRow>
            )}
            {branch.description && (
              <InfoRow label={t('merchants.detailPage.info.description')}>
                <span style={{ color: 'var(--fg-muted)', fontSize: 12.5 }}>{branch.description}</span>
              </InfoRow>
            )}
            {branch.rating != null && (
              <InfoRow label={t('merchants.detailPage.info.rating')}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{Number(branch.rating).toFixed(1)}</span>
                <span style={{ color: 'var(--fg-muted)', fontSize: 12, marginLeft: 4 }}>
                  ({branch.reviewCount ?? 0} {t('merchants.detailPage.info.reviews')})
                </span>
              </InfoRow>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ─────────────────── Menu Tab ─────────────────── */

function MenuTab({ brandHQId }: { brandHQId: string }) {
  const { t, locale } = useI18n();
  const localeTag = toLocaleTag(locale);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');

  const { data: catData, loading: catLoading } = useQuery<MenuCategoriesData>(
    MENU_CATEGORIES_QUERY,
    { variables: { brandHQId, skip: 0, take: 100 }, skip: !brandHQId },
  );
  const { data: itemData, loading: itemLoading } = useQuery<MenuItemsData>(
    MENU_ITEMS_QUERY,
    { variables: { brandHQId, skip: 0, take: 100 }, skip: !brandHQId },
  );

  const categories = catData?.menuCategories?.success?.data?.filter((c) => c.isActive) ?? [];
  const allItems = itemData?.menuItems?.success?.data ?? [];
  const filteredItems =
    selectedCategoryId === 'ALL'
      ? allItems
      : allItems.filter((item) => item.categoryId === selectedCategoryId);

  const categoryMap = new Map(categories.map((c) => [c.id, c.categoryName]));

  const totalCount = allItems.length;
  const activeCount = allItems.filter((i) => i.isActive && !i.isSoldOut).length;
  const soldOutCount = allItems.filter((i) => i.isSoldOut).length;

  const tabItems: TabItem[] = [
    { key: 'ALL', label: `${t('merchants.detail.allCategory')} (${totalCount})` },
    ...categories
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => ({
        key: c.id,
        label: `${c.categoryName} (${allItems.filter((i) => i.categoryId === c.id).length})`,
      })),
  ];

  const loading = catLoading || itemLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard
          icon={<Store size={16} />}
          label={t('merchants.detailPage.menuSection.totalItems')}
          value={totalCount}
          color="var(--primary)"
        />
        <StatCard
          icon={<ShieldCheck size={16} />}
          label={t('merchants.detailPage.menuSection.activeItems')}
          value={activeCount}
          color="var(--success)"
        />
        <StatCard
          label={t('merchants.detailPage.menuSection.soldOutItems')}
          value={soldOutCount}
          color="var(--danger)"
        />
      </div>

      {/* Category Tabs + Items */}
      <SectionCard title={t('merchants.detailPage.menuSection.title')} padding="none">
        {/* Sticky category bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'var(--surface-1)',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
          }}
        >
          <Tabs
            variant="pill"
            items={tabItems}
            value={selectedCategoryId}
            onChange={(key) => setSelectedCategoryId(key)}
          />
        </div>

        <div style={{ padding: 16 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={72} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 12,
              }}
            >
              {[...filteredItems]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item) => (
                  <DetailMenuItemCard
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
      </SectionCard>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface-1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon && <span style={{ color }}>{icon}</span>}
        <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 800, color }}>{value}</span>
    </div>
  );
}

function DetailMenuItemCard({
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
        gap: 14,
        padding: 14,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: item.isSoldOut ? 'var(--surface-2)' : 'var(--surface-1)',
        opacity: item.isSoldOut ? 0.6 : 1,
        transition: 'box-shadow 140ms ease, border-color 140ms ease',
      }}
      onMouseEnter={(e) => {
        if (!item.isSoldOut) {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
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
            width: 56,
            height: 56,
            borderRadius: 10,
            objectFit: 'cover',
            flexShrink: 0,
            background: 'var(--surface-2)',
          }}
        />
      ) : (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 10,
            background: 'var(--surface-3, var(--surface-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <UtensilsCrossed size={22} style={{ color: 'var(--fg-muted)' }} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 650,
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
          <span style={{ fontSize: 11.5, color: 'var(--fg-subtle)', marginTop: 2, display: 'block' }}>
            {categoryName}
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
            {formatCurrency(item.basePrice, 'VND', localeTag)}
          </span>
          <Badge tone="neutral" size="sm">
            {item.itemType}
          </Badge>
          {!item.isActive && (
            <Badge tone="warning" size="sm">
              {t('status.INACTIVE')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Main Screen ─────────────────── */

export function MerchantDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.MERCHANT_READ);

  const brandHqId = params?.id ?? '';

  const activeTab = (searchParams.get('tab') as TabKey) || 'overview';
  const setTab = (tab: TabKey) => {
    const p = new URLSearchParams(searchParams.toString());
    if (tab === 'overview') p.delete('tab');
    else p.set('tab', tab);
    router.push(`/merchants/${brandHqId}?${p.toString()}`);
  };

  const { data, loading } = useQuery<MerchantEnrollmentDetailData>(
    MERCHANT_ENROLLMENT_DETAIL_QUERY,
    { variables: { brandHqId }, skip: !brandHqId },
  );

  const merchant = data?.mealMerchantEnrollment?.success?.data;

  if (hydrated && !canRead) return <LockedScreen />;

  const tabItems: TabItem[] = [
    { key: 'overview', label: t('merchants.detailPage.overview') },
    { key: 'menu', label: t('merchants.detailPage.menu') },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.merchants'), href: '/merchants' },
          { label: merchant?.brandName ?? '...' },
        ],
        title: loading ? '...' : (merchant?.brandName ?? brandHqId.slice(0, 8)),
        description: merchant
          ? `${t(`loopType.${merchant.loopType}`)} · ${merchant.isActive ? t('status.ACTIVE') : t('status.INACTIVE')}`
          : undefined,
        actions: (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => router.push('/merchants')}
            >
              {t('merchants.detailPage.back')}
            </Button>
          </div>
        ),
      }}
      summaryItems={
        merchant
          ? [
              {
                label: t('merchants.detailPage.info.status'),
                value: merchant.isActive ? t('status.ACTIVE') : t('status.INACTIVE'),
                tone: merchant.isActive ? 'success' : 'neutral' as const,
              },
              {
                label: t('merchants.detailPage.info.loopType'),
                value: t(`loopType.${merchant.loopType}`),
                tone: 'brand' as const,
              },
            ]
          : []
      }
      tabs={
        <Tabs
          variant="segment"
          items={tabItems}
          value={activeTab}
          onChange={(k) => setTab(k as TabKey)}
        />
      }
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={200} />
          <Skeleton height={300} />
        </div>
      ) : activeTab === 'overview' ? (
        <OverviewTab brandHqId={brandHqId} />
      ) : (
        <MenuTab brandHQId={brandHqId} />
      )}
    </DetailPageTemplate>
  );
}
