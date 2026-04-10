'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Play, PauseCircle, XCircle } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  Button,
  Badge,
  Skeleton,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import {
  POLICY_DETAIL_QUERY,
  CREATE_POLICY_MUTATION,
  UPDATE_POLICY_MUTATION,
  PUBLISH_POLICY_MUTATION,
  PAUSE_POLICY_MUTATION,
  DEACTIVATE_POLICY_MUTATION,
  type PolicyDetailData,
  type CreatePolicyData,
  type UpdatePolicyData,
  type PublishPolicyData,
  type PausePolicyData,
  type DeactivatePolicyData,
} from '@graphql/queries/policy';

const TAB_NAMES = ['기본 정보', '시간대', '한도', '적용 대상', '머천트/카테고리'] as const;

export function PolicyBuilderScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const canWrite = useHasPermission(PERMISSIONS.POLICY_WRITE);
  const corporateId = useCorporateId();

  const isNew = params?.id === 'new' || !params?.id;

  const [activeTab, setActiveTab] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form state -- Tab 1: 기본 정보
  const [policyCode, setPolicyCode] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');

  // Form state -- Tab 3: 한도
  const [maxPerTransactionVnd, setMaxPerTransactionVnd] = useState('');
  const [dailyLimitVnd, setDailyLimitVnd] = useState('');
  const [allowSplitPayment, setAllowSplitPayment] = useState(false);
  const [allowCarryover, setAllowCarryover] = useState(false);

  // Form state -- Tab 4: 적용 대상
  const [targetScope, setTargetScope] = useState<'ALL' | 'DEPARTMENT' | 'RANK'>('ALL');

  /* ── Queries ── */
  const { data: detailData, loading: detailLoading } = useQuery<PolicyDetailData>(POLICY_DETAIL_QUERY, {
    variables: { id: params?.id },
    skip: isNew,
  });

  const policy = detailData?.mealPolicy?.success?.data ?? null;

  /* ── Prefill form when editing ── */
  useEffect(() => {
    if (!policy) return;
    setPolicyCode(policy.policyCode ?? '');
    setPolicyName(policy.policyName ?? '');
    setDescription('');
    setPriority(0);
    setEffectiveFrom(policy.effectiveFrom?.slice(0, 10) ?? '');
    setEffectiveTo(policy.effectiveTo?.slice(0, 10) ?? '');
    setMaxPerTransactionVnd(policy.maxPerTransactionVnd ?? '');
    setDailyLimitVnd(policy.dailyLimitVnd ?? '');
    setAllowSplitPayment(policy.allowSplitPayment ?? false);
    setAllowCarryover(false);
    if (policy.appliesToDepartmentIds?.length) {
      setTargetScope('DEPARTMENT');
    } else if (policy.appliesToRoleCodes?.length) {
      setTargetScope('RANK');
    } else {
      setTargetScope('ALL');
    }
  }, [policy]);

  /* ── Mutations ── */
  const [createPolicy, { loading: creating }] = useMutation<CreatePolicyData>(CREATE_POLICY_MUTATION);
  const [updatePolicy, { loading: updating }] = useMutation<UpdatePolicyData>(UPDATE_POLICY_MUTATION);
  const [publishPolicy, { loading: publishing }] = useMutation<PublishPolicyData>(PUBLISH_POLICY_MUTATION);
  const [pausePolicy, { loading: pausing }] = useMutation<PausePolicyData>(PAUSE_POLICY_MUTATION);
  const [deactivatePolicy, { loading: deactivating }] = useMutation<DeactivatePolicyData>(DEACTIVATE_POLICY_MUTATION);

  const saving = creating || updating;

  if (!canWrite) return <LockedScreen />;

  const buildInput = () => ({
    corporateId,
    policyCode,
    policyName,
    effectiveFrom: effectiveFrom || undefined,
    effectiveTo: effectiveTo || undefined,
    maxPerTransactionVnd: maxPerTransactionVnd || undefined,
    dailyLimitVnd: dailyLimitVnd || undefined,
    allowSplitPayment,
  });

  const handleSave = async () => {
    setActionError(null);
    try {
      if (isNew) {
        const result = await createPolicy({ variables: { input: buildInput() } });
        const err = result.data?.mealPolicyCreate?.error;
        if (err) {
          setActionError(err.message);
          return;
        }
        const newId = result.data?.mealPolicyCreate?.success?.data?.id;
        if (newId) {
          router.push(`/policies/${newId}`);
        }
      } else {
        const result = await updatePolicy({ variables: { id: params!.id, input: buildInput() } });
        const err = result.data?.mealPolicyUpdate?.error;
        if (err) {
          setActionError(err.message);
        }
      }
    } catch {
      setActionError('저장 중 오류가 발생했습니다.');
    }
  };

  const handlePublish = async () => {
    setActionError(null);
    try {
      const result = await publishPolicy({ variables: { id: params!.id } });
      const err = result.data?.mealPolicyPublish?.error;
      if (err) {
        setActionError(err.message);
      }
    } catch {
      setActionError('발행 중 오류가 발생했습니다.');
    }
  };

  const handlePause = async () => {
    setActionError(null);
    try {
      const result = await pausePolicy({ variables: { id: params!.id } });
      const err = result.data?.mealPolicyPause?.error;
      if (err) {
        setActionError(err.message);
      }
    } catch {
      setActionError('일시 중지 중 오류가 발생했습니다.');
    }
  };

  const handleDeactivate = async () => {
    setActionError(null);
    try {
      const result = await deactivatePolicy({ variables: { id: params!.id } });
      const err = result.data?.mealPolicyDeactivate?.error;
      if (err) {
        setActionError(err.message);
      }
    } catch {
      setActionError('비활성화 중 오류가 발생했습니다.');
    }
  };

  const goNext = () => setActiveTab((prev) => Math.min(prev + 1, TAB_NAMES.length - 1));
  const goPrev = () => setActiveTab((prev) => Math.max(prev - 1, 0));

  const policyStatus = policy?.status ?? null;
  const canPublish = !isNew && (policyStatus === 'DRAFT' || policyStatus === 'PAUSED');
  const canPause = !isNew && policyStatus === 'ACTIVE';
  const canDeactivate = !isNew && (policyStatus === 'ACTIVE' || policyStatus === 'PAUSED');

  const renderTab = () => {
    if (!isNew && detailLoading) {
      return (
        <SectionCard title="로딩 중...">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={40} />
            ))}
          </div>
        </SectionCard>
      );
    }

    switch (activeTab) {
      /* --- Tab 1: 기본 정보 --- */
      case 0:
        return (
          <SectionCard title="기본 정보">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">정책코드 *</label>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={policyCode}
                  onChange={(e) => setPolicyCode(e.target.value)}
                  placeholder="LUNCH_DEFAULT"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">정책명 *</label>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="기본 점심 정책"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[12px] font-semibold text-fg-muted">설명</label>
                <textarea
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="정책에 대한 설명을 입력합니다."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">우선순위</label>
                <input
                  type="number"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div />
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">시작일 *</label>
                <input
                  type="date"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">종료일 *</label>
                <input
                  type="date"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={effectiveTo}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                />
              </div>
            </div>
          </SectionCard>
        );

      /* --- Tab 2: 시간대 --- */
      case 1:
        return (
          <SectionCard title="시간대">
            <p className="mb-4 text-sm text-fg-muted">시간대 윈도우 설정</p>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={40} />
              ))}
            </div>
          </SectionCard>
        );

      /* --- Tab 3: 한도 --- */
      case 2:
        return (
          <SectionCard title="한도">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">1회 한도 (VND)</label>
                <input
                  type="number"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={maxPerTransactionVnd}
                  onChange={(e) => setMaxPerTransactionVnd(e.target.value)}
                  placeholder="50000"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">일일 한도 (VND)</label>
                <input
                  type="number"
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={dailyLimitVnd}
                  onChange={(e) => setDailyLimitVnd(e.target.value)}
                  placeholder="150000"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={allowSplitPayment}
                  onClick={() => setAllowSplitPayment((v) => !v)}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
                  style={{ background: allowSplitPayment ? 'var(--brand)' : 'var(--border)' }}
                >
                  <span
                    className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: allowSplitPayment ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
                <label className="text-sm font-semibold text-fg">Split 결제 허용</label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={allowCarryover}
                  onClick={() => setAllowCarryover((v) => !v)}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
                  style={{ background: allowCarryover ? 'var(--brand)' : 'var(--border)' }}
                >
                  <span
                    className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: allowCarryover ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
                <label className="text-sm font-semibold text-fg">잔액 이월 허용</label>
              </div>
            </div>
          </SectionCard>
        );

      /* --- Tab 4: 적용 대상 --- */
      case 3:
        return (
          <SectionCard title="적용 대상">
            <div className="flex flex-col gap-3">
              {([
                { value: 'ALL' as const, label: '전체' },
                { value: 'DEPARTMENT' as const, label: '특정부서' },
                { value: 'RANK' as const, label: '특정직급' },
              ]).map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="targetScope"
                    value={opt.value}
                    checked={targetScope === opt.value}
                    onChange={() => setTargetScope(opt.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-semibold text-fg">{opt.label}</span>
                </label>
              ))}
            </div>
            {targetScope !== 'ALL' && (
              <div className="mt-4">
                <p className="text-sm text-fg-muted">
                  {targetScope === 'DEPARTMENT' ? '부서 선택기가 여기에 표시됩니다.' : '직급 선택기가 여기에 표시됩니다.'}
                </p>
                <div className="mt-2 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} height={32} />
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        );

      /* --- Tab 5: 머천트/카테고리 --- */
      case 4:
        return (
          <SectionCard title="머천트/카테고리">
            <p className="mb-4 text-sm text-fg-muted">
              허용 카테고리 및 화이트리스트 머천트 설정
            </p>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={36} />
              ))}
            </div>
          </SectionCard>
        );

      default:
        return null;
    }
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.policies'), href: '/policies' },
          { label: isNew ? '새 정책' : (policy?.policyName ?? '정책 편집') },
        ],
        title: isNew ? '새 정책 만들기' : '정책 빌더',
        description: '탭별로 정책 세부 항목을 설정합니다.',
        actions: (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              startIcon={<ArrowLeft size={14} />}
              onClick={() => router.push('/policies')}
            >
              {t('common.back')}
            </Button>
            {canPublish && (
              <Button
                variant="ghost"
                startIcon={<Play size={14} />}
                onClick={handlePublish}
                loading={publishing}
              >
                발행
              </Button>
            )}
            {canPause && (
              <Button
                variant="ghost"
                startIcon={<PauseCircle size={14} />}
                onClick={handlePause}
                loading={pausing}
              >
                일시 중지
              </Button>
            )}
            {canDeactivate && (
              <Button
                variant="danger"
                startIcon={<XCircle size={14} />}
                onClick={handleDeactivate}
                loading={deactivating}
              >
                비활성화
              </Button>
            )}
            <Button
              variant="primary"
              startIcon={<Save size={14} />}
              onClick={handleSave}
              loading={saving}
            >
              저장
            </Button>
          </div>
        ),
      }}
    >
      {/* Error banner */}
      {actionError && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm text-[var(--danger)]"
          style={{ borderColor: 'var(--danger)', background: 'var(--danger-soft, rgba(239,68,68,0.08))' }}
        >
          {actionError}
        </div>
      )}

      {/* Status badge for existing policies */}
      {!isNew && policyStatus && (
        <div className="mb-4">
          <Badge
            tone={
              policyStatus === 'ACTIVE'
                ? 'success'
                : policyStatus === 'PAUSED'
                  ? 'warning'
                  : policyStatus === 'INACTIVE'
                    ? 'neutral'
                    : 'info'
            }
            size="sm"
          >
            {policyStatus}
          </Badge>
        </div>
      )}

      {/* Tab Bar */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border p-1" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
        {TAB_NAMES.map((name, idx) => (
          <button
            key={name}
            type="button"
            onClick={() => setActiveTab(idx)}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: activeTab === idx ? 'var(--brand)' : 'transparent',
              color: activeTab === idx ? '#fff' : 'var(--fg-muted)',
            }}
          >
            {idx + 1}. {name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTab()}

      {/* Navigation */}
      <div className="mt-4 flex justify-between">
        <Button
          variant="ghost"
          startIcon={<ChevronLeft size={14} />}
          onClick={goPrev}
          disabled={activeTab === 0}
        >
          이전
        </Button>
        <Badge tone="neutral" size="sm">
          {activeTab + 1} / {TAB_NAMES.length}
        </Badge>
        <Button
          variant="ghost"
          endIcon={<ChevronRight size={14} />}
          onClick={goNext}
          disabled={activeTab === TAB_NAMES.length - 1}
        >
          다음
        </Button>
      </div>
    </DetailPageTemplate>
  );
}
