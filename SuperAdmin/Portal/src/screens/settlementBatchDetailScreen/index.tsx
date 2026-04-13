'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { ArrowLeft } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';
import { formatDateTime } from '@shared/utils/format';

const BATCH_DETAIL_QUERY = gql`
  query SettlementBatchDetail($id: ID!) {
    mealSettlementBatch(id: $id) {
      success {
        data {
          id brandHqId brandName periodStart periodEnd status
          grossAmountVnd commissionAmountVnd netPayableVnd threeWayMismatchCount
          approvedBy approvedAt approvalMemo
          payoutReference payoutStatus payoutRequestedAt payoutCompletedAt
          createdAt updatedAt
        }
      }
      error { code message }
    }
  }
`;

const BATCH_TRANSACTIONS_QUERY = gql`
  query BatchTransactions($brandHqId: ID!, $skip: Int!, $take: Int!, $status: String, $periodStart: String, $periodEnd: String) {
    mealTransactionsByBrand(brandHqId: $brandHqId, skip: $skip, take: $take, status: $status, periodStart: $periodStart, periodEnd: $periodEnd) {
      success {
        data {
          id walletId corporateId loopType authMethod
          requestedAmountVnd approvedAmountVnd companyShareVnd employeeShareVnd
          status declineReason authorizedAt settledAt createdAt
        }
        totalCount
      }
      error { code message }
    }
  }
`;

interface TxRow {
  id: string;
  authMethod: string;
  loopType: string;
  approvedAmountVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  status: string;
  createdAt: string;
}

const STATUS_TONE: Record<string, 'neutral' | 'warning' | 'brand' | 'danger' | 'success' | 'info'> = {
  MATCHED: 'brand',
  EXCEPTION: 'danger',
  APPROVED: 'success',
  PAYOUT_REQUESTED: 'info',
  PAID: 'info',
};

export function SettlementBatchDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const fmt = useCurrencyFormat('VND');

  const { data, loading } = useQuery(BATCH_DETAIL_QUERY, { variables: { id } });
  const batch = data?.mealSettlementBatch?.success?.data;

  const { data: txData, loading: txLoading } = useQuery(BATCH_TRANSACTIONS_QUERY, {
    variables: {
      brandHqId: batch?.brandHqId ?? '',
      skip: 0,
      take: 100,
      status: 'SETTLED',
      periodStart: batch?.periodStart,
      periodEnd: batch?.periodEnd,
    },
    skip: !batch,
  });
  const transactions: TxRow[] = txData?.mealTransactionsByBrand?.success?.data ?? [];
  const txCount: number = txData?.mealTransactionsByBrand?.success?.totalCount ?? 0;

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton height={32} width={300} />
        <Skeleton height={200} />
      </div>
    );
  }

  if (!batch) {
    return <div className="p-6 text-fg-muted">{t('settlement.batches.empty')}</div>;
  }

  const infoItems = [
    { label: t('settlement.batches.status'), value: <Badge tone={STATUS_TONE[batch.status] ?? 'neutral'} startDot>{t(`settlement.status.${batch.status}`)}</Badge> },
    { label: t('settlement.batches.period'), value: `${batch.periodStart.slice(0, 10)} → ${batch.periodEnd.slice(0, 10)}` },
    { label: t('settlement.batches.grossAmount'), value: fmt.currency(batch.grossAmountVnd), bold: true },
    { label: t('settlement.batches.commission'), value: fmt.currency(batch.commissionAmountVnd) },
    { label: t('settlement.batches.netPayable'), value: fmt.currency(batch.netPayableVnd), bold: true },
    { label: '3-Way Mismatch', value: String(batch.threeWayMismatchCount) },
  ];
  if (batch.approvedBy) {
    infoItems.push({ label: t('settlement.actions.approve'), value: `${batch.approvedBy.slice(0, 8)} / ${batch.approvedAt ? formatDateTime(batch.approvedAt, localeTag) : '—'}` });
  }
  if (batch.approvalMemo) {
    infoItems.push({ label: t('settlement.modal.memo'), value: batch.approvalMemo });
  }
  if (batch.payoutStatus) {
    infoItems.push({ label: 'Payout', value: `${batch.payoutStatus}${batch.payoutRequestedAt ? ` (${formatDateTime(batch.payoutRequestedAt, localeTag)})` : ''}` });
  }

  const txColumns: DataTableColumn<TxRow>[] = [
    { key: 'id', header: t('settlement.modal.txId'), width: '120px', render: (r) => <span className="font-mono text-[10px] text-fg-muted">{r.id.slice(-12)}</span> },
    { key: 'status', header: t('settlement.batches.status'), width: '90px', render: (r) => <Badge tone={r.status === 'SETTLED' ? 'success' : 'neutral'} startDot>{t(`settlement.status.${r.status}`)}</Badge> },
    { key: 'method', header: t('settlement.modal.txMethod'), width: '100px', render: (r) => <span className="text-[11px]">{t(`settlement.txEnum.${r.authMethod}`)}</span> },
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
          { label: batch.brandName ?? batch.brandHqId.slice(0, 8) },
        ],
        title: `${t('settlement.batches.title')} — ${batch.brandName ?? batch.id.slice(0, 8)}`,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 배치 요약 */}
      <SectionCard title={t('settlement.batches.title')} padding="md">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] md:grid-cols-4">
          {infoItems.map((item) => (
            <div key={item.label}>
              <span className="text-[11px] text-fg-muted">{item.label}</span>
              <div className={`mt-0.5 ${item.bold ? 'font-bold' : ''}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 포함된 거래 목록 */}
      <SectionCard
        title={`${t('settlement.modal.txId')} (${txCount} ${t('settlement.revenue.transactions')})`}
        padding="none"
      >
        {txLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={28} />)}
          </div>
        ) : (
          <DataTable
            columns={txColumns}
            rows={transactions}
            rowKey={(r) => r.id}
            compact
            emptyState={t('settlement.modal.noTransactions')}
          />
        )}
      </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
