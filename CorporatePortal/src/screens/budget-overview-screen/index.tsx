'use client';

import {
  DetailPageTemplate,
  SectionCard,
  Badge,
  Skeleton,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';

type FundingModel = 'UNASSIGNED' | 'PREPAID_DEPOSIT' | 'CREDIT_NET15' | 'CREDIT_NET30';

export function BudgetOverviewScreen() {
  const { t } = useI18n();
  const canRead = useHasPermission(PERMISSIONS.WALLET_READ);

  if (!canRead) return <LockedScreen />;

  // TODO: useQuery for corporate funding policy + budget overview
  const loading = true;
  const fundingModel: FundingModel = 'UNASSIGNED'; // will be replaced by query data

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
                ⚠
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
              <Skeleton width={120} height={28} />
            </div>
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <p className="text-[12px] font-semibold text-fg-muted">월 예산</p>
              <Skeleton width={120} height={28} />
            </div>
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <p className="text-[12px] font-semibold text-fg-muted">사용 중</p>
              <Skeleton width={120} height={28} />
            </div>
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <p className="text-[12px] font-semibold text-fg-muted">잔여</p>
              <Skeleton width={120} height={28} />
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
                <Skeleton width={120} height={28} />
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">사용률</p>
                <Skeleton width="100%" height={12} radius={6} />
                <Skeleton width={80} height={16} />
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">다음 정산일</p>
                <Skeleton width={100} height={28} />
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
        {renderFundingCard()}
      </SectionCard>

      {/* Section 2: 이번 달 포인트 소진 요약 */}
      <div className="mt-4">
        <SectionCard title="이번 달 포인트 소진 요약">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              '총 지급 포인트',
              '사용 포인트',
              '잔여 포인트',
              '거래 건수',
              '평균 건당 금액',
            ].map((label) => (
              <div
                key={label}
                className="rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                <p className="text-[12px] font-semibold text-fg-muted">{label}</p>
                <Skeleton width={100} height={28} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Section 3: 충전 이력 */}
      <div className="mt-4">
        <SectionCard title="충전 이력" description="최근 충전/입금 내역" padding="none">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={30} />
              ))}
            </div>
          ) : (
            <p className="p-4 text-sm text-fg-muted">충전 이력이 없습니다.</p>
          )}
        </SectionCard>
      </div>
    </DetailPageTemplate>
  );
}
