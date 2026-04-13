'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, Pencil, PauseCircle, UserX, Info } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import {
  EMPLOYEE_DETAIL_QUERY,
  TERMINATE_EMPLOYEE_MUTATION,
  ASSIGN_BADGE_MUTATION,
  type EmployeeDetailData,
  type EmployeeDetail as ServerEmployeeDetail,
  type TerminateEmployeeData,
  type AssignBadgeData,
} from '@graphql/queries/employee';
import { useAppSelector } from '@store/index';

type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'DISPATCH' | 'CONTRACTOR_AGENCY';
type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'CLOSED';
type TabKey = 'overview' | 'ledger' | 'transactions';

/* EMPLOYMENT_TYPE_LABEL removed — use t(`employmentType.${type}`) at render time */

const WALLET_STATUS_TONE: Record<WalletStatus, 'success' | 'warning' | 'info' | 'neutral'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  FROZEN: 'info',
  CLOSED: 'neutral',
};

interface EmployeeDetail {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Ledger types ── */

type LedgerSourceType = 'COMPANY_ALLOWANCE' | 'PERSONAL_TOP_UP';
type LedgerStatus = 'POSTED' | 'PENDING' | 'EXPIRED' | 'REVERSED';

interface LedgerEntry {
  id: string;
  datetime: string;
  sourceType: LedgerSourceType;
  amountVnd: number;
  status: LedgerStatus;
  memo: string | null;
}

/* LEDGER_SOURCE_LABEL removed — use t(`ledger.source.${type}`) at render time */

const LEDGER_SOURCE_TONE: Record<LedgerSourceType, 'brand' | 'success'> = {
  COMPANY_ALLOWANCE: 'brand',
  PERSONAL_TOP_UP: 'success',
};

const LEDGER_STATUS_TONE: Record<LedgerStatus, 'success' | 'neutral' | 'warning'> = {
  POSTED: 'success',
  PENDING: 'neutral',
  EXPIRED: 'neutral',
  REVERSED: 'warning',
};

/* LEDGER_STATUS_LABEL removed — use t(`ledger.statusLabel.${status}`) at render time */

/* ── Transaction types ── */

type TransactionStatus = 'APPROVED' | 'DECLINED' | 'REVERSED' | 'SETTLED';

interface TransactionEntry {
  id: string;
  datetime: string;
  merchantName: string;
  requestedAmountVnd: number;
  approvedAmountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  status: TransactionStatus;
}

const TX_STATUS_TONE: Record<TransactionStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  APPROVED: 'success',
  DECLINED: 'danger',
  REVERSED: 'warning',
  SETTLED: 'info',
};

/* TX_STATUS_LABEL removed — use t(`transaction.statusLabel.${status}`) at render time */

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'overview', labelKey: 'employee.tabs.overview' },
  { key: 'ledger', labelKey: 'employee.tabs.ledger' },
  { key: 'transactions', labelKey: 'employee.tabs.transactions' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('ko-KR');
}

function formatVnd(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toLocaleString('ko-KR')}`;
}

/** Map server-shape employee to local EmployeeDetail interface */
function mapServerToLocal(server: ServerEmployeeDetail): EmployeeDetail {
  return {
    id: server.id,
    employeeCode: server.employeeCode,
    fullName: server.fullName,
    email: server.email ?? '',
    phone: server.phone ?? '',
    departmentId: server.departmentId,
    status: server.status,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

export function EmployeeDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.EMPLOYEE_READ);
  const canWrite = useHasPermission(PERMISSIONS.EMPLOYEE_WRITE);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [terminateReason, setTerminateReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [badgeInput, setBadgeInput] = useState('');
  const [badgeAssigning, setBadgeAssigning] = useState(false);

  /* ── Queries ── */
  const { data, loading } = useQuery<EmployeeDetailData>(EMPLOYEE_DETAIL_QUERY, {
    variables: { id: params?.id },
    skip: !params?.id,
  });

  const serverEmployee = data?.mealEmployee?.success?.data ?? null;
  const employee: EmployeeDetail | null = serverEmployee ? mapServerToLocal(serverEmployee) : null;

  // Tab 2: ledger data — needs separate wallet funding entries query
  const ledgerEntries: LedgerEntry[] = [];

  // Tab 3: transaction data — separate query needed, keep empty for now
  const transactionEntries: TransactionEntry[] = [];

  /* ── Mutations ── */
  const [terminateEmployee, { loading: terminating }] = useMutation<TerminateEmployeeData>(TERMINATE_EMPLOYEE_MUTATION);
  const [assignBadge] = useMutation<AssignBadgeData>(ASSIGN_BADGE_MUTATION);

  if (hydrated && !canRead) return <LockedScreen />;

  const handleEdit = () => {
    // TODO: Open edit modal or navigate to edit page
  };

  const handleSuspend = () => {
    // TODO: Call employeeSuspend mutation
  };

  const handleTerminate = () => {
    setShowTerminateDialog(true);
  };

  const handleAssignBadge = async () => {
    if (!badgeInput.trim() || !params?.id) return;
    setBadgeAssigning(true);
    setActionError(null);
    try {
      const result = await assignBadge({
        variables: { employeeId: params.id, badgeRfid: badgeInput.trim() },
        refetchQueries: [{ query: EMPLOYEE_DETAIL_QUERY, variables: { id: params.id } }],
      });
      const err = result.data?.mealEmployeeAssignBadge?.error;
      if (err) {
        setActionError(err.message);
      } else {
        setBadgeInput('');
      }
    } catch {
      setActionError(t('employee.badgeAssignError'));
    } finally {
      setBadgeAssigning(false);
    }
  };

  const handleConfirmTerminate = async () => {
    setActionError(null);
    try {
      const result = await terminateEmployee({
        variables: { id: params!.id },
      });
      const err = result.data?.mealEmployeeTerminate?.error;
      if (err) {
        setActionError(err.message);
        return;
      }
      router.push('/employees');
    } catch {
      setActionError(t('employee.terminateError'));
    }
  };

  /* ── Ledger columns ── */
  const ledgerColumns: DataTableColumn<LedgerEntry>[] = [
    {
      key: 'datetime',
      header: t('ledger.datetime'),
      width: '160px',
      render: (r) => <span className="text-[13px] text-fg">{r.datetime}</span>,
    },
    {
      key: 'sourceType',
      header: t('ledger.sourceType'),
      width: '160px',
      render: (r) => (
        <Badge tone={LEDGER_SOURCE_TONE[r.sourceType]} size="sm">
          {t(`ledger.source.${r.sourceType}`)}
        </Badge>
      ),
    },
    {
      key: 'amountVnd',
      header: t('ledger.amount'),
      width: '140px',
      align: 'right',
      render: (r) => (
        <span className={`font-mono text-[13px] font-semibold ${r.amountVnd >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
          {formatVnd(r.amountVnd)} VND
        </span>
      ),
    },
    {
      key: 'status',
      header: t('ledger.status'),
      width: '100px',
      render: (r) => (
        <Badge
          tone={LEDGER_STATUS_TONE[r.status]}
          size="sm"
        >
          <span className={r.status === 'EXPIRED' ? 'line-through' : ''}>
            {t(`ledger.statusLabel.${r.status}`)}
          </span>
        </Badge>
      ),
    },
    {
      key: 'memo',
      header: t('ledger.memo'),
      render: (r) => (
        <span className="text-[13px] text-fg-muted">{r.memo ?? '—'}</span>
      ),
    },
  ];

  /* ── Transaction columns ── */
  const transactionColumns: DataTableColumn<TransactionEntry>[] = [
    {
      key: 'datetime',
      header: t('transaction.datetime'),
      width: '160px',
      render: (r) => <span className="text-[13px] text-fg">{r.datetime}</span>,
    },
    {
      key: 'merchantName',
      header: t('transaction.merchant'),
      width: '160px',
      render: (r) => <span className="text-[13px] font-semibold text-fg">{r.merchantName}</span>,
    },
    {
      key: 'requestedAmountVnd',
      header: t('transaction.requestedAmount'),
      width: '120px',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-[13px] text-fg">
          {formatCurrency(r.requestedAmountVnd)}
        </span>
      ),
    },
    {
      key: 'approvedAmountVnd',
      header: t('transaction.approvedAmount'),
      width: '120px',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-[13px] font-semibold text-fg">
          {formatCurrency(r.approvedAmountVnd)}
        </span>
      ),
    },
    {
      key: 'split',
      header: t('transaction.companySplit'),
      width: '180px',
      render: (r) => {
        const isSplit = r.companyShareVnd > 0 && r.employeeShareVnd > 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-fg-muted">
              {formatCurrency(r.companyShareVnd)} / {formatCurrency(r.employeeShareVnd)}
            </span>
            {isSplit && (
              <Badge tone="info" size="sm">Split</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: t('transaction.status'),
      width: '100px',
      render: (r) => (
        <Badge tone={TX_STATUS_TONE[r.status]} size="sm">
          {t(`transaction.statusLabel.${r.status}`)}
        </Badge>
      ),
    },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.employees'), href: '/employees' },
          { label: employee?.fullName ?? '...' },
        ],
        title: employee?.fullName ?? t('common.loading'),
        description: employee
          ? `${employee.employeeCode} · ${employee.status}`
          : undefined,
        actions: (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => router.push('/employees')}
            >
              {t('common.back')}
            </Button>
            {canWrite && (
              <>
                <Button variant="ghost" startIcon={<Pencil size={14} />} onClick={handleEdit}>
                  {t('common.edit')}
                </Button>
                <Button variant="ghost" startIcon={<PauseCircle size={14} />} onClick={handleSuspend}>
                  {t('action.suspend')}
                </Button>
                <Button variant="danger" startIcon={<UserX size={14} />} onClick={handleTerminate}>
                  {t('action.terminate')}
                </Button>
              </>
            )}
          </div>
        ),
      }}
      summaryItems={[
        {
          label: t('employee.summaryStatus'),
          value: employee?.status ?? '—',
          tone: employee?.status === 'ACTIVE' ? 'success' : 'neutral',
        },
      ]}
    >
      {/* Terminate confirm dialog */}
      {showTerminateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="w-full max-w-md rounded-xl border p-6 shadow-xl"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <h3 className="text-lg font-bold text-fg">{t('employee.terminateTitle')}</h3>
            <p className="mt-2 text-sm text-fg-muted">
              <strong>{employee?.fullName ?? '...'}</strong>{t('employee.terminateMessage')}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-fg-muted">
              <li>- {t('employee.terminateWallet')}</li>
              <li>- {t('employee.terminateRecovery')}</li>
              <li>- {t('employee.terminateRefund')}</li>
              <li>- {t('employee.terminateIrreversible')}</li>
            </ul>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-fg-muted">{t('employee.terminateReasonLabel')}</label>
              <textarea
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                rows={2}
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                placeholder={t('employee.terminateReasonPlaceholder')}
              />
            </div>
            {actionError && (
              <p className="mt-2 text-sm text-[var(--danger)]">{actionError}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setShowTerminateDialog(false); setActionError(null); }}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" onClick={handleConfirmTerminate} loading={terminating}>
                {t('employee.terminateConfirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {actionError && !showTerminateDialog && (
        <div
          className="mb-3 rounded-lg border px-4 py-3 text-sm text-[var(--danger)]"
          style={{ borderColor: 'var(--danger)', background: 'var(--danger-soft, rgba(239,68,68,0.08))' }}
        >
          {actionError}
        </div>
      )}

      {/* External sync banner — isExternalSync not available in current schema */}

      {/* Tab navigation */}
      <div className="mb-3 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-[13px] font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[var(--surface-raised)] text-fg shadow-sm'
                : 'text-fg-muted hover:text-fg'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <>
          {/* Profile information */}
          <SectionCard title={t('employee.profileTitle')}>
            {loading || !employee ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={20} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.name')}</span>
                  <span className="text-[14px] font-semibold text-fg">{employee.fullName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.code')}</span>
                  <span className="font-mono text-[14px] text-fg">{employee.employeeCode}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.email')}</span>
                  <span className="text-[14px] text-fg">{employee.email}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.phone')}</span>
                  <span className="text-[14px] text-fg">{employee.phone || '—'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.department')}</span>
                  <span className="text-[14px] text-fg">{employee.departmentId ?? '—'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.status')}</span>
                  <Badge tone={employee.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm" startDot>
                    {employee.status}
                  </Badge>
                </div>
              </div>
            )}
          </SectionCard>

          {/* RFID Badge section */}
          <SectionCard title={t('employee.badgeTitle')}>
            {loading || !employee ? (
              <Skeleton height={48} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{t('employee.currentBadge')}</span>
                  {serverEmployee?.badgeRfid ? (
                    <Badge tone="brand" size="sm">{serverEmployee.badgeRfid}</Badge>
                  ) : (
                    <span className="text-[13px] text-fg-subtle">{t('employee.badgeUnassigned')}</span>
                  )}
                </div>
                {canWrite && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="h-9 rounded-lg border px-3 text-sm"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                      placeholder={t('employee.badgePlaceholder')}
                      value={badgeInput}
                      onChange={(e) => setBadgeInput(e.target.value)}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAssignBadge}
                      loading={badgeAssigning}
                      disabled={!badgeInput.trim()}
                    >
                      {serverEmployee?.badgeRfid ? t('employee.badgeReplace') : t('employee.badgeAssign')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Allowance Ledger summary — wallet data requires separate mealWallet query */}
          <SectionCard title={t('employee.allowanceSummary')}>
            <p className="text-sm text-fg-muted">{t('common.empty')}</p>
          </SectionCard>
        </>
      )}

      {activeTab === 'ledger' && (
        <SectionCard title={t('employee.ledgerTitle')} description={t('employee.ledgerDescription')} padding="none">
          <DataTable
            columns={ledgerColumns}
            rows={ledgerEntries}
            rowKey={(r) => r.id}
            compact
            emptyState={t('employee.ledgerEmpty')}
          />
        </SectionCard>
      )}

      {activeTab === 'transactions' && (
        <SectionCard title={t('employee.txTitle')} description={t('employee.txDescription')} padding="none">
          {/* TODO: useQuery(EMPLOYEE_TRANSACTIONS_QUERY) — separate query needed */}
          <DataTable
            columns={transactionColumns}
            rows={transactionEntries}
            rowKey={(r) => r.id}
            compact
            emptyState={t('employee.txEmpty')}
          />
        </SectionCard>
      )}
    </DetailPageTemplate>
  );
}
