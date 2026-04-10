'use client';

import { useState } from 'react';
import { Skeleton, Badge, Button } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { formatCurrency } from '@shared/utils/format';

type PeriodFilter = 'this_month' | 'last_month' | 'quarter';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  this_month: '이번 달',
  last_month: '지난 달',
  quarter: '분기',
};

export function DashboardScreen() {
  const { t } = useI18n();
  const corporateId = useCorporateId();
  const [period, setPeriod] = useState<PeriodFilter>('this_month');

  // Keep formatCurrency available for future data binding
  void corporateId;
  void formatCurrency;

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-black text-fg">{t('nav.dashboard')}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          예산 소진 현황, 부서별 리포트, 인보이스 상태를 한눈에 확인합니다.
        </p>
      </div>

      {/* Period filter row */}
      <div className="flex gap-2">
        {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => (
          <Button
            key={key}
            variant={period === key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setPeriod(key)}
          >
            {PERIOD_LABELS[key]}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* W1: 이번 달 예산 사용률 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">이번 달 예산 사용률</h3>

          {/* Circular placeholder */}
          <div className="flex justify-center">
            <div
              className="relative flex items-center justify-center rounded-full border-[8px] border-[var(--border)]"
              style={{ width: 128, height: 128 }}
            >
              <span className="text-2xl font-bold text-fg-muted">--%</span>
            </div>
          </div>

          {/* Three stats */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-fg-muted">사용</span>
              <Skeleton width={64} height={18} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-fg-muted">총예산</span>
              <Skeleton width={64} height={18} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-fg-muted">잔여</span>
              <Skeleton width={64} height={18} />
            </div>
          </div>
        </div>

        {/* W2: 월간 추세 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg-muted">월간 소진 추세</h3>
            <Badge tone="neutral" size="sm">지난달 대비</Badge>
          </div>
          <p className="mb-4 text-[11px] text-fg-subtle">최근 6개월</p>

          {/* Chart area placeholder */}
          <Skeleton width="100%" height={160} radius={8} />
        </div>

        {/* W3: 부서별 소진 랭킹 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg-muted">부서별 소진 랭킹</h3>
            <span className="text-[11px] text-fg-subtle">상위 5개 부서</span>
          </div>
          <div className="mt-3 space-y-3">
            {[
              { rank: 1, width: '80%' },
              { rank: 2, width: '65%' },
              { rank: 3, width: '50%' },
              { rank: 4, width: '35%' },
              { rank: 5, width: '20%' },
            ].map((item) => (
              <div key={item.rank} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-right text-[13px] font-bold text-fg-muted">
                  {item.rank}
                </span>
                <Skeleton width={72} height={16} />
                <div className="flex-1">
                  <div
                    className="h-3 rounded-full bg-[var(--primary)]"
                    style={{ width: item.width }}
                  />
                </div>
                <Skeleton width={56} height={16} />
              </div>
            ))}
          </div>
        </div>

        {/* W4: 지갑 상태 분포 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-1 text-sm font-bold text-fg-muted">활성 임직원 / 지갑 상태</h3>

          {/* Segmented bar */}
          <div className="mt-4 flex h-8 w-full overflow-hidden rounded-full">
            <div className="bg-[var(--success)]" style={{ width: '60%' }} />
            <div className="bg-[var(--warning)]" style={{ width: '20%' }} />
            <div className="bg-[var(--info)]" style={{ width: '10%' }} />
            <div className="bg-[var(--border)]" style={{ width: '10%' }} />
          </div>

          {/* Legend with counts */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: '활성', color: 'var(--success)' },
              { label: '정지', color: 'var(--warning)' },
              { label: '동결', color: 'var(--info)' },
              { label: '해지', color: 'var(--border)' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <Skeleton width={36} height={18} />
                <span className="text-[10px] text-fg-subtle">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* W5: 인기 제휴 식당 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">인기 제휴 식당 Top 5</h3>

          {/* Mini DataTable-like structure */}
          <div className="space-y-0">
            {/* Header row */}
            <div className="grid grid-cols-[32px_1fr_80px_100px] gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-[11px] font-semibold text-fg-muted">#</span>
              <span className="text-[11px] font-semibold text-fg-muted">가맹점명</span>
              <span className="text-right text-[11px] font-semibold text-fg-muted">이용건수</span>
              <span className="text-right text-[11px] font-semibold text-fg-muted">금액</span>
            </div>
            {/* Data rows */}
            {[1, 2, 3, 4, 5].map((rank) => (
              <div
                key={rank}
                className="grid grid-cols-[32px_1fr_80px_100px] items-center gap-2 border-b border-[var(--border)] py-2 last:border-b-0"
              >
                <span className="text-[13px] font-bold text-fg-muted">{rank}</span>
                <Skeleton width={96} height={16} />
                <div className="flex justify-end">
                  <Skeleton width={40} height={16} />
                </div>
                <div className="flex justify-end">
                  <Skeleton width={72} height={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* W6: 이번 달 인보이스 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg-muted">이번 달 인보이스</h3>
            <Badge tone="warning" size="sm">검토 대기</Badge>
          </div>

          {/* Summary card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-fg-muted">정산 기간</span>
                <Skeleton width={120} height={16} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-fg-muted">총 금액</span>
                <Skeleton width={96} height={16} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-fg-muted">라인 항목</span>
                <Skeleton width={48} height={16} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                window.location.href = '/invoices';
              }}
            >
              검토하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
