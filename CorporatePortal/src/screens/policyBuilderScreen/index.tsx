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
  Tabs,
  NumberInput,
  Toggle,
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
import { DEPARTMENTS_QUERY, type DepartmentsData } from '@graphql/queries/department';
import { Checkbox } from '@platform/shared-ui';

const TAB_KEYS = ['basic', 'timeWindow', 'limits', 'target', 'merchant'] as const;
const MERCHANT_CATEGORIES = [
  'KOREAN', 'VIETNAMESE', 'CHINESE', 'JAPANESE', 'WESTERN',
  'FAST_FOOD', 'CAFE', 'BAKERY', 'BUFFET', 'OTHER',
] as const;

export function PolicyBuilderScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const canWrite = useHasPermission(PERMISSIONS.POLICY_WRITE);
  const corporateId = useCorporateId();

  // Fetch departments for target scope
  const { data: deptData } = useQuery<DepartmentsData>(DEPARTMENTS_QUERY, {
    variables: { corporateId },
    skip: !corporateId,
  });
  const departments = deptData?.mealDepartments?.success?.data ?? [];

  const isNew = params?.id === 'new' || !params?.id;

  const [activeTab, setActiveTab] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form state -- Tab 1: 기본 정보
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

  /* ── Queries ── */
  const { data: detailData, loading: detailLoading } = useQuery<PolicyDetailData>(POLICY_DETAIL_QUERY, {
    variables: { id: params?.id },
    skip: isNew,
  });

  const policy = detailData?.mealPolicy?.success?.data ?? null;

  /* ── Prefill form when editing ── */
  useEffect(() => {
    if (!policy) return;
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
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-colors ${
                        allowedDayOfWeek.includes(idx)
                          ? 'border-primary bg-primary text-primary-fg shadow-sm'
                          : 'border-border bg-surface-1 text-fg-muted hover:border-fg-muted'
                      }`}
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
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                          selected
                            ? 'border-primary bg-primary text-primary-fg shadow-sm'
                            : 'border-border bg-surface-1 text-fg-muted hover:border-fg-muted'
                        }`}
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.maxPerTransaction')}</label>
                <NumberInput
                  value={maxPerTransactionVnd}
                  onValueChange={({ raw }) => setMaxPerTransactionVnd(raw)}
                  locale="vi-VN"
                  min={0}
                  placeholder="50,000"
                  style={{ width: '100%' }}
                />
                <p className="text-[11px] text-fg-subtle">{t('policy.limitHint')}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('policy.dailyLimit')}</label>
                <NumberInput
                  value={dailyLimitVnd}
                  onValueChange={({ raw }) => setDailyLimitVnd(raw)}
                  locale="vi-VN"
                  min={0}
                  placeholder="150,000"
                  style={{ width: '100%' }}
                />
                <p className="text-[11px] text-fg-subtle">{t('policy.limitHint')}</p>
              </div>
              <div className="md:col-span-2 flex flex-col gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
                <Toggle
                  checked={allowSplitPayment}
                  onChange={setAllowSplitPayment}
                  label={t('policy.splitPayment')}
                />
                <Toggle
                  checked={allowCarryover}
                  onChange={setAllowCarryover}
                  label={t('policy.carryover')}
                />
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
            {targetScope === 'DEPARTMENT' && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-fg-muted">{t('policy.deptSelectorHint')}</p>
                <div className="flex flex-col gap-2 rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  {departments.length === 0 ? (
                    <p className="text-[12px] text-fg-subtle">{t('common.empty')}</p>
                  ) : departments.map((dept) => {
                    const checked = selectedDepartmentIds.includes(dept.id);
                    return (
                      <label key={dept.id} className="flex items-center gap-3 cursor-pointer rounded-md px-2 py-1.5 hover:bg-surface-2">
                        <Checkbox checked={checked} onChange={() => {
                          setSelectedDepartmentIds((prev) =>
                            checked ? prev.filter((d) => d !== dept.id) : [...prev, dept.id],
                          );
                        }} />
                        <span className="text-sm text-fg">{dept.departmentName}</span>
                        <span className="text-[11px] text-fg-muted font-mono">{dept.departmentCode}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            {targetScope === 'RANK' && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-fg-muted">{t('policy.rankSelectorHint')}</p>
                <div className="flex flex-col gap-2 rounded-lg border p-3" style={{ borderColor: 'var(--border)' }}>
                  {['EXECUTIVE', 'MANAGER', 'STAFF', 'INTERN', 'CONTRACT', 'DISPATCH'].map((role) => {
                    const checked = selectedRoleCodes.includes(role);
                    return (
                      <label key={role} className="flex items-center gap-3 cursor-pointer rounded-md px-2 py-1.5 hover:bg-surface-2">
                        <Checkbox checked={checked} onChange={() => {
                          setSelectedRoleCodes((prev) =>
                            checked ? prev.filter((r) => r !== role) : [...prev, role],
                          );
                        }} />
                        <span className="text-sm text-fg">{t(`policy.rank.${role}`)}</span>
                      </label>
                    );
                  })}
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
            <div className="flex flex-col gap-3">
              <label className="text-[12px] font-semibold text-fg-muted">{t('policy.categoryLabel')}</label>
              <div className="flex flex-wrap gap-2">
                {MERCHANT_CATEGORIES.map((cat) => {
                  const selected = merchantCategoryRestrictions.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setMerchantCategoryRestrictions((prev) =>
                          selected ? prev.filter((c) => c !== cat) : [...prev, cat],
                        );
                      }}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                        selected
                          ? 'border-primary bg-primary text-primary-fg shadow-sm'
                          : 'border-border bg-surface-1 text-fg-muted hover:border-fg-muted'
                      }`}
                    >
                      {t(`policy.category.${cat}`)}
                    </button>
                  );
                })}
              </div>
              {merchantCategoryRestrictions.length === 0 && (
                <p className="text-[11px] text-fg-subtle">{t('policy.categoryNoRestriction')}</p>
              )}
              {merchantCategoryRestrictions.length > 0 && (
                <p className="text-[11px] text-fg-muted">
                  {t('policy.categorySelected')}: {merchantCategoryRestrictions.map((c) => t(`policy.category.${c}`)).join(', ')}
                </p>
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
      <Tabs
        variant="segment"
        items={TAB_KEYS.map((key, idx) => ({
          key: String(idx),
          label: `${idx + 1}. ${t(`policy.tabs.${key}`)}`,
        }))}
        value={String(activeTab)}
        onChange={(k) => setActiveTab(Number(k))}
      />

      {/* Tab Content */}
      <div className="mt-4">
        {renderTab()}
      </div>

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
