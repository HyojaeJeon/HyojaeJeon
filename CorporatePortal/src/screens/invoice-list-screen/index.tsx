'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertTriangle, FileText } from 'lucide-react';
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
import { formatCurrency } from '@shared/utils/format';

type InvoiceStatus =
  | 'DRAFT'
  | 'DISPUTED'
  | 'REQUESTED'
  | 'SUBMITTING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'VOIDED';

interface InvoiceRow {
  id: string;
  refId: string;
  periodStart: string;
  periodEnd: string;
  totalAmountVnd: number;
  vatAmountVnd: number;
  lineItemCount: number;
  status: InvoiceStatus;
  reviewDeadline: string | null;
  gdtAcceptanceNumber: string | null;
}

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: '검토 대기',
  DISPUTED: '이의 제기 중',
  REQUESTED: '발행 요청됨',
  SUBMITTING: '제출 중',
  ACCEPTED: '발급 완료',
  REJECTED: '거부됨',
  VOIDED: '무효',
};

const STATUS_TONE: Record<InvoiceStatus, 'neutral' | 'warning' | 'brand' | 'success' | 'danger'> = {
  DRAFT: 'neutral',
  DISPUTED: 'warning',
  REQUESTED: 'brand',
  SUBMITTING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  VOIDED: 'neutral',
};

const ALL_STATUSES: InvoiceStatus[] = [
  'DRAFT',
  'DISPUTED',
  'REQUESTED',
  'SUBMITTING',
  'ACCEPTED',
  'REJECTED',
  'VOIDED',
];

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(s)} ~ ${fmt(e)}`;
}

function computeDDay(deadline: string | null): string | null {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
  if (diffDays === 0) return 'D-Day';
  return `D-${diffDays}`;
}

function generateYearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - i);
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function InvoiceListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.INVOICE_READ);

  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | null>(null);

  // TODO: useQuery(INVOICE_LIST_QUERY, { variables: { corporateId, year, month } })
  const invoices: InvoiceRow[] = [];
  const loading = false;

  if (!canRead) return <LockedScreen />;

  const filteredInvoices = filterStatus
    ? invoices.filter((inv) => inv.status === filterStatus)
    : invoices;

  const draftCount = invoices.filter((inv) => inv.status === 'DRAFT').length;
  const rejectedCount = invoices.filter((inv) => inv.status === 'REJECTED').length;

  const cols: DataTableColumn<InvoiceRow>[] = [
    {
      key: 'period',
      header: '기간',
      width: '200px',
      render: (r) => (
        <span className="text-[12px] text-fg-muted">
          {formatPeriod(r.periodStart, r.periodEnd)}
        </span>
      ),
    },
    {
      key: 'refId',
      header: '참조번호',
      width: '160px',
      render: (r) => <span className="font-mono text-[12px]">{r.refId}</span>,
    },
    {
      key: 'totalAmount',
      header: '총금액',
      width: '140px',
      render: (r) => (
        <span className="num font-semibold">{formatCurrency(r.totalAmountVnd)}</span>
      ),
    },
    {
      key: 'vat',
      header: 'VAT',
      width: '120px',
      render: (r) => (
        <span className="num text-fg-muted">{formatCurrency(r.vatAmountVnd)}</span>
      ),
    },
    {
      key: 'lineItemCount',
      header: '라인수',
      width: '80px',
      render: (r) => <span className="num">{r.lineItemCount}</span>,
    },
    {
      key: 'status',
      header: '상태',
      width: '130px',
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]} size="sm" startDot>
          {STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
    {
      key: 'reviewDeadline',
      header: '검토마감',
      width: '100px',
      render: (r) => {
        if (r.status !== 'DRAFT') return <span className="text-fg-subtle">—</span>;
        const dday = computeDDay(r.reviewDeadline);
        if (!dday) return <span className="text-fg-subtle">—</span>;
        const isUrgent = dday.startsWith('D+') || dday === 'D-Day' || (dday.startsWith('D-') && parseInt(dday.slice(2)) <= 3);
        return (
          <span className={`text-[12px] font-bold ${isUrgent ? 'text-danger' : 'text-fg-muted'}`}>
            {dday}
          </span>
        );
      },
    },
    {
      key: 'gdtAcceptanceNumber',
      header: 'GDT접수번호',
      width: '160px',
      render: (r) => (
        <span className="font-mono text-[12px] text-fg-muted">
          {r.gdtAcceptanceNumber ?? '—'}
        </span>
      ),
    },
  ];

  const handleRefresh = () => {
    // TODO: refetch query
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.invoices') }],
        title: t('nav.invoices'),
        description: '전자세금계산서 목록을 조회합니다.',
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={handleRefresh}>
              새로고침
            </Button>
          </div>
        ),
      }}
      summaryItems={[
        { label: '전체', value: invoices.length, tone: 'brand' },
        { label: '검토 대기', value: draftCount, tone: 'neutral' },
        { label: '거부됨', value: rejectedCount, tone: 'danger' },
      ]}
    >
      {/* Alert banners */}
      {draftCount > 0 && (
        <div
          className="mb-3 flex items-center gap-3 rounded-xl border-2 px-5 py-4"
          style={{ borderColor: 'var(--brand)', background: 'var(--brand-soft)' }}
        >
          <FileText size={20} style={{ color: 'var(--brand)' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-fg">
              인보이스가 검토 대기 중입니다 ({draftCount}건)
            </p>
            <p className="mt-0.5 text-[12px] text-fg-muted">
              마감일 전에 검토를 완료하고 발행 요청하세요.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setFilterStatus('DRAFT')}>
            검토 대기 보기
          </Button>
        </div>
      )}
      {rejectedCount > 0 && (
        <div
          className="mb-3 flex items-center gap-3 rounded-xl border-2 px-5 py-4"
          style={{ borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}
        >
          <AlertTriangle size={20} className="text-danger" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger">
              GDT에서 거부된 인보이스가 있습니다 ({rejectedCount}건)
            </p>
            <p className="mt-0.5 text-[12px] text-fg-muted">
              SuperAdmin에게 문의하여 수정 후 재발행하세요.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setFilterStatus('REJECTED')}>
            거부 건 보기
          </Button>
        </div>
      )}

      {/* Filters */}
      <SectionCard title="필터" padding="sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold text-fg-muted">연도</label>
            <select
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[13px] text-fg outline-none"
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
            >
              {generateYearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold text-fg-muted">월</label>
            <select
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[13px] text-fg outline-none"
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </div>
          <div className="ml-4 flex flex-wrap gap-1.5">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                filterStatus === null
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--surface-2)] text-fg-muted hover:bg-[var(--surface-3)]'
              }`}
              onClick={() => setFilterStatus(null)}
            >
              전체
            </button>
            {ALL_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                  filterStatus === st
                    ? 'bg-[var(--brand)] text-white'
                    : 'bg-[var(--surface-2)] text-fg-muted hover:bg-[var(--surface-3)]'
                }`}
                onClick={() => setFilterStatus(st)}
              >
                {STATUS_LABEL[st]}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Invoice table */}
      <div className="mt-3">
        <SectionCard
          title={`${filterYear}년 ${filterMonth}월 인보이스`}
          description={`${filteredInvoices.length}건`}
          padding="none"
        >
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={30} />
              ))}
            </div>
          ) : (
            <DataTable
              columns={cols}
              rows={filteredInvoices}
              rowKey={(r) => r.id}
              compact
              emptyState="해당 기간의 인보이스가 없습니다."
              onRowClick={(r) => router.push(`/invoices/${r.id}`)}
            />
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
