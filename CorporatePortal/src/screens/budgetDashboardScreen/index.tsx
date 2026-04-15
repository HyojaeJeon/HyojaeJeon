'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { PiggyBank, Users, BookOpen, RefreshCw, ArrowRight } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  Badge,
  Button,
  Skeleton,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';
import {
  WALLETS_QUERY,
  FUNDING_STATUS_QUERY,
  type WalletsData,
  type FundingStatusData,
} from '@graphql/queries/budget';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

export function BudgetDashboardScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.WALLET_READ);
  const corporateId = useCorporateId();

  const { data: walletsData, loading: walletsLoading, refetch } = useQuery<WalletsData>(WALLETS_QUERY, {
    variables: { corporateId, skip: 0, take: 100 },
    skip: !corporateId,
  });

  const { data: fundingData, loading: fundingLoading } = useQuery<FundingStatusData>(FUNDING_STATUS_QUERY, {
    variables: { id: corporateId },
    skip: !corporateId,
  });

  if (hydrated && !canRead) return <LockedScreen />;

  const wallets = walletsData?.mealWalletsByCorporate?.success?.data ?? [];
  const corp = fundingData?.mealCorporate?.success?.data;
  const model = corp?.fundingModel ?? null;

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balanceVnd), 0);
  const totalCompany = wallets.reduce((s, w) => s + Number(w.companyAllowanceVnd), 0);
  const totalPersonal = wallets.reduce((s, w) => s + Number(w.personalTopUpVnd), 0);
  const loading = walletsLoading || fundingLoading;

  const quickLinks = [
    { label: t('nav.budget.funding'), href: '/budget/funding', icon: PiggyBank, desc: t('budget.dash.fundingDesc') },
    { label: t('nav.budget.wallets'), href: '/budget/wallets', icon: Users, desc: t('budget.dash.walletsDesc') },
    { label: t('nav.budget.ledger'), href: '/budget/ledger', icon: BookOpen, desc: t('budget.dash.ledgerDesc') },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.budget') }],
        title: t('nav.budget'),
        description: t('budget.description'),
        actions: (
          <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
            {t('common.refresh')}
          </Button>
        ),
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Funding model badge */}
        <div className="flex items-center gap-3">
          <Badge tone={model ? 'success' : 'warning'} size="sm" startDot>
            {model ? t(`budget.funding.model.${model}`) : t('budget.funding.model.UNASSIGNED')}
          </Badge>
          <span className="text-[12px] text-fg-muted">{wallets.length} {t('budget.dash.walletCount')}</span>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={100} />)
          ) : (
            <>
              <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                <p className="text-[12px] font-semibold text-fg-muted">{t('budget.totalBalance')}</p>
                <p className="mt-1 text-xl font-bold text-fg">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                <p className="text-[12px] font-semibold text-fg-muted">{t('budget.companyAllowance')}</p>
                <p className="mt-1 text-xl font-bold text-fg">{formatCurrency(totalCompany)}</p>
              </div>
              <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                <p className="text-[12px] font-semibold text-fg-muted">{t('budget.personalTopUp')}</p>
                <p className="mt-1 text-xl font-bold text-fg">{formatCurrency(totalPersonal)}</p>
              </div>
            </>
          )}
        </div>

        {/* Quick links */}
        <SectionCard title={t('budget.dash.quickLinks')}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {quickLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => router.push(link.href)}
                className="flex items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-surface-2"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-2)' }}>
                  <link.icon size={20} className="text-fg-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-fg">{link.label}</p>
                  <p className="text-[11px] text-fg-muted truncate">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-fg-subtle" />
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
