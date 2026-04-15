'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, Pencil, PauseCircle, UserX } from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  Tabs,
  Pagination,
  Modal,
  ConfirmModal,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import {
  EMPLOYEE_DETAIL_QUERY,
  ASSIGN_BADGE_MUTATION,
  UPDATE_EMPLOYEE_MUTATION,
  SUSPEND_EMPLOYEE_MUTATION,
  TERMINATE_EMPLOYEE_MUTATION,
  type EmployeeDetailData,
  type AssignBadgeData,
} from '@graphql/queries/employee';
import {
  TRANSACTIONS_FILTERED_QUERY,
  WALLET_FUNDING_ENTRIES_QUERY,
  type TransactionsFilteredData,
  type TransactionRow,
  type WalletFundingEntriesData,
  type WalletFundingEntry,
} from '@graphql/queries/budget';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { formatDateTime, formatCurrency, toLocaleTag } from '@shared/utils/format';
import { useAppSelector } from '@store/index';

/* ─────────────────────── Types ─────────────────────── */

type TabKey = 'overview' | 'ledger' | 'transactions';

const STATUS_TONE: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = {
  APPROVED: 'success', DECLINED: 'danger', REVERSED: 'warning', SETTLED: 'info',
  POSTED: 'success', PENDING: 'neutral', EXPIRED: 'neutral',
  ACTIVE: 'success', SUSPENDED: 'warning', FROZEN: 'info', CLOSED: 'neutral',
};

/* ─────────────────────── Transaction Detail Modal ─────────────────────── */

function TransactionDetailModal({ tx, open, onClose }: { tx: TransactionRow | null; open: boolean; onClose: () => void }) {
  const { t, locale } = useI18n();
  const localeTag = toLocaleTag(locale);
  if (!tx) return null;

  const isSplit = Number(tx.companyShareVnd) > 0 && Number(tx.employeeShareVnd) > 0;

  return (
    <Modal open={open} onClose={onClose} title={t('employee.txDetail.title')} width={640}>
      <div className="flex flex-col gap-4">
        {/* Status banner */}
        <div className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <Badge tone={STATUS_TONE[tx.status] ?? 'neutral'} size="sm" startDot>{t(`transaction.statusLabel.${tx.status}`)}</Badge>
          <span className="font-mono text-[11px] text-fg-muted">{tx.id.slice(0, 12)}…</span>
        </div>

        {/* Amount section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] text-fg-muted">{t('transaction.approvedAmount')}</p>
            <p className="mt-0.5 text-lg font-bold text-fg">{formatCurrency(tx.approvedAmountVnd)}</p>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] text-fg-muted">{t('transaction.requestedAmount')}</p>
            <p className="mt-0.5 text-lg font-bold text-fg-muted">{formatCurrency(tx.requestedAmountVnd)}</p>
          </div>
        </div>

        {/* Split payment */}
        {isSplit && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[11px] text-fg-muted">{t('transaction.companyShare')}</p>
              <p className="mt-0.5 font-mono font-semibold text-fg">{formatCurrency(tx.companyShareVnd)}</p>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[11px] text-fg-muted">{t('transaction.employeeShare')}</p>
              <p className="mt-0.5 font-mono font-semibold text-fg">{formatCurrency(tx.employeeShareVnd)}</p>
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="flex flex-col divide-y text-[12.5px]" style={{ borderColor: 'var(--border)' }}>
          <Row label={t('employee.txDetail.merchant')} value={tx.brandName ?? tx.brandHqId?.slice(0, 8) ?? '—'} />
          <Row label={t('employee.txDetail.branch')} value={tx.branchName ?? tx.branchId?.slice(0, 8) ?? '—'} />
          <Row label={t('transaction.datetime')} value={formatDateTime(tx.createdAt, localeTag)} />
          <Row label={t('transaction.method')} value={t(`enum.authMethod.${tx.authMethod}`)} />
          <Row label={t('employee.txDetail.loopType')} value={t(`enum.loopType.${tx.loopType}`)} />
          {tx.authorizedAt && <Row label={t('employee.txDetail.authorizedAt')} value={formatDateTime(tx.authorizedAt, localeTag)} />}
          {tx.settledAt && <Row label={t('employee.txDetail.settledAt')} value={formatDateTime(tx.settledAt, localeTag)} />}
          {tx.declineReason && <Row label={t('employee.txDetail.declineReason')} value={t(`enum.declineReason.${tx.declineReason}`)} />}
          {tx.orderId && <Row label={t('employee.txDetail.orderId')} value={<span className="font-mono">{tx.orderId.slice(0, 12)}…</span>} />}
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-32 shrink-0 text-fg-muted">{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}

/* ─────────────────────── Main Screen ─────────────────────── */

export function EmployeeDetailScreen() {
  const { t, locale } = useI18n();
  const localeTag = toLocaleTag(locale);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.EMPLOYEE_READ);
  const canWrite = useHasPermission(PERMISSIONS.EMPLOYEE_WRITE);
  const corporateId = useCorporateId();
  const employeeId = params?.id;

  // URL-based tab
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview';
  const setTab = (tab: TabKey) => {
    const p = new URLSearchParams(searchParams.toString());
    if (tab === 'overview') p.delete('tab'); else p.set('tab', tab);
    router.push(`/employees/${employeeId}?${p.toString()}`);
  };

  // States
  const [badgeInput, setBadgeInput] = useState('');
  const [badgeAssigning, setBadgeAssigning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Pagination
  const [txSkip, setTxSkip] = useState(0);
  const [ledgerSkip, setLedgerSkip] = useState(0);
  const pageSize = 20;

  /* ── Queries (1P1Q — only active tab fetches) ── */
  const { data: empData, loading: empLoading } = useQuery<EmployeeDetailData>(EMPLOYEE_DETAIL_QUERY, {
    variables: { id: employeeId },
    skip: !employeeId,
  });

  const employee = empData?.mealEmployee?.success?.data ?? null;
  const walletId = employee ? (employee as unknown as { wallet?: { id?: string } }).wallet?.id : null;

  const { data: txData, loading: txLoading } = useQuery<TransactionsFilteredData>(
    TRANSACTIONS_FILTERED_QUERY,
    {
      variables: { corporateId, skip: txSkip, take: pageSize, employeeId },
      skip: !corporateId || !employeeId || activeTab !== 'transactions',
    },
  );
  const txRows = txData?.mealTransactionsByCorporate?.success?.data ?? [];
  const txTotal = txData?.mealTransactionsByCorporate?.success?.totalCount ?? txRows.length;

  const { data: ledgerData, loading: ledgerLoading } = useQuery<WalletFundingEntriesData>(
    WALLET_FUNDING_ENTRIES_QUERY,
    {
      variables: { walletId, skip: ledgerSkip, take: pageSize },
      skip: !walletId || activeTab !== 'ledger',
    },
  );
  const ledgerRows = ledgerData?.mealWalletFundingEntriesByWallet?.success?.data ?? [];
  const ledgerTotal = ledgerData?.mealWalletFundingEntriesByWallet?.success?.totalCount ?? ledgerRows.length;

  /* ── Mutations ── */
  const [assignBadge] = useMutation<AssignBadgeData>(ASSIGN_BADGE_MUTATION);
  const [updateEmployee, { loading: updating }] = useMutation(UPDATE_EMPLOYEE_MUTATION);
  const [suspendEmployee, { loading: suspending }] = useMutation(SUSPEND_EMPLOYEE_MUTATION);
  const [terminateEmployee, { loading: terminating }] = useMutation(TERMINATE_EMPLOYEE_MUTATION);

  if (hydrated && !canRead) return <LockedScreen />;

  const handleAssignBadge = async () => {
    if (!badgeInput.trim() || !employeeId) return;
    setBadgeAssigning(true);
    setActionError(null);
    try {
      const result = await assignBadge({
        variables: { employeeId, badgeRfid: badgeInput.trim() },
        refetchQueries: [{ query: EMPLOYEE_DETAIL_QUERY, variables: { id: employeeId } }],
      });
      if (result.data?.mealEmployeeAssignBadge?.error) {
        setActionError(result.data.mealEmployeeAssignBadge.error.message);
      } else {
        setBadgeInput('');
      }
    } catch {
      setActionError(t('employee.badgeAssignError'));
    } finally {
      setBadgeAssigning(false);
    }
  };

  /* ── Transaction columns ── */
  const txColumns: DataTableColumn<TransactionRow>[] = [
    { key: 'createdAt', header: t('transaction.datetime'), width: '140px', render: (r) => <span className="text-[12px] text-fg-muted">{formatDateTime(r.createdAt, localeTag)}</span> },
    { key: 'brandName', header: t('employee.txDetail.merchant'), render: (r) => <span className="font-medium text-fg">{r.brandName ?? '—'}</span> },
    { key: 'branchName', header: t('employee.txDetail.branch'), width: '140px', render: (r) => <span className="text-[12px] text-fg-muted">{r.branchName ?? '—'}</span> },
    { key: 'approvedAmountVnd', header: t('transaction.approvedAmount'), width: '130px', align: 'right', render: (r) => <span className="font-mono text-[12px] font-semibold text-fg">{formatCurrency(r.approvedAmountVnd)}</span> },
    { key: 'companyShareVnd', header: t('transaction.companyShare'), width: '110px', align: 'right', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{formatCurrency(r.companyShareVnd)}</span> },
    { key: 'employeeShareVnd', header: t('transaction.employeeShare'), width: '110px', align: 'right', render: (r) => <span className="font-mono text-[11px] text-fg-muted">{formatCurrency(r.employeeShareVnd)}</span> },
    { key: 'status', header: t('transaction.status'), width: '100px', render: (r) => <Badge tone={STATUS_TONE[r.status] ?? 'neutral'} size="sm">{t(`transaction.statusLabel.${r.status}`)}</Badge> },
  ];

  /* ── Ledger columns ── */
  const ledgerColumns: DataTableColumn<WalletFundingEntry>[] = [
    { key: 'createdAt', header: t('ledger.datetime'), width: '150px', render: (r) => <span className="text-[12px] text-fg-muted">{formatDateTime(r.createdAt, localeTag)}</span> },
    { key: 'sourceType', header: t('ledger.sourceType'), width: '150px', render: (r) => <Badge tone={r.sourceType === 'COMPANY_ALLOWANCE' ? 'brand' : 'success'} size="sm">{t(`ledger.source.${r.sourceType}`)}</Badge> },
    {
      key: 'amountVnd', header: t('ledger.amount'), width: '140px', align: 'right',
      render: (r) => {
        const n = Number(r.amountVnd);
        return <span className={`font-mono text-[12px] font-semibold ${n >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{n >= 0 ? '+' : ''}{formatCurrency(r.amountVnd)}</span>;
      },
    },
    { key: 'status', header: t('ledger.status'), width: '100px', render: (r) => <Badge tone={STATUS_TONE[r.status] ?? 'neutral'} size="sm">{t(`ledger.statusLabel.${r.status}`)}</Badge> },
    { key: 'note', header: t('ledger.memo'), render: (r) => <span className="text-[12px] text-fg-muted">{r.note ?? '—'}</span> },
  ];

  const tabItems = [
    { key: 'overview' as const, label: t('employee.tabs.overview') },
    { key: 'ledger' as const, label: t('employee.tabs.ledger') },
    { key: 'transactions' as const, label: `${t('employee.tabs.transactions')} (${activeTab === 'transactions' ? txTotal : '…'})` },
  ];

  return (
    <>
      <DetailPageTemplate
        header={{
          breadcrumbs: [
            { label: t('nav.employees'), href: '/employees' },
            { label: employee?.fullName ?? '...' },
          ],
          title: employee?.fullName ?? t('common.loading'),
          description: employee ? `${employee.employeeCode} · ${t(`status.${employee.status}`)}` : undefined,
          actions: (
            <div className="flex gap-2">
              <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/employees')}>
                {t('common.back')}
              </Button>
              {canWrite && (
                <>
                  <Button variant="ghost" startIcon={<Pencil size={14} />} onClick={() => {
                    setEditFullName(employee?.fullName ?? '');
                    setEditEmail(employee?.email ?? '');
                    setEditPhone(employee?.phone ?? '');
                    setShowEditModal(true);
                  }}>
                    {t('common.edit')}
                  </Button>
                  {employee?.status === 'ACTIVE' && (
                    <Button variant="ghost" startIcon={<PauseCircle size={14} />} onClick={() => setShowSuspendConfirm(true)}>
                      {t('action.suspend')}
                    </Button>
                  )}
                  <Button variant="danger" startIcon={<UserX size={14} />} onClick={() => setShowTerminateConfirm(true)}>
                    {t('action.terminate')}
                  </Button>
                </>
              )}
            </div>
          ),
        }}
        summaryItems={[
          { label: t('employee.summaryStatus'), value: employee ? t(`status.${employee.status}`) : '—', tone: employee?.status === 'ACTIVE' ? 'success' : 'neutral' },
        ]}
        tabs={<Tabs variant="segment" items={tabItems} value={activeTab} onChange={(k) => setTab(k as TabKey)} />}
      >
        {actionError && (
          <div className="mb-3 rounded-lg border px-4 py-3 text-sm text-[var(--danger)]" style={{ borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>
            {actionError}
          </div>
        )}

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4 mt-4">
            <SectionCard title={t('employee.profileTitle')}>
              {empLoading || !employee ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={20} />)}</div>
              ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label={t('employee.name')} value={employee.fullName} />
                  <Field label={t('employee.code')} value={<span className="font-mono">{employee.employeeCode}</span>} />
                  <Field label={t('employee.email')} value={employee.email ?? '—'} />
                  <Field label={t('employee.phone')} value={employee.phone ?? '—'} />
                  <Field label={t('employee.department')} value={employee.departmentId ?? '—'} />
                  <Field label={t('employee.status')} value={<div><Badge tone={STATUS_TONE[employee.status] ?? 'neutral'} size="sm" startDot>{t(`status.${employee.status}`)}</Badge></div>} />
                </div>
              )}
            </SectionCard>

            <SectionCard title={t('employee.badgeTitle')}>
              {empLoading || !employee ? <Skeleton height={48} /> : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.currentBadge')}</span>
                    {employee.badgeRfid ? <Badge tone="brand" size="sm">{employee.badgeRfid}</Badge> : <span className="text-[13px] text-fg-subtle">{t('employee.badgeUnassigned')}</span>}
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-2">
                      <input type="text" className="h-9 rounded-lg border px-3 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }} placeholder={t('employee.badgePlaceholder')} value={badgeInput} onChange={(e) => setBadgeInput(e.target.value)} />
                      <Button variant="primary" size="sm" onClick={handleAssignBadge} loading={badgeAssigning} disabled={!badgeInput.trim()}>
                        {employee.badgeRfid ? t('employee.badgeReplace') : t('employee.badgeAssign')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ── Ledger Tab ── */}
        {activeTab === 'ledger' && (
          <div className="mt-4">
            <SectionCard title={t('employee.ledgerTitle')} description={`${ledgerTotal}`} padding="none">
              {ledgerLoading && ledgerRows.length === 0 ? (
                <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
              ) : (
                <>
                  <DataTable columns={ledgerColumns} rows={ledgerRows} rowKey={(r) => r.id} compact emptyState={t('employee.ledgerEmpty')} />
                  <div className="p-4"><Pagination skip={ledgerSkip} take={pageSize} total={ledgerTotal} onPageChange={setLedgerSkip} /></div>
                </>
              )}
            </SectionCard>
          </div>
        )}

        {/* ── Transactions Tab ── */}
        {activeTab === 'transactions' && (
          <div className="mt-4">
            <SectionCard title={t('employee.txTitle')} description={`${txTotal}`} padding="none">
              {txLoading && txRows.length === 0 ? (
                <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
              ) : (
                <>
                  <DataTable columns={txColumns} rows={txRows} rowKey={(r) => r.id} compact emptyState={t('employee.txEmpty')} onRowClick={(r) => setSelectedTx(r)} />
                  <div className="p-4"><Pagination skip={txSkip} take={pageSize} total={txTotal} onPageChange={setTxSkip} /></div>
                </>
              )}
            </SectionCard>
          </div>
        )}
      </DetailPageTemplate>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal tx={selectedTx} open={!!selectedTx} onClose={() => setSelectedTx(null)} />

      {/* Suspend Confirm Modal */}
      <ConfirmModal
        open={showSuspendConfirm}
        onClose={() => setShowSuspendConfirm(false)}
        onConfirm={async () => {
          try {
            const res = await suspendEmployee({ variables: { id: employeeId }, refetchQueries: [{ query: EMPLOYEE_DETAIL_QUERY, variables: { id: employeeId } }] });
            if (res.data?.mealEmployeeSuspend?.error) {
              toast.error(res.data.mealEmployeeSuspend.error.message);
            } else {
              toast.success(t('employee.suspendSuccess'));
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : t('common.errorOccurred'));
          }
          setShowSuspendConfirm(false);
        }}
        title={t('employee.suspendTitle')}
        message={
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <p className="font-semibold text-fg">{employee?.fullName ?? '—'}</p>
              <p className="text-[12px] text-fg-muted">{employee?.employeeCode}{employee?.departmentId ? ` · ${employee.departmentId}` : ''}</p>
            </div>
            <p className="text-fg-muted">{t('employee.suspendWarning')}</p>
          </div>
        }
        confirmLabel={t('employee.suspendConfirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        busy={suspending}
      />

      {/* Terminate Confirm Modal */}
      <ConfirmModal
        open={showTerminateConfirm}
        onClose={() => setShowTerminateConfirm(false)}
        onConfirm={async () => {
          try {
            const res = await terminateEmployee({ variables: { id: employeeId }, refetchQueries: [{ query: EMPLOYEE_DETAIL_QUERY, variables: { id: employeeId } }] });
            if (res.data?.mealEmployeeTerminate?.error) {
              toast.error(res.data.mealEmployeeTerminate.error.message);
            } else {
              toast.success(t('employee.terminateSuccess'));
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : t('common.errorOccurred'));
          }
          setShowTerminateConfirm(false);
        }}
        title={t('employee.terminateTitle')}
        message={
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <p className="font-semibold text-fg">{employee?.fullName ?? '—'}</p>
              <p className="text-[12px] text-fg-muted">{employee?.employeeCode}{employee?.departmentId ? ` · ${employee.departmentId}` : ''}</p>
            </div>
            <p className="text-fg-muted">{t('employee.terminateWarning')}</p>
          </div>
        }
        confirmLabel={t('employee.terminateConfirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        busy={terminating}
      />

      {/* Edit Employee Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title={t('employee.editTitle')} width={480} footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={updating} onClick={async () => {
            try {
              const res = await updateEmployee({
                variables: { id: employeeId, fullName: editFullName || null, email: editEmail || null, phone: editPhone || null },
                refetchQueries: [{ query: EMPLOYEE_DETAIL_QUERY, variables: { id: employeeId } }],
              });
              if (res.data?.mealEmployeeUpdate?.error) {
                toast.error(res.data.mealEmployeeUpdate.error.message);
              } else {
                toast.success(t('employee.editSuccess'));
                setShowEditModal(false);
              }
            } catch (err) {
              toast.error(err instanceof Error ? err.message : t('common.errorOccurred'));
            }
          }}>{t('common.save')}</Button>
        </>
      }>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-medium text-fg-muted">{t('employee.name')}</label>
            <input type="text" className="h-9 rounded-lg border px-3 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }} value={editFullName} onChange={(e) => setEditFullName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-medium text-fg-muted">{t('employee.email')}</label>
            <input type="email" className="h-9 rounded-lg border px-3 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11.5px] font-medium text-fg-muted">{t('employee.phone')}</label>
            <input type="tel" className="h-9 rounded-lg border px-3 text-sm" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
        </div>
      </Modal>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{label}</span>
      <span className="text-[14px] text-fg">{value}</span>
    </div>
  );
}
