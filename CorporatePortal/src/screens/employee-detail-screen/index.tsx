'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { EMPLOYEE_DETAIL_QUERY } from '@graphql/queries/employee';

// Keep EMPLOYEE_DETAIL_QUERY imported for future wiring
void EMPLOYEE_DETAIL_QUERY;

type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'DISPATCH' | 'CONTRACTOR_AGENCY';
type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'CLOSED';
type TabKey = 'overview' | 'ledger' | 'transactions';

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  DISPATCH: '파견직',
  CONTRACTOR_AGENCY: '도급',
};

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
  departmentName: string;
  employmentType: EmploymentType;
  hireDate: string;
  walletStatus: WalletStatus;
  isExternalSync: boolean;
  allowance: {
    corporateFunding: number;
    personalBalance: number;
    availableTotal: number;
    dailyLimit: number;
  };
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

const LEDGER_SOURCE_LABEL: Record<LedgerSourceType, string> = {
  COMPANY_ALLOWANCE: '회사 지원금 충전',
  PERSONAL_TOP_UP: '개인 충전',
};

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

const LEDGER_STATUS_LABEL: Record<LedgerStatus, string> = {
  POSTED: '완료',
  PENDING: '대기',
  EXPIRED: '만료',
  REVERSED: '취소',
};

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

const TX_STATUS_LABEL: Record<TransactionStatus, string> = {
  APPROVED: '승인',
  DECLINED: '거절',
  REVERSED: '취소',
  SETTLED: '정산 완료',
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '개요' },
  { key: 'ledger', label: '원장(포인트 거래 내역)' },
  { key: 'transactions', label: '거래 내역' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('ko-KR');
}

function formatVnd(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toLocaleString('ko-KR')}`;
}

export function EmployeeDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.EMPLOYEE_READ);
  const canWrite = useHasPermission(PERMISSIONS.EMPLOYEE_WRITE);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  if (!canRead) return <LockedScreen />;

  // TODO: useQuery(EMPLOYEE_DETAIL_QUERY, { variables: { employeeId: params.id } })
  const loading = false;
  const employee = null as EmployeeDetail | null;

  // TODO: wire up ledger + transaction data from query
  const ledgerEntries: LedgerEntry[] = [];
  const transactionEntries: TransactionEntry[] = [];

  const handleEdit = () => {
    // TODO: Open edit modal or navigate to edit page
  };

  const handleSuspend = () => {
    // TODO: Call employeeSuspend mutation
  };

  const handleTerminate = () => {
    // TODO: Call employeeTerminate mutation
  };

  /* ── Ledger columns ── */
  const ledgerColumns: DataTableColumn<LedgerEntry>[] = [
    {
      key: 'datetime',
      header: '일시',
      width: '160px',
      render: (r) => <span className="text-[13px] text-fg">{r.datetime}</span>,
    },
    {
      key: 'sourceType',
      header: '유형',
      width: '160px',
      render: (r) => (
        <Badge tone={LEDGER_SOURCE_TONE[r.sourceType]} size="sm">
          {LEDGER_SOURCE_LABEL[r.sourceType]}
        </Badge>
      ),
    },
    {
      key: 'amountVnd',
      header: '금액',
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
      header: '상태',
      width: '100px',
      render: (r) => (
        <Badge
          tone={LEDGER_STATUS_TONE[r.status]}
          size="sm"
        >
          <span className={r.status === 'EXPIRED' ? 'line-through' : ''}>
            {LEDGER_STATUS_LABEL[r.status]}
          </span>
        </Badge>
      ),
    },
    {
      key: 'memo',
      header: '메모',
      render: (r) => (
        <span className="text-[13px] text-fg-muted">{r.memo ?? '—'}</span>
      ),
    },
  ];

  /* ── Transaction columns ── */
  const transactionColumns: DataTableColumn<TransactionEntry>[] = [
    {
      key: 'datetime',
      header: '일시',
      width: '160px',
      render: (r) => <span className="text-[13px] text-fg">{r.datetime}</span>,
    },
    {
      key: 'merchantName',
      header: '가맹점',
      width: '160px',
      render: (r) => <span className="text-[13px] font-semibold text-fg">{r.merchantName}</span>,
    },
    {
      key: 'requestedAmountVnd',
      header: '요청금액',
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
      header: '승인금액',
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
      header: '회사/개인',
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
      header: '상태',
      width: '100px',
      render: (r) => (
        <Badge tone={TX_STATUS_TONE[r.status]} size="sm">
          {TX_STATUS_LABEL[r.status]}
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
          ? `${employee.employeeCode} · ${employee.departmentName} · ${EMPLOYMENT_TYPE_LABEL[employee.employmentType]}`
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
                  편집
                </Button>
                <Button variant="ghost" startIcon={<PauseCircle size={14} />} onClick={handleSuspend}>
                  일시정지
                </Button>
                <Button variant="danger" startIcon={<UserX size={14} />} onClick={handleTerminate}>
                  퇴사 처리
                </Button>
              </>
            )}
          </div>
        ),
      }}
      summaryItems={[
        {
          label: '지갑 상태',
          value: employee?.walletStatus ?? '—',
          tone: employee ? WALLET_STATUS_TONE[employee.walletStatus] : 'neutral',
        },
        {
          label: '사용 가능 금액',
          value: employee ? `${formatCurrency(employee.allowance.availableTotal)}P` : '—',
          tone: 'brand',
        },
      ]}
    >
      {/* External sync banner */}
      {employee?.isExternalSync && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-[var(--info)] bg-[var(--info-soft,rgba(59,130,246,0.08))] px-4 py-3 text-[13px] text-fg">
          <Info size={16} className="shrink-0 text-[var(--info)]" />
          <span>이 임직원은 HRIS(Base.vn)에서 동기화 중입니다. 일부 필드는 외부 시스템에서만 수정할 수 있습니다.</span>
        </div>
      )}

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
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <>
          {/* Profile information */}
          <SectionCard title="기본 정보">
            {loading || !employee ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={20} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">이름</span>
                  <span className="text-[14px] font-semibold text-fg">{employee.fullName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">사번</span>
                  <span className="font-mono text-[14px] text-fg">{employee.employeeCode}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">이메일</span>
                  <span className="text-[14px] text-fg">{employee.email}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">전화번호</span>
                  <span className="text-[14px] text-fg">{employee.phone || '—'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">부서</span>
                  <span className="text-[14px] text-fg">{employee.departmentName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">고용형태</span>
                  <Badge tone="neutral" size="sm">{EMPLOYMENT_TYPE_LABEL[employee.employmentType]}</Badge>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">입사일</span>
                  <span className="text-[14px] text-fg">{employee.hireDate}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">지갑 상태</span>
                  <Badge tone={WALLET_STATUS_TONE[employee.walletStatus]} size="sm" startDot>
                    {employee.walletStatus}
                  </Badge>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Allowance Ledger summary */}
          <SectionCard title="수당 원장 요약">
            {loading || !employee ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={48} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Corporate funding */}
                <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-fg-muted">회사 지원금 포인트</span>
                    <Badge tone="info" size="sm">조건부 포인트</Badge>
                  </div>
                  <span className="text-[22px] font-bold text-fg">
                    {formatCurrency(employee.allowance.corporateFunding)}
                    <span className="ml-1 text-[14px] font-normal text-fg-muted">P</span>
                  </span>
                </div>

                {/* Personal balance */}
                <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-fg-muted">개인 충전 잔액</span>
                    <Badge tone="success" size="sm">환불 가능</Badge>
                  </div>
                  <span className="text-[22px] font-bold text-fg">
                    {formatCurrency(employee.allowance.personalBalance)}
                    <span className="ml-1 text-[14px] font-normal text-fg-muted">P</span>
                  </span>
                </div>

                {/* Available total */}
                <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <span className="text-[13px] text-fg-muted">사용 가능 금액</span>
                  <span className="text-[22px] font-bold text-fg">
                    {formatCurrency(employee.allowance.availableTotal)}
                    <span className="ml-1 text-[14px] font-normal text-fg-muted">P</span>
                  </span>
                </div>

                {/* Daily limit */}
                <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <span className="text-[13px] text-fg-muted">일일 한도</span>
                  <span className="text-[22px] font-bold text-fg">
                    {formatCurrency(employee.allowance.dailyLimit)}
                    <span className="ml-1 text-[14px] font-normal text-fg-muted">P</span>
                  </span>
                </div>
              </div>
            )}
          </SectionCard>
        </>
      )}

      {activeTab === 'ledger' && (
        <SectionCard title="원장(포인트 거래 내역)" description="회사 지원금 입출금 내역" padding="none">
          {/* TODO: useQuery(EMPLOYEE_DETAIL_QUERY) and wire ledgerEntries */}
          <DataTable
            columns={ledgerColumns}
            rows={ledgerEntries}
            rowKey={(r) => r.id}
            compact
            emptyState="포인트 거래 내역이 없습니다."
          />
        </SectionCard>
      )}

      {activeTab === 'transactions' && (
        <SectionCard title="거래 내역" description="결제 및 사용 내역" padding="none">
          {/* TODO: useQuery(EMPLOYEE_TRANSACTIONS_QUERY) and wire transactionEntries */}
          <DataTable
            columns={transactionColumns}
            rows={transactionEntries}
            rowKey={(r) => r.id}
            compact
            emptyState="거래 내역이 없습니다."
          />
        </SectionCard>
      )}
    </DetailPageTemplate>
  );
}
