'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { RefreshCw, Plus, Coins, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  Pagination,
  Modal,
  NumberInput,
  Input,
  Checkbox,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';
import { WALLETS_QUERY, FUND_WALLET_MUTATION, type WalletsData, type WalletRow } from '@graphql/queries/budget';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

/* ─────────────────────── Fund Selected Modal ─────────────────────── */

function FundSelectedModal({
  open,
  onClose,
  targets,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  targets: WalletRow[];
  onComplete: () => void;
}) {
  const { t } = useI18n();
  const [amountPerPerson, setAmountPerPerson] = useState('');
  const [memo, setMemo] = useState('');
  const [fundWallet, { loading }] = useMutation(FUND_WALLET_MUTATION);

  const amount = Number(amountPerPerson) || 0;
  const total = amount * targets.length;

  const handleExecute = async () => {
    if (amount <= 0 || targets.length === 0) return;
    const batchId = `BATCH-${Date.now()}`;
    let success = 0;
    let failed = 0;

    for (const w of targets) {
      try {
        const res = await fundWallet({
          variables: { input: { walletId: w.id, amountVnd: String(amount), sourceBatchId: batchId } },
        });
        if (res.data?.mealWalletFund?.success) success++;
        else failed++;
      } catch {
        failed++;
      }
    }

    if (failed === 0) {
      toast.success(t('budget.batchFund.success').replace('{{count}}', String(success)));
    } else {
      toast.warning(t('budget.batchFund.partial').replace('{{success}}', String(success)).replace('{{failed}}', String(failed)));
    }
    onComplete();
    onClose();
    setAmountPerPerson('');
    setMemo('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('budget.loadAllowanceTitle')}
      width={520}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} disabled={amount <= 0} onClick={handleExecute}>
            {t('budget.confirmLoad')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <div className="flex justify-between text-[12px]">
            <span className="text-fg-muted">{t('budget.batchFund.targetCount')}</span>
            <span className="font-semibold text-fg">{targets.length}{t('budget.batchFund.people')}</span>
          </div>
          {amount > 0 && (
            <div className="mt-1 flex justify-between text-[12px]">
              <span className="text-fg-muted">{t('budget.batchFund.totalAmount')}</span>
              <span className="font-semibold text-fg">{formatCurrency(total)}</span>
            </div>
          )}
        </div>

        {/* Selected employees preview */}
        {targets.length <= 10 && (
          <div className="flex flex-wrap gap-1">
            {targets.map((w) => (
              <Badge key={w.id} tone="neutral" size="sm">{w.employee?.fullName ?? w.employeeId.slice(0, 8)}</Badge>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-fg-muted">{t('budget.amountPerPerson')} *</label>
          <NumberInput value={amountPerPerson} onValueChange={({ raw }) => setAmountPerPerson(raw)} locale="vi-VN" min={0} placeholder="100,000" style={{ width: '100%' }} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-fg-muted">{t('budget.memo')}</label>
          <Input value={memo} onChange={(e) => setMemo(e.target.value)} placeholder={t('budget.memoPlaceholder')} />
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────────────── Individual Fund Modal ─────────────────────── */

function FundSingleModal({
  open,
  onClose,
  wallet,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  wallet: WalletRow | null;
  onComplete: () => void;
}) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const [fundWallet, { loading }] = useMutation(FUND_WALLET_MUTATION);

  if (!wallet) return null;

  const handleFund = async () => {
    const n = Number(amount);
    if (n <= 0) return;
    try {
      const res = await fundWallet({ variables: { input: { walletId: wallet.id, amountVnd: String(n) } } });
      if (res.data?.mealWalletFund?.success) {
        toast.success(t('budget.fund.success'));
        onComplete();
        onClose();
        setAmount('');
      } else {
        toast.error(res.data?.mealWalletFund?.error?.message ?? t('common.errorOccurred'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.errorOccurred'));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('budget.fund.title')} width={440} footer={
      <>
        <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="primary" size="sm" loading={loading} disabled={Number(amount) <= 0} onClick={handleFund}>{t('budget.fund.confirm')}</Button>
      </>
    }>
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-semibold text-fg">{wallet.employee?.fullName ?? '—'}</p>
          <p className="text-[12px] text-fg-muted">{wallet.employee?.departmentName ?? ''} · {t('budget.balance')}: {formatCurrency(wallet.balanceVnd)}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-fg-muted">{t('budget.fund.amount')} *</label>
          <NumberInput value={amount} onValueChange={({ raw }) => setAmount(raw)} locale="vi-VN" min={0} placeholder="100,000" style={{ width: '100%' }} />
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────────────── Main Screen ─────────────────────── */

export function BudgetWalletsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.WALLET_READ);
  const canFund = useHasPermission(PERMISSIONS.WALLET_FUND);
  const corporateId = useCorporateId();

  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [fundOpen, setFundOpen] = useState(false);
  const [fundTarget, setFundTarget] = useState<WalletRow | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, loading, refetch } = useQuery<WalletsData>(WALLETS_QUERY, {
    variables: { corporateId, skip, take },
    skip: !corporateId,
  });
  const wallets: WalletRow[] = data?.mealWalletsByCorporate?.success?.data ?? [];
  const activeWallets = wallets.filter((w) => w.status === 'ACTIVE');

  if (hydrated && !canRead) return <LockedScreen />;

  const allActiveSelected = activeWallets.length > 0 && activeWallets.every((w) => selectedIds.has(w.id));
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allActiveSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeWallets.map((w) => w.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedWallets = wallets.filter((w) => selectedIds.has(w.id));

  const cols: DataTableColumn<WalletRow>[] = [
    ...(canFund ? [{
      key: 'select' as const,
      header: (
        <Checkbox
          checked={allActiveSelected}
          onChange={toggleAll}
        />
      ) as React.ReactNode,
      width: '40px',
      render: (r: WalletRow) => r.status === 'ACTIVE' ? (
        <Checkbox
          checked={selectedIds.has(r.id)}
          onChange={() => toggleOne(r.id)}
        />
      ) : null,
    }] : []),
    { key: 'name', header: t('budget.employeeName'), render: (r) => <span className="font-medium text-fg">{r.employee?.fullName ?? '—'}</span> },
    { key: 'dept', header: t('budget.department'), width: '130px', render: (r) => <span className="text-[12px] text-fg-muted">{r.employee?.departmentName ?? '—'}</span> },
    { key: 'balance', header: t('budget.balance'), width: '130px', align: 'right', render: (r) => <span className="font-mono text-[12px] font-semibold text-fg">{formatCurrency(r.balanceVnd)}</span> },
    { key: 'company', header: t('budget.companyAllowance'), width: '130px', align: 'right', render: (r) => <span className="font-mono text-[12px] text-fg">{formatCurrency(r.companyAllowanceVnd)}</span> },
    { key: 'personal', header: t('budget.personalTopUp'), width: '120px', align: 'right', render: (r) => <span className="font-mono text-[12px] text-fg">{formatCurrency(r.personalTopUpVnd)}</span> },
    {
      key: 'status', header: t('budget.walletStatus'), width: '80px',
      render: (r) => <Badge tone={r.status === 'ACTIVE' ? 'success' : r.status === 'SUSPENDED' ? 'warning' : 'neutral'} size="sm">{t(`status.${r.status}`)}</Badge>,
    },
    ...(canFund ? [{
      key: 'action' as const,
      header: '',
      width: '50px',
      align: 'right' as const,
      render: (r: WalletRow) => r.status === 'ACTIVE' ? (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFundTarget(r); }}>
          <Coins size={14} />
        </Button>
      ) : null,
    }] : []),
  ];

  return (
    <>
      <DetailPageTemplate
        header={{
          breadcrumbs: [{ label: t('nav.budget') }, { label: t('nav.budget.wallets') }],
          title: t('nav.budget.wallets'),
          description: t('budget.walletsDescription'),
          actions: (
            <div className="flex gap-2">
              <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
                {t('common.refresh')}
              </Button>
              {canFund && (
                <Button
                  variant="primary"
                  startIcon={someSelected ? <Check size={14} /> : <Plus size={14} />}
                  onClick={() => {
                    if (!someSelected) {
                      // 전체 선택 후 충전
                      setSelectedIds(new Set(activeWallets.map((w) => w.id)));
                    }
                    setFundOpen(true);
                  }}
                >
                  {someSelected
                    ? t('budget.fundSelected').replace('{{count}}', String(selectedIds.size))
                    : t('budget.loadAllowance')}
                </Button>
              )}
            </div>
          ),
        }}
      >
        {/* Selection info bar */}
        {someSelected && canFund && (
          <div className="mb-3 flex items-center justify-between rounded-lg border px-4 py-2.5" style={{ borderColor: 'var(--primary)', background: 'var(--primary-soft)' }}>
            <span className="text-[13px] font-semibold text-fg">
              {t('budget.selected').replace('{{count}}', String(selectedIds.size))}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                {t('budget.clearSelection')}
              </Button>
              <Button variant="primary" size="sm" startIcon={<Coins size={13} />} onClick={() => setFundOpen(true)}>
                {t('budget.fundSelected').replace('{{count}}', String(selectedIds.size))}
              </Button>
            </div>
          </div>
        )}

        <SectionCard title={t('budget.walletList')} description={`${wallets.length}`} padding="none">
          {loading ? (
            <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
          ) : (
            <>
              <DataTable columns={cols} rows={wallets} rowKey={(r) => r.id} compact emptyState={t('budget.walletEmpty')} onRowClick={(r) => router.push(`/employees/${r.employeeId}`)} />
              <div className="p-4">
                <Pagination skip={skip} take={take} total={wallets.length < take ? skip + wallets.length : skip + take + 1} onPageChange={(s) => { setSkip(s); setSelectedIds(new Set()); }} />
              </div>
            </>
          )}
        </SectionCard>
      </DetailPageTemplate>

      <FundSelectedModal
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        targets={selectedWallets.length > 0 ? selectedWallets : activeWallets}
        onComplete={() => { void refetch(); setSelectedIds(new Set()); }}
      />
      <FundSingleModal open={!!fundTarget} onClose={() => setFundTarget(null)} wallet={fundTarget} onComplete={() => void refetch()} />
    </>
  );
}
