'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  Select,
  Pagination,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';
import {
  INVOICES_QUERY,
  type InvoicesData,
  type InvoiceRow,
} from '@graphql/queries/invoice';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

type InvoiceStatus =
  | 'DRAFT'
  | 'DISPUTED'
  | 'REQUESTED'
  | 'SUBMITTING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'VOIDED';

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
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.INVOICE_READ);

  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | null>(null);

  const [skip, setSkip] = useState(0);
  const [take] = useState(20);

  const corporateId = useCorporateId();
  const { data, loading, refetch } = useQuery<InvoicesData>(INVOICES_QUERY, {
    variables: { corporateId, skip, take },
    skip: !corporateId,
  });
  const invoices: InvoiceRow[] = data?.eInvoicesByCorporate?.success?.data ?? [];

  if (hydrated && !canRead) return <LockedScreen />;

  const filteredInvoices = filterStatus
    ? invoices.filter((inv) => inv.status === filterStatus)
    : invoices;

  const draftCount = invoices.filter((inv) => inv.status === 'DRAFT').length;
  const rejectedCount = invoices.filter((inv) => inv.status === 'REJECTED').length;

  const cols: DataTableColumn<InvoiceRow>[] = [
    {
      key: 'period',
      header: t('invoice.period'),
      width: '200px',
      render: (r) => (
        <span className="text-[12px] text-fg-muted">
          {formatPeriod(r.periodStart, r.periodEnd)}
        </span>
      ),
    },
    {
      key: 'invoiceNo',
      header: t('invoice.referenceNo'),
      width: '160px',
      render: (r) => <span className="font-mono text-[12px]">{r.invoiceNo ?? '—'}</span>,
    },
    {
      key: 'totalAmount',
      header: t('invoice.totalAmount'),
      width: '140px',
      render: (r) => (
        <span className="num font-semibold">{formatCurrency(r.totPayableVnd)}</span>
      ),
    },
    {
      key: 'vat',
      header: 'VAT',
      width: '120px',
      render: (r) => (
        <span className="num text-fg-muted">{formatCurrency(r.totVatAmountVnd)}</span>
      ),
    },
    {
      key: 'sourceTransactionCount',
      header: t('invoice.lineCount'),
      width: '80px',
      render: (r) => <span className="num">{r.sourceTransactionCount ?? '—'}</span>,
    },
    {
      key: 'status',
      header: t('invoice.status'),
      width: '130px',
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status as InvoiceStatus] ?? 'neutral'} size="sm" startDot>
          {t(`invoiceStatus.${r.status}`)}
        </Badge>
      ),
    },
    {
      key: 'reviewDueAt',
      header: t('invoice.reviewDeadline'),
      width: '100px',
      render: (r) => {
        if (r.status !== 'DRAFT') return <span className="text-fg-subtle">—</span>;
        const dday = computeDDay(r.reviewDueAt);
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
      key: 'gdtReceiptNo',
      header: t('invoice.gdtReceipt'),
      width: '160px',
      render: (r) => (
        <span className="font-mono text-[12px] text-fg-muted">
          {r.gdtReceiptNo ?? '—'}
        </span>
      ),
    },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.invoices') }],
        title: t('nav.invoices'),
        description: t('invoice.description'),
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
              {t('common.refresh')}
            </Button>
          </div>
        ),
      }}
      summaryItems={[
        { label: t('common.all'), value: invoices.length, tone: 'brand' },
        { label: t('invoiceStatus.DRAFT'), value: draftCount, tone: 'neutral' },
        { label: t('invoiceStatus.REJECTED'), value: rejectedCount, tone: 'danger' },
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
      <SectionCard title={t('common.filter')} padding="sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold text-fg-muted">{t('invoice.yearLabel')}</label>
            <Select
              value={filterYear}
              onChange={(val) => setFilterYear(Number(val))}
              options={generateYearOptions().map((y) => ({ value: y, label: `${y}년` }))}
              minWidth={100}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold text-fg-muted">{t('invoice.monthLabel')}</label>
            <Select
              value={filterMonth}
              onChange={(val) => setFilterMonth(Number(val))}
              options={MONTH_OPTIONS.map((m) => ({ value: m, label: `${m}월` }))}
              minWidth={80}
            />
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
              {t('common.all')}
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
                {t(`invoiceStatus.${st}`)}
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
            <>
              <DataTable
                columns={cols}
                rows={filteredInvoices}
                rowKey={(r) => r.id}
                compact
                emptyState={t('invoice.emptyState')}
                onRowClick={(r) => router.push(`/invoices/${r.id}`)}
              />
              <div className="p-4">
                <Pagination
                  skip={skip}
                  take={take}
                  total={invoices.length < take ? skip + invoices.length : skip + take + 1}
                  onPageChange={(newSkip) => setSkip(newSkip)}
                />
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
