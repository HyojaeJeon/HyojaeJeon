'use client';

import { useState } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Banknote, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Modal,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';
import { formatDateTime } from '@shared/utils/format';
import {
  SETTLEMENT_DASHBOARD_QUERY,
  UNSETTLED_TRANSACTIONS_QUERY,
  SETTLEMENT_RUN_BATCH_MUTATION,
  SETTLEMENT_APPROVE_MUTATION,
  SETTLEMENT_REQUEST_PAYOUT_MUTATION,
  SETTLEMENT_RESOLVE_EXCEPTION_MUTATION,
  SETTLEMENT_MARK_PAID_MUTATION,
  type SettlementDashboardData,
  type UnsettledTransactionsData,
  type TransactionRow,
  type UnsettledBrandRow,
  type SettlementBatchRow,
  type SettlementBatchStatus,
} from '@graphql/queries/settlement';

type PeriodPreset = 'THIS_MONTH' | 'LAST_MONTH' | 'QUARTER' | 'CUSTOM';

function getPresetRange(preset: Exclude<PeriodPreset, 'CUSTOM'>): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (preset) {
    case 'THIS_MONTH':
      return {
        periodStart: new Date(year, month, 1).toISOString(),
        periodEnd: new Date(year, month + 1, 0, 23, 59, 59).toISOString(),
      };
    case 'LAST_MONTH':
      return {
        periodStart: new Date(year, month - 1, 1).toISOString(),
        periodEnd: new Date(year, month, 0, 23, 59, 59).toISOString(),
      };
    case 'QUARTER': {
      const qStart = month - (month % 3);
      return {
        periodStart: new Date(year, qStart, 1).toISOString(),
        periodEnd: new Date(year, qStart + 3, 0, 23, 59, 59).toISOString(),
      };
    }
  }
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

const STATUS_TONE: Record<string, 'neutral' | 'warning' | 'brand' | 'danger' | 'success' | 'info'> = {
  OPEN: 'neutral',
  MATCHING: 'warning',
  MATCHED: 'brand',
  EXCEPTION: 'danger',
  APPROVED: 'success',
  PAYOUT_REQUESTED: 'info',
  PAID: 'info',
};

export function SettlementDashboardScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const fmt = useCurrencyFormat('VND');

  const router = useRouter();

  // Period filter — 프리셋 + 커스텀
  const [period, setPeriod] = useState<PeriodPreset>('THIS_MONTH');
  const defaultRange = getPresetRange('THIS_MONTH');
  const [customStart, setCustomStart] = useState(toDateInputValue(defaultRange.periodStart));
  const [customEnd, setCustomEnd] = useState(toDateInputValue(defaultRange.periodEnd));

  const range = period === 'CUSTOM'
    ? { periodStart: new Date(customStart).toISOString(), periodEnd: new Date(customEnd + 'T23:59:59').toISOString() }
    : getPresetRange(period);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 1P1Q: 단일 쿼리로 수익 요약 + 배치 리스트 + 미정산 거래 조회
  const { data: dashData, loading: dashLoading, refetch } = useQuery<SettlementDashboardData>(
    SETTLEMENT_DASHBOARD_QUERY,
    {
      variables: {
        periodStart: range.periodStart,
        periodEnd: range.periodEnd,
        batchSkip: 0,
        batchTake: 50,
        batchStatus: statusFilter || undefined,
      },
      errorPolicy: 'all',
    },
  );

  // Mutations
  const [runBatchMut, { loading: runningBatch }] = useMutation(SETTLEMENT_RUN_BATCH_MUTATION);
  const [approveMut, { loading: approving }] = useMutation(SETTLEMENT_APPROVE_MUTATION);
  const [requestPayoutMut, { loading: requestingPayout }] = useMutation(SETTLEMENT_REQUEST_PAYOUT_MUTATION);
  const [resolveExceptionMut, { loading: resolving }] = useMutation(SETTLEMENT_RESOLVE_EXCEPTION_MUTATION);
  const [markPaidMut] = useMutation(SETTLEMENT_MARK_PAID_MUTATION);

  // 정산 실행 모달 — lazy query로 거래 목록 조회
  const [runBatchTarget, setRunBatchTarget] = useState<UnsettledBrandRow | null>(null);
  const [fetchTxs, { data: txData, loading: txLoading }] = useLazyQuery<UnsettledTransactionsData>(
    UNSETTLED_TRANSACTIONS_QUERY,
  );
  const runBatchTxs = txData?.mealTransactionsByBrand?.success?.data ?? [];
  const runBatchTxCount = txData?.mealTransactionsByBrand?.success?.totalCount ?? 0;

  const openRunBatchModal = (brand: UnsettledBrandRow) => {
    setRunBatchTarget(brand);
    fetchTxs({
      variables: {
        brandHqId: brand.brandHqId,
        skip: 0,
        take: 100,
        status: 'APPROVED',
        periodStart: range.periodStart,
        periodEnd: range.periodEnd,
      },
    });
  };

  // Modal state
  const [approveTarget, setApproveTarget] = useState<SettlementBatchRow | null>(null);
  const [resolveTarget, setResolveTarget] = useState<SettlementBatchRow | null>(null);
  const [memo, setMemo] = useState('');

  const dash = dashData?.mealSettlementDashboard?.success?.data;
  const revenue = dash?.revenue;
  const batches = dash?.batches ?? [];
  const totalCount = dash?.batchTotalCount ?? 0;
  const unsettledBrands = dash?.unsettledBrands ?? [];

  // ── Handlers ──

  const handleRunBatchConfirm = async () => {
    if (!runBatchTarget) return;
    try {
      const res = await runBatchMut({
        variables: {
          input: {
            brandHqId: runBatchTarget.brandHqId,
            periodStart: range.periodStart,
            periodEnd: range.periodEnd,
          },
        },
      });
      if (res.data?.mealSettlementRunBatch?.error) {
        toast.error(res.data.mealSettlementRunBatch.error.message);
        return;
      }
      const status = res.data?.mealSettlementRunBatch?.success?.data?.status;
      toast.success(
        status === 'EXCEPTION'
          ? t('settlement.actions.runBatchException')
          : t('settlement.actions.runBatchSuccess'),
      );
      setRunBatchTarget(null);
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      const res = await approveMut({ variables: { id: approveTarget.id, memo: memo.trim() || null } });
      if (res.data?.mealSettlementApprove?.error) {
        toast.error(res.data.mealSettlementApprove.error.message);
        return;
      }
      toast.success(t('settlement.actions.approveSuccess'));
      setApproveTarget(null);
      setMemo('');
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleResolveException = async () => {
    if (!resolveTarget || !memo.trim()) return;
    try {
      const res = await resolveExceptionMut({ variables: { id: resolveTarget.id, memo: memo.trim() } });
      if (res.data?.mealSettlementResolveException?.error) {
        toast.error(res.data.mealSettlementResolveException.error.message);
        return;
      }
      toast.success(t('settlement.actions.resolveSuccess'));
      setResolveTarget(null);
      setMemo('');
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRequestPayout = async (batch: SettlementBatchRow) => {
    try {
      const res = await requestPayoutMut({ variables: { id: batch.id } });
      if (res.data?.mealSettlementRequestPayout?.error) {
        toast.error(res.data.mealSettlementRequestPayout.error.message);
        return;
      }
      toast.success(t('settlement.actions.payoutRequested'));
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleMarkPaid = async (batch: SettlementBatchRow) => {
    try {
      const res = await markPaidMut({ variables: { id: batch.id } });
      if (res.data?.mealSettlementMarkPaid?.error) {
        toast.error(res.data.mealSettlementMarkPaid.error.message);
        return;
      }
      toast.success(t('settlement.actions.markPaidSuccess'));
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // ── Table columns ──

  const columns: DataTableColumn<SettlementBatchRow>[] = [
    {
      key: 'brand',
      header: t('settlement.batches.brand'),
      width: '160px',
      render: (r) => (
        <span className="text-[12px] font-medium">{r.brandName ?? r.brandHqId.slice(0, 8)}</span>
      ),
    },
    {
      key: 'period',
      header: t('settlement.batches.period'),
      width: '200px',
      render: (r) => (
        <span className="font-mono text-[11px] text-fg-muted">
          {r.periodStart.slice(0, 10)} → {r.periodEnd.slice(0, 10)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('settlement.batches.status'),
      width: '140px',
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status] ?? 'neutral'} startDot>
          {t(`settlement.status.${r.status}`)}
        </Badge>
      ),
    },
    {
      key: 'gross',
      header: t('settlement.batches.grossAmount'),
      align: 'right',
      render: (r) => (
        <span className="num font-mono text-[12px] text-fg-muted">{fmt.decimal(r.grossAmountVnd)}</span>
      ),
    },
    {
      key: 'commission',
      header: t('settlement.batches.commission'),
      align: 'right',
      render: (r) => (
        <span className="num font-mono text-[12px] text-fg-muted">{fmt.decimal(r.commissionAmountVnd)}</span>
      ),
    },
    {
      key: 'net',
      header: t('settlement.batches.netPayable'),
      align: 'right',
      render: (r) => (
        <span className="num font-mono text-[12px] font-bold">{fmt.decimal(r.netPayableVnd)}</span>
      ),
    },
    {
      key: 'updatedAt',
      header: t('settlement.batches.updatedAt'),
      width: '140px',
      render: (r) => (
        <span className="num text-[11px] text-fg-muted">{formatDateTime(r.updatedAt, localeTag)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (r) => <RowActions batch={r} />,
    },
  ];

  function RowActions({ batch }: { batch: SettlementBatchRow }) {
    const status = batch.status as SettlementBatchStatus;
    const detailBtn = (
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => { e.stopPropagation(); router.push(`/settlements/${batch.id}`); }}
      >
        {t('action.detail')}
      </Button>
    );

    let actionBtn: React.ReactNode = null;
    if (status === 'MATCHED') {
      actionBtn = (
        <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); setApproveTarget(batch); setMemo(''); }}>
          {t('settlement.actions.approve')}
        </Button>
      );
    } else if (status === 'EXCEPTION') {
      actionBtn = (
        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setResolveTarget(batch); setMemo(''); }}>
          {t('settlement.actions.resolve')}
        </Button>
      );
    } else if (status === 'APPROVED') {
      actionBtn = (
        <Button variant="outline" size="sm" loading={requestingPayout} onClick={(e) => { e.stopPropagation(); handleRequestPayout(batch); }}>
          {t('settlement.actions.requestPayout')}
        </Button>
      );
    } else if (status === 'PAYOUT_REQUESTED') {
      actionBtn = (
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleMarkPaid(batch); }}>
          {t('settlement.actions.markPaid')}
        </Button>
      );
    }

    return <div className="flex gap-1">{detailBtn}{actionBtn}</div>;
  }

  // ── KPI cards ──

  const kpiCards = [
    {
      label: t('settlement.revenue.totalTransaction'),
      value: revenue ? fmt.currency(revenue.totalTransactionVnd) : '—',
      sub: revenue ? `${fmt.number(revenue.totalTransactionCount)} ${t('settlement.revenue.transactions')}` : '',
      icon: <Banknote size={18} className="text-primary" />,
    },
    {
      label: t('settlement.revenue.totalCommission'),
      value: revenue ? fmt.currency(revenue.totalCommissionVnd) : '—',
      sub: revenue && revenue.estimatedCommissionVnd > 0
        ? `${t('settlement.revenue.settled')}: ${fmt.currency(revenue.settledCommissionVnd)} + ${t('settlement.revenue.estimated')}: ${fmt.currency(revenue.estimatedCommissionVnd)}`
        : undefined,
      icon: <TrendingUp size={18} className="text-success" />,
    },
    {
      label: t('settlement.revenue.pendingSettlement'),
      value: revenue ? fmt.currency(revenue.pendingSettlementVnd + revenue.unsettledTransactionVnd) : '—',
      sub: revenue
        ? [
            revenue.pendingBatchCount > 0 ? `${revenue.pendingBatchCount} ${t('settlement.revenue.batches')}` : null,
            revenue.unsettledTransactionCount > 0 ? `${fmt.number(revenue.unsettledTransactionCount)} ${t('settlement.revenue.unsettledTx')}` : null,
          ].filter(Boolean).join(' + ') || `0 ${t('settlement.revenue.batches')}`
        : '',
      icon: <Clock size={18} className="text-warning" />,
    },
    {
      label: t('settlement.revenue.overdueCredit'),
      value: revenue ? fmt.currency(revenue.overdueCreditVnd) : '—',
      icon: <AlertTriangle size={18} className="text-danger" />,
    },
  ];

  // ── Period filter buttons ──

  const periodPresets: { key: PeriodPreset; label: string }[] = [
    { key: 'THIS_MONTH', label: t('settlement.period.thisMonth') },
    { key: 'LAST_MONTH', label: t('settlement.period.lastMonth') },
    { key: 'QUARTER', label: t('settlement.period.quarter') },
    { key: 'CUSTOM', label: t('settlement.period.custom') },
  ];

  // ── Status filter options ──

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: t('settlement.filter.allStatus') },
    { value: 'OPEN', label: t('settlement.status.OPEN') },
    { value: 'MATCHING', label: t('settlement.status.MATCHING') },
    { value: 'MATCHED', label: t('settlement.status.MATCHED') },
    { value: 'EXCEPTION', label: t('settlement.status.EXCEPTION') },
    { value: 'APPROVED', label: t('settlement.status.APPROVED') },
    { value: 'PAYOUT_REQUESTED', label: t('settlement.status.PAYOUT_REQUESTED') },
    { value: 'PAID', label: t('settlement.status.PAID') },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.settlement') }],
        title: t('settlement.title'),
        description: t('settlement.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SETTLE-001</code>,
      }}
    >
      {/* ── Revenue KPI ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="flex items-start gap-3 rounded-lg border bg-surface-1 p-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2">
              {card.icon}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-fg-muted">{card.label}</span>
              {dashLoading ? (
                <Skeleton height={20} width={100} />
              ) : (
                <>
                  <span className="text-[16px] font-bold text-fg">{card.value}</span>
                  {card.sub && <span className="text-[11px] text-fg-subtle">{card.sub}</span>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Period filter ── */}
      <div className="flex items-center gap-2">
        {periodPresets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
              period === p.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
            }`}
            style={{ borderColor: period === p.key ? undefined : 'var(--border)' }}
          >
            {p.label}
          </button>
        ))}

        {period === 'CUSTOM' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-md border bg-surface-1 px-2 py-1 text-[12px] text-fg"
              style={{ borderColor: 'var(--border)' }}
            />
            <span className="text-[11px] text-fg-muted">~</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-md border bg-surface-1 px-2 py-1 text-[12px] text-fg"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
        )}

        <div className="ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border bg-surface-1 px-2.5 py-1.5 text-[12px] text-fg"
            style={{ borderColor: 'var(--border)' }}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Batches table ── */}
      <SectionCard
        title={t('settlement.batches.title')}
        description={`${totalCount} ${t('settlement.batches.count')}`}
        padding="none"
      >
        {dashLoading && batches.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={32} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={batches}
            rowKey={(r) => r.id}
            compact
            emptyState={t('settlement.batches.empty')}
          />
        )}
      </SectionCard>

      {/* ── Unsettled transactions by brand ── */}
      {unsettledBrands.length > 0 && (
        <SectionCard
          title={t('settlement.unsettled.title')}
          description={`${unsettledBrands.reduce((acc, b) => acc + b.count, 0)} ${t('settlement.unsettled.description')}`}
          padding="none"
        >
          <DataTable<UnsettledBrandRow>
            columns={[
              {
                key: 'brand',
                header: t('settlement.batches.brand'),
                width: '200px',
                render: (r) => <span className="text-[12px] font-medium">{r.brandName ?? r.brandHqId.slice(0, 8)}</span>,
              },
              {
                key: 'count',
                header: t('settlement.unsettled.txCount'),
                width: '100px',
                align: 'right',
                render: (r) => <span className="font-mono text-[12px]">{fmt.number(r.count)}</span>,
              },
              {
                key: 'total',
                header: t('settlement.unsettled.amount'),
                align: 'right',
                render: (r) => <span className="num font-mono text-[12px] font-bold">{fmt.decimal(r.totalVnd)}</span>,
              },
              {
                key: 'oldest',
                header: t('settlement.unsettled.oldest'),
                width: '140px',
                render: (r) => (
                  <span className="text-[11px] text-fg-muted">
                    {r.oldestTransactionDate ? r.oldestTransactionDate.slice(0, 10) : '—'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                width: '120px',
                render: (r) => (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); router.push(`/settlements/unsettled/${r.brandHqId}?from=${encodeURIComponent(range.periodStart)}&to=${encodeURIComponent(range.periodEnd)}`); }}
                    >
                      {t('action.detail')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openRunBatchModal(r); }}
                    >
                      {t('settlement.actions.runBatch')}
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={unsettledBrands}
            rowKey={(r) => r.brandHqId}
            compact
          />
        </SectionCard>
      )}

      {/* ── Approve modal ── */}
      <Modal
        open={!!approveTarget}
        onClose={() => { setApproveTarget(null); setMemo(''); }}
        title={t('settlement.modal.approveTitle')}
        width={480}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setApproveTarget(null); setMemo(''); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" loading={approving} onClick={handleApprove}>
              {t('settlement.actions.approve')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-fg-muted">{t('settlement.modal.approveDescription')}</p>
          {approveTarget && (
            <div className="rounded-md bg-surface-2 p-3 text-[12px]">
              <div><span className="font-medium">{t('settlement.batches.brand')}:</span> {approveTarget.brandName ?? approveTarget.brandHqId}</div>
              <div><span className="font-medium">{t('settlement.batches.netPayable')}:</span> {fmt.currency(approveTarget.netPayableVnd)}</div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('settlement.modal.memo')}</span>
            <textarea
              className="w-full rounded-md border bg-surface-1 p-2 font-mono text-[12px] text-fg"
              style={{ borderColor: 'var(--border)', minHeight: 80 }}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t('settlement.modal.memoPlaceholder')}
            />
          </div>
        </div>
      </Modal>

      {/* ── Resolve exception modal ── */}
      <Modal
        open={!!resolveTarget}
        onClose={() => { setResolveTarget(null); setMemo(''); }}
        title={t('settlement.modal.resolveTitle')}
        width={480}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setResolveTarget(null); setMemo(''); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" size="sm" loading={resolving} disabled={!memo.trim()} onClick={handleResolveException}>
              {t('settlement.actions.resolve')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-fg-muted">{t('settlement.modal.resolveDescription')}</p>
          {resolveTarget && (
            <div className="rounded-md bg-surface-2 p-3 text-[12px]">
              <div><span className="font-medium">{t('settlement.batches.brand')}:</span> {resolveTarget.brandName ?? resolveTarget.brandHqId}</div>
              <div><span className="font-medium">{t('settlement.batches.status')}:</span> {t(`settlement.status.${resolveTarget.status}`)}</div>
              <div><span className="font-medium">{t('settlement.batches.netPayable')}:</span> {fmt.currency(resolveTarget.netPayableVnd)}</div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('settlement.modal.memo')} *</span>
            <textarea
              className="w-full rounded-md border bg-surface-1 p-2 font-mono text-[12px] text-fg"
              style={{ borderColor: 'var(--border)', minHeight: 80 }}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t('settlement.modal.resolveMemePlaceholder')}
            />
          </div>
        </div>
      </Modal>

      {/* ── Run settlement batch modal ── */}
      <Modal
        open={!!runBatchTarget}
        onClose={() => setRunBatchTarget(null)}
        title={t('settlement.modal.runBatchTitle')}
        width={720}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRunBatchTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" loading={runningBatch} onClick={handleRunBatchConfirm}>
              {t('settlement.actions.runBatch')}
            </Button>
          </>
        }
      >
        {runBatchTarget && (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] text-fg-muted">{t('settlement.modal.runBatchDescription')}</p>

            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-2 rounded-md bg-surface-2 p-3 text-[12px]">
              <div>
                <span className="text-fg-muted">{t('settlement.batches.brand')}</span>
                <div className="font-medium">{runBatchTarget.brandName ?? runBatchTarget.brandHqId.slice(0, 8)}</div>
              </div>
              <div>
                <span className="text-fg-muted">{t('settlement.unsettled.txCount')}</span>
                <div className="font-medium">{fmt.number(runBatchTxCount)} {t('settlement.revenue.transactions')}</div>
              </div>
              <div>
                <span className="text-fg-muted">{t('settlement.unsettled.amount')}</span>
                <div className="font-bold">{fmt.currency(runBatchTarget.totalVnd)}</div>
              </div>
            </div>

            {/* 거래 목록 테이블 */}
            <div className="max-h-[320px] overflow-y-auto rounded-md border" style={{ borderColor: 'var(--border)' }}>
              {txLoading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} />)}
                </div>
              ) : (
                <DataTable<TransactionRow>
                  columns={[
                    {
                      key: 'id',
                      header: t('settlement.modal.txId'),
                      width: '100px',
                      render: (r) => <span className="font-mono text-[10px] text-fg-muted">{r.id.slice(0, 8)}</span>,
                    },
                    {
                      key: 'method',
                      header: t('settlement.modal.txMethod'),
                      width: '80px',
                      render: (r) => <span className="text-[11px]">{r.authMethod.replace('_', ' ')}</span>,
                    },
                    {
                      key: 'amount',
                      header: t('settlement.modal.txAmount'),
                      align: 'right',
                      render: (r) => <span className="num font-mono text-[11px]">{fmt.decimal(r.approvedAmountVnd)}</span>,
                    },
                    {
                      key: 'company',
                      header: t('settlement.modal.txCompanyShare'),
                      align: 'right',
                      render: (r) => <span className="num font-mono text-[11px] text-fg-muted">{fmt.decimal(r.companyShareVnd)}</span>,
                    },
                    {
                      key: 'date',
                      header: t('settlement.modal.txDate'),
                      width: '130px',
                      render: (r) => <span className="text-[10px] text-fg-muted">{formatDateTime(r.createdAt, localeTag)}</span>,
                    },
                  ]}
                  rows={runBatchTxs}
                  rowKey={(r) => r.id}
                  compact
                  emptyState={t('settlement.modal.noTransactions')}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </ListPageTemplate>
  );
}
