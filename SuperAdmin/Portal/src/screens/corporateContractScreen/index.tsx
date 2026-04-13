'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Wallet, Receipt, TrendingUp } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  Badge,
  Button,
  Skeleton,
  type SharedUiStat,
} from '@platform/shared-ui';
import { CORPORATE_DETAIL_QUERY, type CorporateDetailData } from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';
import { formatDateTime } from '@shared/utils/format';

function Field({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'success' | 'warning' | 'danger' | 'info' }) {
  const toneColor =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warn' :
    tone === 'danger' ? 'text-danger' :
    tone === 'info' ? 'text-info' : 'text-fg';
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-md border bg-surface-1 p-3" style={{ borderColor: 'var(--border)' }}>
      <span className="text-[11px] uppercase tracking-wider text-fg-subtle">{label}</span>
      <span className={`num font-mono text-[15px] font-bold ${toneColor}`}>{value}</span>
    </div>
  );
}

export function CorporateContractScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_PROFILE_READ);
  const fmt = useCurrencyFormat('VND');

  const { data, loading, error } = useQuery<CorporateDetailData>(CORPORATE_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const invoices = data?.eInvoicesByCorporate?.success?.data ?? [];
  const txns = data?.mealTransactionsByCorporate?.success?.data ?? [];

  // compute totals
  const totalApproved = txns.reduce((acc, t) => acc + Number(t.approvedAmountVnd ?? 0), 0);
  const totalCompany = txns.reduce((acc, t) => acc + Number(t.companyShareVnd ?? 0), 0);
  const totalEmployee = txns.reduce((acc, t) => acc + Number(t.employeeShareVnd ?? 0), 0);

  const metrics: SharedUiStat[] = [
    { label: t('corporate.contract.summary.deposit'), value: loading ? <Skeleton width={80} height={22} /> : (fmt.decimal(c?.depositBalanceVnd)), icon: <Wallet size={14} />, tone: 'success' },
    { label: t('corporate.contract.summary.creditLimit'), value: fmt.decimal(c?.creditLimitVnd), icon: <TrendingUp size={14} />, tone: 'warning' },
    { label: t('corporate.contract.summary.monthlyBudget'), value: fmt.decimal(c?.monthlyBudgetVnd), icon: <FileText size={14} />, tone: 'info' },
    { label: t('corporate.contract.summary.invoicesIssued'), value: invoices.length, icon: <Receipt size={14} /> },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${id}` },
          { label: t('corporate.detail.subnav.contract') },
        ],
        title: c ? `${c.companyName} · ${t('corporate.detail.subnav.contract')}` : t('common.loading'),
        description: t('corporate.contract.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-008</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${id}`)}>
            Back
          </Button>
        ),
      }}
      summaryItems={metrics}
    >
      {error && (
        <div className="mb-3 rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">{error.message}</div>
      )}
      <SectionCard title={t('corporate.contract.financialSummary')} description={t('corporate.contract.financialSummaryDesc')}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Field label={t('corporate.contract.totalApproved')} value={loading ? '…' : fmt.decimal(totalApproved)} tone="success" />
          <Field label={t('corporate.contract.companyShare')} value={loading ? '…' : fmt.decimal(totalCompany)} tone="info" />
          <Field label={t('corporate.contract.employeeShare')} value={loading ? '…' : fmt.decimal(totalEmployee)} tone="warning" />
        </div>
      </SectionCard>

      <div className="mt-4">
        <SectionCard
          title={t('corporate.contract.fundingTitle')}
          description={t('corporate.contract.fundingDesc')}
        >
          {loading && !c ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={20} />)}</div>
          ) : c ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('field.fundingModelLabel')}</span><Badge tone="info" variant="soft">{c.fundingModel ?? '—'}</Badge></div>
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('corporate.field.status')}</span><StatusBadge status={c.status} /></div>
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('corporate.field.taxCode')}</span><span className="font-mono text-fg">{c.taxCode ?? '—'}</span></div>
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('corporate.contract.contractCreated')}</span><span className="num font-mono text-fg">{formatDateTime(c.createdAt)}</span></div>
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('corporate.contract.lastUpdated')}</span><span className="num font-mono text-fg">{formatDateTime(c.updatedAt)}</span></div>
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('field.creditLimitVnd')}</span><span className="num font-mono text-fg">{fmt.decimal(c.creditLimitVnd)}</span></div>
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('field.monthlyBudgetVnd')}</span><span className="num font-mono text-fg">{fmt.decimal(c.monthlyBudgetVnd)}</span></div>
              <div className="flex gap-3"><span className="w-40 text-fg-muted">{t('field.depositVnd')}</span><span className="num font-mono text-success">{fmt.decimal(c.depositBalanceVnd)}</span></div>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title={t('corporate.contract.recentInvoices')} description={t('corporate.contract.recentInvoices')}>
          {loading ? (
            <Skeleton height={40} />
          ) : invoices.length === 0 ? (
            <div className="text-[12.5px] text-fg-subtle">{t('corporate.contract.noInvoices')}</div>
          ) : (
            <ul className="flex flex-col gap-2 text-[12.5px]">
              {invoices.slice(0, 5).map((inv) => (
                <li key={inv.id} className="flex items-center justify-between rounded-md border bg-surface-1 p-2.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-mono text-fg">{inv.periodStart.slice(0, 7)}</span>
                  <span className="num font-mono text-fg">{inv.totPayableVnd}</span>
                  <StatusBadge status={inv.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
