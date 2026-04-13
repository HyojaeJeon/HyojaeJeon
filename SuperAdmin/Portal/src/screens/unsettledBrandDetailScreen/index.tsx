'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { ArrowLeft } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Select,
  DatePicker,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';
import { formatDateTime } from '@shared/utils/format';

const BRAND_TRANSACTIONS_QUERY = gql`
  query BrandUnsettledTransactions($brandHqId: ID!, $skip: Int!, $take: Int!, $status: String, $periodStart: String, $periodEnd: String) {
    mealTransactionsByBrand(brandHqId: $brandHqId, skip: $skip, take: $take, status: $status, periodStart: $periodStart, periodEnd: $periodEnd) {
      success {
        data {
          id walletId corporateId loopType authMethod
          requestedAmountVnd approvedAmountVnd companyShareVnd employeeShareVnd
          status declineReason idempotencyKey authorizedAt createdAt
          employeeName departmentName
        }
        totalCount
      }
      error { code message }
    }
  }
`;

const BRAND_NAME_QUERY = gql`
  query BrandName($id: ID!) {
    brand(id: $id) {
      success { data { id brandName } }
      error { code message }
    }
  }
`;

interface TxRow {
  id: string;
  walletId: string;
  corporateId: string;
  loopType: string;
  authMethod: string;
  requestedAmountVnd: number;
  approvedAmountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  status: string;
  declineReason: string | null;
  createdAt: string;
  employeeName: string | null;
  departmentName: string | null;
}

const STATUS_TONE: Record<string, 'neutral' | 'warning' | 'brand' | 'danger' | 'success' | 'info'> = {
  PENDING: 'warning',
  APPROVED: 'brand',
  DECLINED: 'danger',
  REVERSED: 'neutral',
  SETTLED: 'success',
};

export function UnsettledBrandDetailScreen() {
  const { brandHqId } = useParams<{ brandHqId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const fmt = useCurrencyFormat('VND');

  // URL에서 ISO 문자열을 받거나 이번 달 기본값
  const now = new Date();
  const defaultStartISO = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const defaultEndISO = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const [periodStartISO, setPeriodStartISO] = useState(searchParams.get('from') ?? defaultStartISO);
  const [periodEndISO, setPeriodEndISO] = useState(searchParams.get('to') ?? defaultEndISO);
  const [statusFilter, setStatusFilter] = useState('APPROVED');

  const statusOptions = [
    { value: '', label: t('settlement.filter.allStatus') },
    { value: 'APPROVED', label: t('settlement.status.APPROVED') },
    { value: 'SETTLED', label: t('settlement.status.SETTLED') },
    { value: 'DECLINED', label: t('settlement.status.DECLINED') },
    { value: 'REVERSED', label: t('settlement.status.REVERSED') },
  ];

  const { data: brandData } = useQuery(BRAND_NAME_QUERY, { variables: { id: brandHqId } });
  const brandName = brandData?.brand?.success?.data?.brandName ?? brandHqId.slice(0, 8);

  const { data, loading } = useQuery(BRAND_TRANSACTIONS_QUERY, {
    variables: {
      brandHqId,
      skip: 0,
      take: 100,
      status: statusFilter || undefined,
      periodStart: periodStartISO,
      periodEnd: periodEndISO,
    },
  });
  const transactions: TxRow[] = data?.mealTransactionsByBrand?.success?.data ?? [];
  const totalCount: number = data?.mealTransactionsByBrand?.success?.totalCount ?? 0;
  const totalAmount = transactions.reduce((acc, tx) => acc + (tx.approvedAmountVnd ?? 0), 0);

  const columns: DataTableColumn<TxRow>[] = [
    { key: 'id', header: t('settlement.modal.txId'), width: '120px', render: (r) => <span className="font-mono text-[10px] text-fg-muted">{r.id.slice(-12)}</span> },
    { key: 'employee', header: t('settlement.txEnum.employee'), width: '120px', render: (r) => <span className="text-[11px]">{r.employeeName ?? '—'}</span> },
    { key: 'dept', header: t('settlement.txEnum.department'), width: '100px', render: (r) => <span className="text-[11px] text-fg-muted">{r.departmentName ?? '—'}</span> },
    { key: 'status', header: t('settlement.batches.status'), width: '80px', render: (r) => <Badge tone={STATUS_TONE[r.status] ?? 'neutral'} startDot>{t(`settlement.status.${r.status}`)}</Badge> },
    { key: 'method', header: t('settlement.modal.txMethod'), width: '80px', render: (r) => <span className="text-[11px]">{t(`settlement.txEnum.${r.authMethod}`)}</span> },
    { key: 'amount', header: t('settlement.modal.txAmount'), align: 'right', render: (r) => <span className="num font-mono text-[11px]">{fmt.decimal(r.approvedAmountVnd)}</span> },
    { key: 'company', header: t('settlement.modal.txCompanyShare'), align: 'right', render: (r) => <span className="num font-mono text-[11px] text-fg-muted">{fmt.decimal(r.companyShareVnd)}</span> },
    { key: 'employee', header: t('settlement.txEnum.employeeShare'), align: 'right', render: (r) => <span className="num font-mono text-[11px] text-fg-muted">{fmt.decimal(r.employeeShareVnd)}</span> },
    { key: 'date', header: t('settlement.modal.txDate'), width: '140px', render: (r) => <span className="text-[10px] text-fg-muted">{formatDateTime(r.createdAt, localeTag)}</span> },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.settlement'), href: '/settlements' },
          { label: brandName },
        ],
        title: `${brandName} — ${t('settlement.unsettled.title')}`,
        actions: (
          <button
            type="button"
            onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0, padding: '6px 12px', borderRadius: 6, fontSize: 13, color: 'var(--fg-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}
          >
            <ArrowLeft size={14} />
            {t('action.back')}
          </button>
        ),
      }}
    >
      {/* gap wrapper — DetailPageTemplate children 간 여백 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 필터 바 */}
        <div className="flex flex-wrap items-center gap-3">
          <DatePicker
            value={periodStartISO.slice(0, 10)}
            onChange={(v) => v && setPeriodStartISO(new Date(v).toISOString())}
            locale={locale}
            minWidth={140}
          />
          <span className="text-[11px] text-fg-muted">~</span>
          <DatePicker
            value={periodEndISO.slice(0, 10)}
            onChange={(v) => v && setPeriodEndISO(new Date(v + 'T23:59:59').toISOString())}
            locale={locale}
            minWidth={140}
          />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={statusOptions}
            minWidth={140}
          />
          <div className="ml-auto text-[12px] text-fg-muted">
            {fmt.number(totalCount)} {t('settlement.revenue.transactions')} · {fmt.currency(totalAmount)}
          </div>
        </div>

        {/* 거래 테이블 */}
        <SectionCard title={`${t('settlement.unsettled.title')} (${totalCount})`} padding="none">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={28} />)}
            </div>
          ) : (
            <DataTable columns={columns} rows={transactions} rowKey={(r) => r.id} compact emptyState={t('settlement.modal.noTransactions')} />
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
