'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Banknote, Wallet } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  NumberInput,
  Select,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_WALLETS_QUERY,
  CREATE_MEAL_WALLET_MUTATION,
  FUND_MEAL_WALLET_MUTATION,
  TOPUP_MEAL_WALLET_MUTATION,
  type CorporateWalletsData,
  type CorporateWalletRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';

type ModalType = null | 'create' | 'fund' | 'topup';

export function CorporateWalletsScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const fmt = useCurrencyFormat('VND');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_WALLET_READ);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_WALLET_WRITE);
  const canFund = useHasPermission(PERMISSIONS.CORPORATE_WALLET_FUND);
  const canTopUp = useHasPermission(PERMISSIONS.CORPORATE_WALLET_TOPUP);

  const { data, loading, refetch } = useQuery<CorporateWalletsData>(CORPORATE_WALLETS_QUERY, {
    variables: { id: corporateId, skip: 0, take: 100 },
    skip: !corporateId,
    errorPolicy: 'all',
  });
  const [createWallet, { loading: creating }] = useMutation(CREATE_MEAL_WALLET_MUTATION, { onCompleted: () => refetch() });
  const [fundWallet, { loading: funding }] = useMutation(FUND_MEAL_WALLET_MUTATION, { onCompleted: () => refetch() });
  const [topupWallet, { loading: toppingUp }] = useMutation(TOPUP_MEAL_WALLET_MUTATION, { onCompleted: () => refetch() });

  const [modal, setModal] = useState<ModalType>(null);
  const [selectedWallet, setSelectedWallet] = useState<CorporateWalletRow | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState('100000');
  const [amount, setAmount] = useState('0');
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const employees = data?.mealEmployees.success?.data ?? [];
  const empById = new Map(employees.map((e) => [e.id, e]));
  const wallets = data?.mealWalletsByCorporate.success?.data ?? [];

  const cols: DataTableColumn<CorporateWalletRow>[] = [
    {
      key: 'emp',
      header: t('field.employee'),
      render: (r) => {
        const emp = empById.get(r.employeeId);
        return emp ? (
          <span>
            <span className="font-mono text-[12px] text-fg">{emp.employeeCode}</span>
            <span className="ml-2 text-fg-muted">{emp.fullName}</span>
          </span>
        ) : (
          <span className="font-mono text-[11px] text-fg-subtle">{r.employeeId.slice(0, 8)}</span>
        );
      },
    },
    { key: 'bal', header: t('field.balance'), align: 'right', render: (r) => <span className="num font-mono text-[12px] font-bold">{fmt.decimal(r.balanceVnd)}</span> },
    { key: 'comp', header: t('field.companyAllowance'), align: 'right', render: (r) => <span className="num font-mono text-[12px] text-success">{fmt.decimal(r.companyAllowanceVnd)}</span> },
    { key: 'pers', header: t('field.personalTopUp'), align: 'right', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.personalTopUpVnd)}</span> },
    { key: 'daily', header: t('field.dailyLimit'), align: 'right', render: (r) => <span className="num font-mono text-[12px] text-fg-muted">{fmt.decimal(r.dailyLimitVnd)}</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      width: '200px',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          {canFund && (
            <button
              type="button"
              onClick={() => {
                setSelectedWallet(r);
                setAmount('0');
                setModal('fund');
              }}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold text-success"
              style={{ background: 'var(--success-soft)' }}
            >
              <Banknote size={11} /> Fund
            </button>
          )}
          {canTopUp && (
            <button
              type="button"
              onClick={() => {
                setSelectedWallet(r);
                setAmount('0');
                setModal('topup');
              }}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-bold text-primary"
              style={{ background: 'var(--primary-soft)' }}
            >
              <Wallet size={11} /> Top-up
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!employeeId) {
      setError(t('corporate.errorEmployeeRequired'));
      return;
    }
    const res = await createWallet({ variables: { input: { employeeId, dailyLimitVnd: dailyLimit } } });
    const env = res.data?.mealWalletCreate;
    if (env?.error) return setError(env.error.message);
    setModal(null);
    setEmployeeId(null);
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedWallet) return;
    const res = await fundWallet({ variables: { input: { walletId: selectedWallet.id, amountVnd: amount, sourceBatchId: null } } });
    const env = res.data?.mealWalletFund;
    if (env?.error) return setError(env.error.message);
    setModal(null);
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedWallet) return;
    const res = await topupWallet({ variables: { input: { walletId: selectedWallet.id, amountVnd: amount, paymentReferenceId: null } } });
    const env = res.data?.mealWalletTopUp;
    if (env?.error) return setError(env.error.message);
    setModal(null);
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${corporateId}` },
          { label: t('corporate.wallets.summary.total') },
        ],
        title: c ? `${c.companyName} · ${t('corporate.detail.subnav.wallets')}` : t('common.loading'),
        description: '임직원별 allowance ledger · 회사지원금 fund / 개인충전 top-up',
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-WALLET-001</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${corporateId}`)}>{t('action.cancel')}</Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => { setEmployeeId(null); setModal('create'); }}>
                {t('corporate.action.cta.createWallet')}
              </Button>
            )}
          </>
        ),
      }}
      summaryItems={[
        { label: t('corporate.wallets.summary.total'), value: wallets.length, tone: 'brand' },
        { label: t('corporate.wallets.summary.active'), value: wallets.filter((w) => w.status === 'ACTIVE').length, tone: 'success' },
        { label: t('corporate.wallets.summary.deposit'), value: fmt.decimal(c?.depositBalanceVnd), tone: 'info' },
      ]}
    >
      {modal && (
        <div className="mb-3">
          <SectionCard
            title={modal === 'create' ? t('corporate.wallets.formCreateTitle') : modal === 'fund' ? t('corporate.wallets.formFundTitle') : t('corporate.wallets.formTopUpTitle')}
            description={selectedWallet ? `wallet ${selectedWallet.id.slice(0, 8)} · balance ${fmt.decimal(selectedWallet.balanceVnd)}` : undefined}
          >
            <form
              onSubmit={modal === 'create' ? handleCreate : modal === 'fund' ? handleFund : handleTopUp}
              className="flex flex-col gap-3"
            >
              {error && <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>}
              {modal === 'create' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-fg-muted">{t('field.employee')} *</label>
                    <Select
                      value={employeeId}
                      onChange={(v) => setEmployeeId(String(v))}
                      options={employees.map((e) => ({ value: e.id, label: `${e.employeeCode} · ${e.fullName}` }))}
                      placeholder={t('field.selectEmployee')}
                      minWidth="100%"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-fg-muted">{t('field.dailyLimit')}</label>
                    <NumberInput value={dailyLimit} locale={localeTag} min={0} onValueChange={({ value }) => setDailyLimit(String(value ?? 0))} style={{ width: '100%' }} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.amount')} *</label>
                  <NumberInput value={amount} locale={localeTag} min={0} onValueChange={({ value }) => setAmount(String(value ?? 0))} style={{ width: '100%' }} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setModal(null)}>{t('action.cancel')}</Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={creating || funding || toppingUp}
                >
                  {modal === 'create' ? t('action.create') : modal === 'fund' ? 'Fund' : 'Top-up'}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}
      <SectionCard title={t('corporate.wallets.cardTitle')} description={`${wallets.length} wallet(s)`} padding="none">
        {loading && wallets.length === 0 ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <DataTable columns={cols} rows={wallets} rowKey={(r) => r.id} compact emptyState={t('corporate.wallets.empty')} />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
