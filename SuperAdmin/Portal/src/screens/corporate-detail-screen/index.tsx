'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit3,
  FileText,
  Store,
  Bell,
  Users,
  UsersRound,
  Wallet,
  ScrollText,
  Receipt,
} from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Skeleton,
  Tabs,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_DETAIL_QUERY,
  type CorporateDetailData,
  type CorporateDepartmentRow,
  type CorporatePolicyRow,
  type CorporateWalletRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';

export function CorporateDetailScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_PROFILE_READ);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_PROFILE_WRITE);
  const fmt = useCurrencyFormat('VND');
  // overview only — sub-tab 클릭 시 dedicated route 로 이동 (중복 데이터 표시 방지)
  const [tab, setTab] = useState<'overview'>('overview');

  const { data, loading, error } = useQuery<CorporateDetailData>(CORPORATE_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const depts: CorporateDepartmentRow[] = data?.mealDepartments.success?.data ?? [];
  const policies: CorporatePolicyRow[] = data?.mealPoliciesByCorporate.success?.data ?? [];
  const wallets: CorporateWalletRow[] = data?.mealWalletsByCorporate.success?.data ?? [];

  const deptCols: DataTableColumn<CorporateDepartmentRow>[] = [
    { key: 'code', header: t('field.code'), width: '200px', render: (r) => <span className="font-mono text-[12px]">{r.departmentCode}</span> },
    { key: 'name', header: t('field.name'), render: (r) => <span className="font-medium text-fg">{r.departmentName}</span> },
  ];
  const policyCols: DataTableColumn<CorporatePolicyRow>[] = [
    { key: 'code', header: t('field.code'), width: '200px', render: (r) => <span className="font-mono text-[12px]">{r.policyCode}</span> },
    { key: 'name', header: t('field.name'), render: (r) => <span className="font-medium text-fg">{r.policyName}</span> },
    { key: 'daily', header: t('field.dailyLimit'), width: '140px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.dailyLimitVnd)}</span> },
    { key: 'tx', header: t('field.maxPerTxn'), width: '140px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.maxPerTransactionVnd)}</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
  ];
  const walletCols: DataTableColumn<CorporateWalletRow>[] = [
    { key: 'emp', header: t('field.employee'), width: '200px', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{r.employeeId.slice(0, 8)}</span> },
    { key: 'bal', header: t('field.balance'), align: 'right', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.balanceVnd)}</span> },
    { key: 'comp', header: t('field.companyAllowance'), align: 'right', render: (r) => <span className="num font-mono text-[12px] text-success">{fmt.decimal(r.companyAllowanceVnd)}</span> },
    { key: 'pers', header: t('field.personalTopUp'), align: 'right', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.personalTopUpVnd)}</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…' },
        ],
        title: c ? c.companyName : t('common.loading'),
        description: c ? (
          <span className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-fg-muted">{c.tenantCode}</span>
            {c.fundingModel && <Badge tone="info" variant="soft">{c.fundingModel}</Badge>}
            <StatusBadge status={c.status} />
          </span>
        ) : undefined,
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-002</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/tenants/corporates')}>
              Back
            </Button>
            {canWrite && (
              <Link href={`/tenants/corporates/${id}/edit`}>
                <Button variant="primary" size="md" startIcon={<Edit3 size={14} />}>
                  {t('corporate.action.cta.edit')}
                </Button>
              </Link>
            )}
          </>
        ),
      }}
      summaryItems={[
        { label: t('corporate.contract.summary.deposit'), value: fmt.decimal(c?.depositBalanceVnd), tone: 'success' },
        { label: t('corporate.contract.summary.creditLimit'), value: fmt.decimal(c?.creditLimitVnd), tone: 'warning' },
        { label: t('corporate.contract.summary.monthlyBudget'), value: fmt.decimal(c?.monthlyBudgetVnd), tone: 'info' },
        { label: t('corporate.detail.subnav.departments'), value: depts.length, tone: 'brand' },
        { label: t('corporate.detail.subnav.wallets'), value: wallets.length },
      ]}
      tabs={
        <Tabs
          items={[
            { key: 'overview', label: t('corporate.tab.overview') },
            { key: 'departments', label: `${t('corporate.detail.subnav.departments')} (${depts.length})` },
            { key: 'employees', label: t('corporate.detail.subnav.employees') },
            { key: 'policies', label: `${t('corporate.detail.subnav.policies')} (${policies.length})` },
            { key: 'wallets', label: `${t('corporate.detail.subnav.wallets')} (${wallets.length})` },
            { key: 'merchants', label: t('corporate.detail.subnav.merchants') },
            { key: 'einvoices', label: t('corporate.detail.subnav.einvoices') },
            { key: 'contract', label: t('corporate.detail.subnav.contract') },
          ]}
          value={tab}
          onChange={(k) => {
            // 'overview' 만 in-page, 나머지는 sub-route 로 이동
            if (k === 'overview') {
              setTab('overview');
              return;
            }
            const map: Record<string, string> = {
              departments: `/tenants/corporates/${id}/departments`,
              employees: `/tenants/corporates/${id}/employees`,
              policies: `/tenants/corporates/${id}/policies`,
              wallets: `/tenants/corporates/${id}/wallets`,
              merchants: `/tenants/corporates/${id}/merchants`,
              einvoices: `/tenants/corporates/${id}/einvoices`,
              contract: `/tenants/corporates/${id}/contract`,
            };
            const dest = map[k];
            if (dest) router.push(dest);
          }}
          variant="segment"
        />
      }
    >
      {error && (
        <div className="mb-3 rounded-md p-3 text-[12.5px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error.message}</div>
      )}

      <div className="hidden">
        <Bell size={1} />
        <Users size={1} />
        <UsersRound size={1} />
        <Wallet size={1} />
        <ScrollText size={1} />
        <Store size={1} />
        <Receipt size={1} />
        <FileText size={1} />
      </div>
      {loading && !c ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={24} />)}</div>
      ) : c ? (
        <SectionCard title={t('corporate.create.cardTitle')}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px]">
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.tenantCodeShort')}</span><span className="font-mono text-fg">{c.tenantCode}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.taxCodeShort')}</span><span className="font-mono text-fg">{c.taxCode ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.fundingModelLabel')}</span><span className="text-fg">{c.fundingModel ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('corporate.field.contactName')}</span><span className="text-fg">{c.contactName ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.email')}</span><span className="text-fg">{c.contactEmail ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.phone')}</span><span className="text-fg">{c.contactPhone ?? '—'}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.depositVnd')}</span><span className="num font-mono text-fg">{fmt.decimal(c.depositBalanceVnd)}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.creditLimitVnd')}</span><span className="num font-mono text-fg">{fmt.decimal(c.creditLimitVnd)}</span></div>
            <div className="flex gap-3"><span className="w-32 text-fg-muted">{t('field.monthlyBudgetVnd')}</span><span className="num font-mono text-fg">{fmt.decimal(c.monthlyBudgetVnd)}</span></div>
          </div>
        </SectionCard>
      ) : null}
    </DetailPageTemplate>
  );
}
