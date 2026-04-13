'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Skeleton, Badge, Button } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { formatCurrency } from '@shared/utils/format';
import { WALLETS_QUERY, TRANSACTIONS_QUERY, type WalletsData, type TransactionsData } from '@graphql/queries/budget';
import { INVOICES_QUERY, type InvoicesData } from '@graphql/queries/invoice';
import { EMPLOYEES_QUERY, type EmployeesData } from '@graphql/queries/employee';
import { POLICIES_QUERY, type PoliciesData } from '@graphql/queries/policy';

const MonthlyTrendChart = dynamic(() => import('./chunks/MonthlyTrendChart'), { ssr: false, loading: () => <Skeleton width="100%" height={200} /> });
const TopMerchantsChart = dynamic(() => import('./chunks/TopMerchantsChart'), { ssr: false, loading: () => <Skeleton width="100%" height={200} /> });

type PeriodFilter = 'this_month' | 'last_month' | 'quarter';

const PERIOD_KEYS: Record<PeriodFilter, string> = {
  this_month: 'period.current',
  last_month: 'period.previous',
  quarter: 'period.quarter',
};

export function DashboardScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const corporateId = useCorporateId();
  const [period, setPeriod] = useState<PeriodFilter>('this_month');

  const hasCorporate = !!corporateId;

  const { data: walletsData, loading: walletsLoading } = useQuery<WalletsData>(WALLETS_QUERY, {
    variables: { corporateId: corporateId ?? '', skip: 0, take: 100 },
    skip: !hasCorporate,
  });

  const { data: txData, loading: txLoading } = useQuery<TransactionsData>(TRANSACTIONS_QUERY, {
    variables: { corporateId: corporateId ?? '', skip: 0, take: 200 },
    skip: !hasCorporate,
  });

  const { data: invoiceData, loading: invoiceLoading } = useQuery<InvoicesData>(INVOICES_QUERY, {
    variables: { corporateId: corporateId ?? '', skip: 0, take: 5 },
    skip: !hasCorporate,
  });

  const { data: employeeData } = useQuery<EmployeesData>(EMPLOYEES_QUERY, {
    variables: { corporateId: corporateId ?? '', skip: 0, take: 1 },
    skip: !hasCorporate,
  });

  const { data: policyData } = useQuery<PoliciesData>(POLICIES_QUERY, {
    variables: { corporateId: corporateId ?? '' },
    skip: !hasCorporate,
  });

  const employeeCount = employeeData?.mealEmployees?.success?.data?.length ?? 0;
  const activePolicies = (policyData?.mealPoliciesByCorporate?.success?.data ?? []).filter(
    (p) => p.status === 'ACTIVE',
  ).length;

  const wallets = walletsData?.mealWalletsByCorporate?.success?.data ?? [];
  const transactions = txData?.mealTransactionsByCorporate?.success?.data ?? [];
  const invoices = invoiceData?.eInvoicesByCorporate?.success?.data ?? [];
  const latestInvoice = invoices[0];

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balanceVnd), 0);
  const totalCompanyAllowance = wallets.reduce((sum, w) => sum + Number(w.companyAllowanceVnd), 0);
  const totalPersonalTopUp = wallets.reduce((sum, w) => sum + Number(w.personalTopUpVnd), 0);
  const usageRate = totalCompanyAllowance > 0 ? Math.round(((totalCompanyAllowance - totalBalance) / totalCompanyAllowance) * 100) : 0;

  // 월별 소진 추세 데이터 (최근 6개월)
  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}월`;
      const monthTxs = transactions.filter((tx) => {
        const txDate = tx.createdAt?.slice(0, 7);
        return txDate === key && tx.status !== 'DECLINED';
      });
      const total = monthTxs.reduce((s, tx) => s + Number(tx.approvedAmountVnd), 0);
      months.push({ month: label, amount: total });
    }
    return months;
  }, [transactions]);

  // 인기 가맹점 Top 5 (branchId별 거래 합산)
  const topMerchantsData = useMemo(() => {
    const merchantMap = new Map<string, { id: string; count: number; amount: number }>();
    for (const tx of transactions) {
      if (tx.status === 'DECLINED') continue;
      const id = tx.branchId ?? tx.brandHqId ?? 'unknown';
      const existing = merchantMap.get(id) ?? { id, count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += Number(tx.approvedAmountVnd);
      merchantMap.set(id, existing);
    }
    return Array.from(merchantMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((m, i) => ({ name: `#${i + 1} ${m.id.slice(0, 8)}`, count: m.count, amount: m.amount }));
  }, [transactions]);

  const isLoading = walletsLoading;

  const walletStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { ACTIVE: 0, SUSPENDED: 0, FROZEN: 0, CLOSED: 0 };
    for (const w of wallets) counts[w.status] = (counts[w.status] ?? 0) + 1;
    return counts;
  }, [wallets]);

  const walletStatusItems = [
    { key: 'ACTIVE', color: 'var(--success)' },
    { key: 'SUSPENDED', color: 'var(--warning)' },
    { key: 'FROZEN', color: 'var(--info)' },
    { key: 'CLOSED', color: 'var(--border)' },
  ] as const;

  const totalWalletCount = wallets.length || 1;
  const walletBarWidths = walletStatusItems.map((item) => {
    const pct = (walletStatusCounts[item.key] / totalWalletCount) * 100;
    return Math.max(pct, pct > 0 ? 2 : 0);
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-black text-fg">{t('nav.dashboard')}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t('dashboard.description')}</p>
      </div>

      <div className="flex gap-2">
        {(Object.keys(PERIOD_KEYS) as PeriodFilter[]).map((key) => (
          <Button key={key} variant={period === key ? 'primary' : 'ghost'} size="sm" onClick={() => setPeriod(key)}>
            {t(PERIOD_KEYS[key])}
          </Button>
        ))}
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'dashboard.employeeCount', value: String(employeeCount) },
          { label: 'dashboard.activePolicies', value: String(activePolicies) },
          { label: 'dashboard.usageRate', value: `${usageRate}%` },
          { label: 'dashboard.invoicesPending', value: String(invoices.filter((inv) => inv.status === 'DRAFT').length) },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border bg-surface-1 p-4" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-semibold text-fg-muted">{t(card.label)}</span>
            <p className="mt-1 text-xl font-bold text-fg">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* W1: Budget usage rate */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">{t('dashboard.budgetUsageRate')}</h3>
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center rounded-full border-[8px]" style={{ width: 128, height: 128, borderColor: isLoading ? 'var(--border)' : 'var(--primary)' }}>
              <span className="text-2xl font-bold text-fg">{isLoading ? <Skeleton width={48} height={24} /> : `${usageRate}%`}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { key: 'dashboard.companyAllowance', val: totalCompanyAllowance },
              { key: 'dashboard.totalBalance', val: totalBalance },
              { key: 'dashboard.personalTopUp', val: totalPersonalTopUp },
            ].map((s) => (
              <div key={s.key} className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-fg-muted">{t(s.key)}</span>
                {isLoading ? <Skeleton width={64} height={18} /> : <span className="text-sm font-bold text-fg">{formatCurrency(s.val)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* W2: Monthly trend chart */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg-muted">{t('dashboard.monthlySpendTrend')}</h3>
            <Badge tone="neutral" size="sm">{t('dashboard.vsLastMonth')}</Badge>
          </div>
          <p className="mb-4 text-[11px] text-fg-subtle">{t('dashboard.last6Months')}</p>
          {txLoading ? <Skeleton width="100%" height={200} /> : <MonthlyTrendChart data={monthlyTrendData} />}
        </div>

        {/* W3: Wallet status */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-3 text-sm font-bold text-fg-muted">{t('dashboard.employeeWalletStatus')}</h3>
          {walletsLoading ? <Skeleton width="100%" height={100} /> : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-fg-muted">{t('dashboard.totalWallets')}</span>
                  <span className="text-sm font-bold text-fg">{wallets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-fg-muted">{t('dashboard.totalBalance')}</span>
                  <span className="text-sm font-bold text-fg">{formatCurrency(totalBalance)}</span>
                </div>
              </div>
              <div className="mt-4 flex h-6 w-full overflow-hidden rounded-full">
                {walletStatusItems.map((item, idx) => (
                  <div key={item.key} style={{ backgroundColor: item.color, width: `${walletBarWidths[idx]}%` }} className="transition-all" />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {walletStatusItems.map((item) => (
                  <div key={item.key} className="flex flex-col items-center gap-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-fg">{walletStatusCounts[item.key]}</span>
                    <span className="text-[10px] text-fg-subtle">{t(`walletStatus.${item.key}`)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* W4: Top merchants chart */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">{t('dashboard.topMerchants')}</h3>
          {txLoading ? <Skeleton width="100%" height={200} /> : <TopMerchantsChart data={topMerchantsData} />}
        </div>

        {/* W5: This month's invoices */}
        <div className="col-span-1 rounded-xl border bg-surface-1 p-6 lg:col-span-2" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg-muted">{t('dashboard.thisMonthInvoices')}</h3>
            {latestInvoice && <Badge tone="warning" size="sm">{latestInvoice.status}</Badge>}
          </div>
          {invoiceLoading ? <Skeleton width="100%" height={80} /> : latestInvoice ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-fg-muted">{t('dashboard.settlementPeriod')}</span>
                  <span className="text-xs font-medium text-fg">{latestInvoice.periodStart?.slice(0, 10)} ~ {latestInvoice.periodEnd?.slice(0, 10)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-fg-muted">{t('dashboard.totalAmount')}</span>
                  <span className="text-xs font-medium text-fg">{formatCurrency(Number(latestInvoice.totPayableVnd))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-fg-muted">{t('dashboard.lineItems')}</span>
                  <span className="text-xs font-medium text-fg">{latestInvoice.sourceTransactionCount ?? '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center"><span className="text-xs text-fg-subtle">{t('common.empty')}</span></div>
          )}
          <div className="mt-4">
            <Button variant="primary" size="sm" onClick={() => router.push('/invoices')}>{t('dashboard.review')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
