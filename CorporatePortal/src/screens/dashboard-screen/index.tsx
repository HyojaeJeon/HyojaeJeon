'use client';

import { Skeleton } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';

export function DashboardScreen() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-black text-fg">{t('nav.dashboard')}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          예산 소진 현황, 부서별 리포트, 인보이스 상태를 한눈에 확인합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* W1: 이번 달 예산 사용률 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">이번 달 예산 사용률</h3>
          <div className="flex justify-center">
            <Skeleton width={128} height={128} radius={64} />
          </div>
          <div className="mt-4 flex justify-between">
            <Skeleton width={80} height={16} />
            <Skeleton width={80} height={16} />
            <Skeleton width={80} height={16} />
          </div>
        </div>

        {/* W2: 월간 추세 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">월간 소진 추세</h3>
          <Skeleton width="100%" height={160} radius={8} />
        </div>

        {/* W3: 부서별 소진 랭킹 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">부서별 소진 랭킹</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width={96} height={16} />
                <Skeleton height={12} radius={6} />
                <Skeleton width={64} height={16} />
              </div>
            ))}
          </div>
        </div>

        {/* W4: 지갑 상태 분포 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">지갑 상태 분포</h3>
          <Skeleton width="100%" height={32} radius={16} />
          <div className="mt-4 flex justify-between">
            {['활성', '정지', '동결', '해지'].map((label) => (
              <div key={label} className="text-center">
                <Skeleton width={40} height={24} />
                <span className="mt-1 block text-[10px] text-fg-subtle">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* W5: 인기 제휴 식당 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">인기 제휴 식당 Top 5</h3>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton width={128} height={16} />
                <Skeleton width={80} height={16} />
              </div>
            ))}
          </div>
        </div>

        {/* W6: 이번 달 인보이스 */}
        <div className="rounded-xl border bg-surface-1 p-6" style={{ borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-sm font-bold text-fg-muted">이번 달 인보이스</h3>
          <Skeleton width={96} height={24} radius={12} />
          <div className="mt-3">
            <Skeleton width="100%" height={64} radius={8} />
          </div>
          <div className="mt-3">
            <Skeleton width={112} height={36} radius={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
