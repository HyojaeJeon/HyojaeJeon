'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { RefreshCw, Download } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Input,
  Skeleton,
  Pagination,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency, formatDateTime } from '@shared/utils/format';
import { downloadCsv } from '@shared/utils/csvExport';
import {
  TRANSACTIONS_FILTERED_QUERY,
  type TransactionsFilteredData,
  type TransactionRow,
} from '@graphql/queries/budget';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

type TransactionStatus = 'APPROVED' | 'DECLINED' | 'REVERSED' | 'SETTLED';

const ALL_STATUSES: TransactionStatus[] = [
  'APPROVED',
  'DECLINED',
  'REVERSED',
  'SETTLED',
];

const STATUS_TONE: Record<TransactionStatus, 'success' | 'danger' | 'warning' | 'neutral'> = {
  APPROVED: 'success',
  DECLINED: 'danger',
  REVERSED: 'warning',
  SETTLED: 'neutral',
};

function getDefaultDateRange(): { from: string; to: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = firstDay.toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  return { from, to };
}

export function TransactionListScreen() {
  const { t } = useI18n();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.TRANSACTION_READ);

  const corporateId = useCorporateId();
  const [skip, setSkip] = useState(0);
  const [take] = useState(20);

  // Filter states
  const defaultRange = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [merchantSearch, setMerchantSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<TransactionStatus[]>([]);

  const { data, loading, refetch } = useQuery<TransactionsFilteredData>(
    TRANSACTIONS_FILTERED_QUERY,
    {
      variables: {
        corporateId,
        skip,
        take,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        merchantId: merchantSearch || undefined,
        employeeId: employeeSearch || undefined,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      },
      skip: !corporateId,
    },
  );

  const transactions: TransactionRow[] =
    data?.mealTransactionsByCorporate?.success?.data ?? [];
  const totalCount =
    data?.mealTransactionsByCorporate?.success?.totalCount ?? 0;

  if (hydrated && !canRead) return <LockedScreen />;

  const toggleStatus = (status: TransactionStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
    setSkip(0);
  };

  const handleCsvExport = () => {
    if (transactions.length === 0) return;
    const headers: Record<string, string> = {
      createdAt: t('transaction.datetime'),
      brandHqId: t('transaction.merchant'),
      walletId: t('transaction.employee'),
      requestedAmountVnd: t('transaction.requestedAmount'),
      approvedAmountVnd: t('transaction.approvedAmount'),
      companyShareVnd: t('transaction.companyShare'),
      employeeShareVnd: t('transaction.employeeShare'),
      status: t('transaction.status'),
    };
    const rows = transactions.map((tx) => ({
      createdAt: tx.authorizedAt
        ? formatDateTime(tx.authorizedAt)
        : formatDateTime(tx.createdAt),
      brandHqId: tx.brandHqId ?? '',
      walletId: tx.walletId,
      requestedAmountVnd: tx.requestedAmountVnd,
      approvedAmountVnd: tx.approvedAmountVnd,
      companyShareVnd: tx.companyShareVnd,
      employeeShareVnd: tx.employeeShareVnd,
      status: t(`transaction.statusLabel.${tx.status}`),
    }));
    const now = new Date().toISOString().slice(0, 10);
    downloadCsv(rows, `transactions_${now}.csv`, headers);
  };

  const handleResetFilters = () => {
    const range = getDefaultDateRange();
    setDateFrom(range.from);
    setDateTo(range.to);
    setMerchantSearch('');
    setEmployeeSearch('');
    setSelectedStatuses([]);
    setSkip(0);
  };

  const summaryItems = [
    { label: t('common.total'), value: totalCount, tone: 'brand' as const },
    {
      label: t('transaction.statusLabel.APPROVED'),
      value: transactions.filter((tx) => tx.status === 'APPROVED').length,
      tone: 'success' as const,
    },
    {
      label: t('transaction.statusLabel.DECLINED'),
      value: transactions.filter((tx) => tx.status === 'DECLINED').length,
      tone: 'danger' as const,
    },
  ];

  const cols: DataTableColumn<TransactionRow>[] = [
    {
      key: 'datetime',
      header: t('transaction.datetime'),
      width: '160px',
      render: (r) => (
        <span className="text-[12px] text-fg-muted">
          {formatDateTime(r.authorizedAt ?? r.createdAt)}
        </span>
      ),
    },
    {
      key: 'merchant',
      header: t('transaction.merchant'),
      width: '160px',
      render: (r) => (
        <span className="text-[13px] font-semibold text-fg">
          {r.brandHqId?.slice(0, 8) ?? '—'}
        </span>
      ),
    },
    {
      key: 'employee',
      header: t('transaction.employee'),
      width: '140px',
      render: (r) => (
        <span className="font-mono text-[12px] text-fg-muted">
          {r.walletId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'requestedAmountVnd',
      header: t('transaction.requestedAmount'),
      width: '140px',
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
      width: '140px',
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
      render: (r) => (
        <span className="text-[12px] text-fg-muted">
          {formatCurrency(r.companyShareVnd)} / {formatCurrency(r.employeeShareVnd)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('transaction.status'),
      width: '120px',
      render: (r) => (
        <Badge
          tone={STATUS_TONE[r.status as TransactionStatus] ?? 'neutral'}
          size="sm"
          startDot
        >
          {t(`transaction.statusLabel.${r.status}`)}
        </Badge>
      ),
    },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.transactions') }],
        title: t('nav.transactions'),
        description: t('transaction.description'),
        actions: (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              startIcon={<Download size={14} />}
              onClick={handleCsvExport}
              disabled={transactions.length === 0}
            >
              {t('action.csvExport')}
            </Button>
            <Button
              variant="ghost"
              startIcon={<RefreshCw size={14} />}
              onClick={() => refetch()}
            >
              {t('common.refresh')}
            </Button>
          </div>
        ),
      }}
      summaryItems={summaryItems}
    >
      {/* Filter bar */}
      <SectionCard title={t('common.filter')} padding="sm">
        <div className="flex flex-wrap items-end gap-3">
          {/* Period */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-fg-muted">
              {t('transaction.periodFrom')}
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setSkip(0);
              }}
              style={{ width: 150 }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-fg-muted">
              {t('transaction.periodTo')}
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setSkip(0);
              }}
              style={{ width: 150 }}
            />
          </div>

          {/* Merchant search */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-fg-muted">
              {t('transaction.merchant')}
            </label>
            <Input
              type="text"
              value={merchantSearch}
              onChange={(e) => {
                setMerchantSearch(e.target.value);
                setSkip(0);
              }}
              placeholder={t('transaction.merchantPlaceholder')}
              style={{ width: 160 }}
            />
          </div>

          {/* Employee search */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-fg-muted">
              {t('transaction.employee')}
            </label>
            <Input
              type="text"
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value);
                setSkip(0);
              }}
              placeholder={t('transaction.employeePlaceholder')}
              style={{ width: 160 }}
            />
          </div>

          {/* Reset */}
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            {t('transaction.resetFilters')}
          </Button>
        </div>

        {/* Status multi-select chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
              selectedStatuses.length === 0
                ? 'bg-[var(--brand)] text-white'
                : 'bg-[var(--surface-2)] text-fg-muted hover:bg-[var(--surface-3)]'
            }`}
            onClick={() => {
              setSelectedStatuses([]);
              setSkip(0);
            }}
          >
            {t('common.all')}
          </button>
          {ALL_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                selectedStatuses.includes(st)
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--surface-2)] text-fg-muted hover:bg-[var(--surface-3)]'
              }`}
              onClick={() => toggleStatus(st)}
            >
              {t(`transaction.statusLabel.${st}`)}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Transaction table */}
      <div className="mt-3">
        <SectionCard
          title={t('transaction.listTitle')}
          description={`${totalCount}${t('common.count')}`}
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
                rows={transactions}
                rowKey={(r) => r.id}
                compact
                emptyState={t('transaction.emptyState')}
              />
              <div className="p-4">
                <Pagination
                  skip={skip}
                  take={take}
                  total={totalCount}
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
