'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
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
import { formatCurrency } from '@shared/utils/format';
import {
  WALLETS_QUERY,
  WALLET_FUNDING_ENTRIES_QUERY,
  type WalletsData,
  type WalletRow,
  type WalletFundingEntriesData,
  type WalletFundingEntry,
} from '@graphql/queries/budget';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

export function BudgetOverviewScreen() {
  const { t } = useI18n();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.WALLET_READ);

  const corporateId = useCorporateId();
  const [skip, setSkip] = useState(0);
  const [take] = useState(20);

  const { data, loading, refetch } = useQuery<WalletsData>(WALLETS_QUERY, {
    variables: { corporateId, skip, take },
    skip: !corporateId,
  });
  const wallets: WalletRow[] = data?.mealWalletsByCorporate?.success?.data ?? [];

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balanceVnd), 0);
  const totalCompanyAllowance = wallets.reduce((sum, w) => sum + Number(w.companyAllowanceVnd), 0);
  const totalPersonalTopUp = wallets.reduce((sum, w) => sum + Number(w.personalTopUpVnd), 0);

  if (hydrated && !canRead) return <LockedScreen />;

  const walletColumns: DataTableColumn<WalletRow>[] = [
    {
      key: 'employeeId',
      header: t('budget.employeeId'),
      width: '180px',
      render: (r) => (
        <span className="font-mono text-[13px] text-fg">{r.employeeId}</span>
      ),
    },
    {
      key: 'balanceVnd',
      header: t('budget.balance'),
      width: '160px',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-[13px] font-semibold text-fg">
          {formatCurrency(r.balanceVnd)} VND
        </span>
      ),
    },
    {
      key: 'companyAllowanceVnd',
      header: t('budget.companyAllowance'),
      width: '160px',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-[13px] text-fg">
          {formatCurrency(r.companyAllowanceVnd)} VND
        </span>
      ),
    },
    {
      key: 'personalTopUpVnd',
      header: t('budget.personalTopUp'),
      width: '160px',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-[13px] text-fg">
          {formatCurrency(r.personalTopUpVnd)} VND
        </span>
      ),
    },
    {
      key: 'status',
      header: t('budget.walletStatus'),
      width: '120px',
      render: (r) => (
        <Badge tone={r.status === 'ACTIVE' ? 'success' : r.status === 'SUSPENDED' ? 'warning' : 'neutral'} size="sm">
          {t(`status.${r.status}`)}
        </Badge>
      ),
    },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.budget') }],
        title: t('nav.budget'),
        description: t('budget.description'),
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
              {t('common.refresh')}
            </Button>
          </div>
        ),
      }}
    >
      {/* Section 1: Wallet summary */}
      <SectionCard title={t('budget.walletSummary')}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
          >
            <p className="text-[12px] font-semibold text-fg-muted">{t('budget.totalBalance')}</p>
            <p className="mt-1 text-lg font-bold text-fg">
              {formatCurrency(totalBalance)} VND
            </p>
          </div>
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
          >
            <p className="text-[12px] font-semibold text-fg-muted">{t('budget.companyAllowance')}</p>
            <p className="mt-1 text-lg font-bold text-fg">
              {formatCurrency(totalCompanyAllowance)} VND
            </p>
          </div>
          <div
            className="rounded-xl border p-5"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
          >
            <p className="text-[12px] font-semibold text-fg-muted">{t('budget.personalTopUp')}</p>
            <p className="mt-1 text-lg font-bold text-fg">
              {formatCurrency(totalPersonalTopUp)} VND
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Section 2: Wallet list */}
      <div className="mt-4">
        <SectionCard title={t('budget.walletList')} description={`${wallets.length}`} padding="none">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={30} />
              ))}
            </div>
          ) : (
            <>
              <DataTable
                columns={walletColumns}
                rows={wallets}
                rowKey={(r) => r.id}
                compact
                emptyState={t('budget.walletEmpty')}
              />
              <div className="p-4">
                <Pagination
                  skip={skip}
                  take={take}
                  total={wallets.length < take ? skip + wallets.length : skip + take + 1}
                  onPageChange={(newSkip) => setSkip(newSkip)}
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
