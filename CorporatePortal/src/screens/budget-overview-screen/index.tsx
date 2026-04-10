'use client';

import { useQuery } from '@apollo/client';
import { RefreshCw } from 'lucide-react';
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
import {
  FUNDING_ACCOUNT_QUERY,
  BUDGET_SUMMARY_QUERY,
  ALLOWANCE_LOAD_BATCHES_QUERY,
  type FundingAccountData,
  type FundingAccount,
  type BudgetSummaryData,
  type AllowanceLoadBatchesData,
  type AllowanceLoadBatch,
} from '@graphql/queries/budget';
import { useCorporateId } from '@shared/hooks/useCorporateId';

type FundingModel = 'UNASSIGNED' | 'PREPAID_DEPOSIT' | 'CREDIT_NET15' | 'CREDIT_NET30';

type BatchStatus = 'PENDING' | 'POSTED' | 'FAILED' | 'PARTIAL_SUCCESS';

const BATCH_STATUS_TONE: Record<BatchStatus, 'neutral' | 'success' | 'danger' | 'warning'> = {
  PENDING: 'neutral',
  POSTED: 'success',
  FAILED: 'danger',
  PARTIAL_SUCCESS: 'warning',
};

function getCurrentPeriod(): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const periodStart = new Date(year, month, 1).toISOString().slice(0, 10);
  const periodEnd = new Date(year, month + 1, 0).toISOString().slice(0, 10);
  return { periodStart, periodEnd };
}

export function BudgetOverviewScreen() {
  const { t } = useI18n();
  const canRead = useHasPermission(PERMISSIONS.WALLET_READ);

  const corporateId = useCorporateId();
  const { data, loading, refetch } = useQuery<FundingAccountData>(FUNDING_ACCOUNT_QUERY, {
    variables: { corporateId },
    skip: !corporateId,
  });
  const fundingAccount = (data?.mealFundingAccount?.success?.data ?? null) as FundingAccount | null;
  const fundingModel: FundingModel = (fundingAccount?.fundingModel as FundingModel) ?? 'UNASSIGNED';

  const { periodStart, periodEnd } = getCurrentPeriod();
  const { data: summaryData, loading: summaryLoading } = useQuery<BudgetSummaryData>(BUDGET_SUMMARY_QUERY, {
    variables: { corporateId, periodStart, periodEnd },
    skip: !corporateId,
  });

  const { data: batchesData, loading: batchesLoading } = useQuery<AllowanceLoadBatchesData>(ALLOWANCE_LOAD_BATCHES_QUERY, {
    variables: { corporateId, skip: 0, take: 10 },
    skip: !corporateId,
  });

  const summary = summaryData?.mealBudgetSummary?.success?.data ?? null;
  const batches = batchesData?.mealAllowanceLoadBatches?.success?.data ?? [];

  if (!canRead) return <LockedScreen />;

  const batchColumns: DataTableColumn<AllowanceLoadBatch>[] = [
    {
      key: 'createdAt',
      header: '일시',
      width: '180px',
      render: (r) => (
        <span className="text-[13px] text-fg">
          {new Date(r.createdAt).toLocaleString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'employeeCount',
      header: '대상인원',
      width: '100px',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-[13px] text-fg">{r.employeeCount}명</span>
      ),
    },
    {
      key: 'totalAmountVnd',
      header: '총액',
      width: '160px',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-[13px] font-semibold text-fg">
          {formatCurrency(r.totalAmountVnd)} VND
        </span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '140px',
      render: (r) => (
        <Badge tone={BATCH_STATUS_TONE[r.status as BatchStatus] ?? 'neutral'} size="sm">
          {r.status}
        </Badge>
      ),
    },
  ];

  const renderFundingCard = () => {
    switch (fundingModel) {
      case 'UNASSIGNED':
        return (
          <div
            className="rounded-xl border-2 p-6"
            style={{ borderColor: 'var(--warn)', background: 'var(--warn-soft)' }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-2xl" style={{ background: 'var(--warn)' }}>
                !
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-fg">
                  Funding Policy가 아직 부여되지 않았습니다
                </h3>
                <p className="mt-1 text-sm text-fg-muted">
                  예산 관리를 시작하려면 SuperAdmin에게 Funding Policy 설정을 요청하세요.
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: 'var(--brand)' }}
                >
                  SuperAdmin에게 문의하기
                </button>
              </div>
            </div>
          </div>
        );

      case 'PREPAID_DEPOSIT':
        return (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <p className="text-[12px] font-semibold text-fg-muted">에스크로 잔액</p>
              <p className="mt-1 text-lg font-bold text-fg">
                {fundingAccount?.depositBalanceVnd ? formatCurrency(fundingAccount.depositBalanceVnd) : '—'}
              </p>
            </div>
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <p className="text-[12px] font-semibold text-fg-muted">월 예산</p>
              <p className="mt-1 text-lg font-bold text-fg">
                {fundingAccount?.monthlyBudgetVnd ? formatCurrency(fundingAccount.monthlyBudgetVnd) : '—'}
              </p>
            </div>
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <p className="text-[12px] font-semibold text-fg-muted">사용 중</p>
              <p className="mt-1 text-lg font-bold text-fg">
                {fundingAccount?.monthlySpentVnd ? formatCurrency(fundingAccount.monthlySpentVnd) : '—'}
              </p>
            </div>
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <p className="text-[12px] font-semibold text-fg-muted">잔여</p>
              <p className="mt-1 text-lg font-bold text-fg">
                {fundingAccount?.monthlyBudgetVnd && fundingAccount?.monthlySpentVnd
                  ? formatCurrency(
                      Number(fundingAccount.monthlyBudgetVnd) - Number(fundingAccount.monthlySpentVnd),
                    )
                  : '—'}
              </p>
            </div>
          </div>
        );

      case 'CREDIT_NET15':
      case 'CREDIT_NET30':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">신용 한도</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {fundingAccount?.creditLimitVnd ? formatCurrency(fundingAccount.creditLimitVnd) : '—'}
                </p>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">사용 중</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {fundingAccount?.creditOutstandingVnd ? formatCurrency(fundingAccount.creditOutstandingVnd) : '—'}
                </p>
                {fundingAccount?.creditLimitVnd && fundingAccount?.creditOutstandingVnd && (
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full" style={{ background: 'var(--surface-3)' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          background: 'var(--brand)',
                          width: `${Math.min(100, (Number(fundingAccount.creditOutstandingVnd) / Number(fundingAccount.creditLimitVnd)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-fg-muted">
                      {((Number(fundingAccount.creditOutstandingVnd) / Number(fundingAccount.creditLimitVnd)) * 100).toFixed(1)}% 사용
                    </p>
                  </div>
                )}
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">정산 조건</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {fundingModel === 'CREDIT_NET15' ? 'NET 15' : 'NET 30'}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.budget') }],
        title: t('nav.budget'),
        description: '예산 현황, 포인트 소진 요약, 충전 이력을 확인합니다.',
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
              {t('common.refresh')}
            </Button>
          </div>
        ),
      }}
    >
      {/* Section 1: Funding Policy 상태 */}
      <SectionCard
        title="Funding Policy 상태"
        description={
          fundingModel === 'UNASSIGNED'
            ? '미설정'
            : fundingModel === 'PREPAID_DEPOSIT'
              ? '선불 입금'
              : fundingModel === 'CREDIT_NET15'
                ? '신용 NET15'
                : '신용 NET30'
        }
      >
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <Skeleton width={80} height={12} />
                <Skeleton width={120} height={28} />
              </div>
            ))}
          </div>
        ) : (
          renderFundingCard()
        )}
      </SectionCard>

      {/* Section 2: 이번 달 포인트 소진 요약 */}
      <div className="mt-4">
        <SectionCard title="이번 달 포인트 소진 요약">
          {summaryLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-5"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                >
                  <Skeleton width={80} height={12} />
                  <Skeleton width={100} height={28} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">월 총 예산</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {summary?.totalBudgetVnd ? formatCurrency(summary.totalBudgetVnd) : '—'}
                </p>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">배정 포인트</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {summary?.totalAllocatedVnd ? formatCurrency(summary.totalAllocatedVnd) : '—'}
                </p>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">사용 포인트</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {summary?.totalSpentVnd ? formatCurrency(summary.totalSpentVnd) : '—'}
                </p>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">잔여 포인트</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {summary?.totalRemainingVnd ? formatCurrency(summary.totalRemainingVnd) : '—'}
                </p>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">대상 인원</p>
                <p className="mt-1 text-lg font-bold text-fg">
                  {summary?.employeeCount != null ? `${summary.employeeCount}명` : '—'}
                </p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Section 3: 충전 이력 */}
      <div className="mt-4">
        <SectionCard title="충전 이력" description="최근 충전/입금 내역" padding="none">
          {batchesLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={30} />
              ))}
            </div>
          ) : (
            <DataTable
              columns={batchColumns}
              rows={batches}
              rowKey={(r) => r.id}
              compact
              emptyState="충전 이력이 없습니다."
            />
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
