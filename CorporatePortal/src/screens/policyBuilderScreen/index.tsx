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
  DatePicker,
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

const TAB_KEYS = ['basic', 'timeWindow', 'limits', 'target', 'merchant'] as const;

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

  // Form state -- Tab 2: 시간대
  const [allowedDayOfWeek, setAllowedDayOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [allowedTimeStart, setAllowedTimeStart] = useState('06:00');
  const [allowedTimeEnd, setAllowedTimeEnd] = useState('22:00');
  const [allowedMealTypes, setAllowedMealTypes] = useState<string[]>([]);

  // Form state -- Tab 4: 적용 대상
  const [targetScope, setTargetScope] = useState<'ALL' | 'DEPARTMENT' | 'RANK'>('ALL');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);

  // Form state -- Tab 5: 머천트/카테고리
  const [merchantCategoryRestrictions, setMerchantCategoryRestrictions] = useState<string[]>([]);
  const [merchantCategoryInput, setMerchantCategoryInput] = useState('');

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
    setAllowedDayOfWeek(policy.allowedDayOfWeek ?? [1, 2, 3, 4, 5]);
    setAllowedTimeStart(policy.allowedTimeStart ?? '06:00');
    setAllowedTimeEnd(policy.allowedTimeEnd ?? '22:00');
    setAllowedMealTypes(policy.allowedMealTypes ?? []);
    setMerchantCategoryRestrictions(policy.merchantCategoryRestrictions ?? []);
    setSelectedDepartmentIds(policy.appliesToDepartmentIds ?? []);
    setSelectedRoleCodes(policy.appliesToRoleCodes ?? []);
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
    appliesToDepartmentIds: targetScope === 'DEPARTMENT' ? selectedDepartmentIds : [],
    appliesToRoleCodes: targetScope === 'RANK' ? selectedRoleCodes : [],
    allowedDayOfWeek,
    allowedTimeStart,
    allowedTimeEnd,
    allowedMealTypes,
    merchantCategoryRestrictions,
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
      setActionError(t('policy.saveError'));
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
      setActionError(t('policy.publishError'));
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
      setActionError(t('policy.pauseError'));
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
      setActionError(t('policy.deactivateError'));
    }
  };

  const goNext = () => setActiveTab((prev) => Math.min(prev + 1, TAB_KEYS.length - 1));
  const goPrev = () => setActiveTab((prev) => Math.max(prev - 1, 0));

  const policyStatus = policy?.status ?? null;
  const canPublish = !isNew && (policyStatus === 'DRAFT' || policyStatus === 'PAUSED');
  const canPause = !isNew && policyStatus === 'ACTIVE';
  const canDeactivate = !isNew && (policyStatus === 'ACTIVE' || policyStatus === 'PAUSED');

  const renderTab = () => {
    if (!isNew && detailLoading) {
      return (
        <SectionCard title={t('common.loading')}>
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
          <SectionCard title={t('policy.tabs.basic')}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.codeLabel')} *</label>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={policyCode}
                  onChange={(e) => setPolicyCode(e.target.value)}
                  placeholder={t('policy.codePlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.nameLabel')} *</label>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder={t('policy.namePlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.descriptionLabel')}</label>
                <textarea
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('policy.descriptionPlaceholder')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.priorityLabel')}</label>
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
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.startDate')} *</label>
                <DatePicker
                  value={effectiveFrom}
                  onChange={(val) => setEffectiveFrom(val ?? '')}
                  placeholder="yyyy-mm-dd"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.endDate')} *</label>
                <DatePicker
                  value={effectiveTo}
                  onChange={(val) => setEffectiveTo(val ?? '')}
                  placeholder="yyyy-mm-dd"
                />
              </div>
            </div>
          </SectionCard>
        );

      /* --- Tab 2: 시간대 --- */
      case 1: {
        const DAY_LABELS = [0, 1, 2, 3, 4, 5, 6].map((idx) => t(`policy.dayOfWeek.${idx}`));
        const toggleDay = (day: number) => {
          setAllowedDayOfWeek((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
          );
        };
        return (
          <SectionCard title={t('policy.tabs.timeWindow')}>
            <p className="mb-4 text-sm text-fg-muted">{t('policy.timeWindowDescription')}</p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.allowedDays')}</label>
                <div className="flex gap-2">
                  {DAY_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors"
                      style={{
                        borderColor: allowedDayOfWeek.includes(idx) ? 'var(--brand)' : 'var(--border)',
                        background: allowedDayOfWeek.includes(idx) ? 'var(--brand)' : 'var(--surface-1)',
                        color: allowedDayOfWeek.includes(idx) ? '#fff' : 'var(--fg-muted)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('policy.startTime')}</label>
                  <input
                    type="time"
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                    value={allowedTimeStart}
                    onChange={(e) => setAllowedTimeStart(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('policy.endTime')}</label>
                  <input
                    type="time"
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                    value={allowedTimeEnd}
                    onChange={(e) => setAllowedTimeEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.allowedMealTypes')}</label>
                <div className="flex gap-2">
                  {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((meal) => {
                    const selected = allowedMealTypes.includes(meal);
                    return (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => {
                          setAllowedMealTypes((prev) =>
                            selected ? prev.filter((m) => m !== meal) : [...prev, meal],
                          );
                        }}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                        style={{
                          borderColor: selected ? 'var(--brand)' : 'var(--border)',
                          background: selected ? 'var(--brand)' : 'var(--surface-1)',
                          color: selected ? '#fff' : 'var(--fg-muted)',
                        }}
                      >
                        {t(`policy.mealType.${meal}`)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-fg-subtle">{t('policy.mealTypeHint')}</p>
              </div>
            </div>
          </SectionCard>
        );
      }

      /* --- Tab 3: 한도 --- */
      case 2:
        return (
          <SectionCard title={t('policy.tabs.limits')}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.maxPerTransaction')}</label>
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
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.dailyLimit')}</label>
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
                <label className="text-sm font-semibold text-fg">{t('policy.splitPayment')}</label>
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
                <label className="text-sm font-semibold text-fg">{t('policy.carryover')}</label>
              </div>
            </div>
          </SectionCard>
        );

      /* --- Tab 4: 적용 대상 --- */
      case 3:
        return (
          <SectionCard title={t('policy.tabs.target')}>
            <div className="flex flex-col gap-3">
              {([
                { value: 'ALL' as const, label: t('policy.targetAll') },
                { value: 'DEPARTMENT' as const, label: t('policy.targetDepartment') },
                { value: 'RANK' as const, label: t('policy.targetRank') },
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
                  {targetScope === 'DEPARTMENT' ? t('policy.deptSelectorHint') : t('policy.rankSelectorHint')}
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
          <SectionCard title={t('policy.merchantTitle')}>
            <p className="mb-4 text-sm text-fg-muted">
              {t('policy.merchantDescription')}
            </p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.categoryLabel')}</label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                    placeholder={t('policy.categoryPlaceholder')}
                    value={merchantCategoryInput}
                    onChange={(e) => setMerchantCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && merchantCategoryInput.trim()) {
                        const val = merchantCategoryInput.trim();
                        if (!merchantCategoryRestrictions.includes(val)) {
                          setMerchantCategoryRestrictions((prev) => [...prev, val]);
                        }
                        setMerchantCategoryInput('');
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!merchantCategoryInput.trim()}
                    onClick={() => {
                      const val = merchantCategoryInput.trim();
                      if (val && !merchantCategoryRestrictions.includes(val)) {
                        setMerchantCategoryRestrictions((prev) => [...prev, val]);
                      }
                      setMerchantCategoryInput('');
                    }}
                  >
                    {t('policy.categoryAdd')}
                  </Button>
                </div>
              </div>
              {merchantCategoryRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {merchantCategoryRestrictions.map((cat) => (
                    <Badge key={cat} tone="brand" size="sm">
                      {cat}
                      <button
                        type="button"
                        className="ml-1 text-[10px]"
                        onClick={() => setMerchantCategoryRestrictions((prev) => prev.filter((c) => c !== cat))}
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {merchantCategoryRestrictions.length === 0 && (
                <p className="text-[11px] text-fg-subtle">{t('policy.categoryNoRestriction')}</p>
              )}
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
          { label: isNew ? t('policy.newPolicy') : (policy?.policyName ?? t('policy.editPolicy')) },
        ],
        title: isNew ? t('policy.newPolicyTitle') : t('policy.builderTitle'),
        description: t('policy.builderDescription'),
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
                {t('policy.publish')}
              </Button>
            )}
            {canPause && (
              <Button
                variant="ghost"
                startIcon={<PauseCircle size={14} />}
                onClick={handlePause}
                loading={pausing}
              >
                {t('policy.pause')}
              </Button>
            )}
            {canDeactivate && (
              <Button
                variant="danger"
                startIcon={<XCircle size={14} />}
                onClick={handleDeactivate}
                loading={deactivating}
              >
                {t('policy.deactivate')}
              </Button>
            )}
            <Button
              variant="primary"
              startIcon={<Save size={14} />}
              onClick={handleSave}
              loading={saving}
            >
              {t('common.save')}
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
        {TAB_KEYS.map((key, idx) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(idx)}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: activeTab === idx ? 'var(--brand)' : 'transparent',
              color: activeTab === idx ? '#fff' : 'var(--fg-muted)',
            }}
          >
            {idx + 1}. {t(`policy.tabs.${key}`)}
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
          {t('common.previous')}
        </Button>
        <Badge tone="neutral" size="sm">
          {activeTab + 1} / {TAB_KEYS.length}
        </Badge>
        <Button
          variant="ghost"
          endIcon={<ChevronRight size={14} />}
          onClick={goNext}
          disabled={activeTab === TAB_KEYS.length - 1}
        >
          {t('common.next')}
        </Button>
      </div>
    </DetailPageTemplate>
  );
}
