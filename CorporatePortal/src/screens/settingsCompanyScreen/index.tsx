'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Save, Pencil, X, RefreshCw, CalendarClock } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  Button,
  Input,
  Skeleton,
  Select,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import {
  CORPORATE_PROFILE_QUERY,
  UPDATE_CORPORATE_MUTATION,
  type CorporateProfileData,
  type CorporateProfile,
} from '@graphql/queries/corporate';
import {
  UPDATE_INVOICE_SCHEDULE_MUTATION,
  type UpdateInvoiceScheduleData,
} from '@graphql/queries/invoice';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

type ConsolidationStrategy =
  | 'BY_MERCHANT'
  | 'BY_DAY'
  | 'BY_DEPARTMENT'
  | 'BY_CATEGORY'
  | 'SINGLE_LINE';

const CONSOLIDATION_LABELS: Record<ConsolidationStrategy, string> = {
  BY_MERCHANT: '가맹점별 합산',
  BY_DAY: '일별 합산',
  BY_DEPARTMENT: '부서별 합산',
  BY_CATEGORY: '카테고리별 합산',
  SINGLE_LINE: '단일 라인',
};

type ScheduleType = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | 'CUSTOM';

type TabKey = 'legal' | 'contact' | 'einvoice' | 'invoiceSchedule';

const TABS: { key: TabKey; labelKey: string; fallback: string }[] = [
  { key: 'legal', labelKey: 'settings.tab.legal', fallback: '법적 정보' },
  { key: 'contact', labelKey: 'settings.tab.contact', fallback: '연락처' },
  { key: 'einvoice', labelKey: 'settings.tab.einvoice', fallback: 'e-Invoice 설정' },
  { key: 'invoiceSchedule', labelKey: 'settings.tab.invoiceSchedule', fallback: '인보이스 스케줄' },
];

export function SettingsCompanyScreen() {
  const { t } = useI18n();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.PROFILE_READ);
  const canWrite = useHasPermission(PERMISSIONS.PROFILE_WRITE);

  const [activeTab, setActiveTab] = useState<TabKey>('legal');
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const corporateId = useCorporateId();
  const { data, loading, refetch } = useQuery<CorporateProfileData>(CORPORATE_PROFILE_QUERY, {
    variables: { id: corporateId },
    skip: !corporateId,
  });
  const profile = (data?.mealCorporate?.success?.data ?? null) as CorporateProfile | null;

  const [updateCorporate, { loading: saving }] = useMutation(UPDATE_CORPORATE_MUTATION);
  const [updateInvoiceSchedule, { loading: savingSchedule }] =
    useMutation<UpdateInvoiceScheduleData>(UPDATE_INVOICE_SCHEDULE_MUTATION);

  // Tab 1: Legal info
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressWard, setAddressWard] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  // Tab 2: Contact info
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactFax, setContactFax] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  // Tab 3: e-Invoice settings
  const [consolidationStrategy, setConsolidationStrategy] =
    useState<ConsolidationStrategy>('BY_MERCHANT');

  // Tab 4: Invoice schedule settings
  const [scheduleType, setScheduleType] = useState<ScheduleType>('MONTHLY');
  const [scheduleDay, setScheduleDay] = useState<number>(1);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Pre-fill form fields from query data
  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName ?? '');
      setTaxCode(profile.taxCode ?? '');
      setAddressCity(profile.addressCity ?? '');
      setAddressDistrict(profile.addressDistrict ?? '');
      setAddressWard(profile.addressWard ?? '');
      setAddressDetail(profile.addressDetail ?? '');
      setContactName(profile.contactName ?? '');
      setContactEmail(profile.contactEmail ?? '');
      setContactPhone(profile.contactPhone ?? '');
      setContactFax(profile.contactFax ?? '');
      setBankAccountNumber(profile.bankAccountNumber ?? '');
      setBankName(profile.bankName ?? '');
      setConsolidationStrategy(
        (profile.einvoiceConsolidationStrategy as ConsolidationStrategy) ?? 'BY_MERCHANT',
      );
    }
  }, [profile]);

  if (hydrated && !canRead) return <LockedScreen />;

  const handleSave = async () => {
    setSaveError(null);
    try {
      const result = await updateCorporate({
        variables: {
          id: corporateId,
          input: {
            companyName,
            taxCode,
            addressCity,
            addressDistrict,
            addressWard,
            addressDetail,
            contactName,
            contactEmail,
            contactPhone,
            contactFax,
            bankAccountNumber,
            bankName,
            einvoiceConsolidationStrategy: consolidationStrategy,
          },
        },
      });
      const gqlError = result.data?.mealCorporateUpdate?.error;
      if (gqlError) {
        setSaveError(gqlError.message);
        return;
      }
      await refetch();
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    }
  };

  const handleSaveSchedule = async () => {
    setScheduleError(null);
    setScheduleSuccess(false);
    try {
      const result = await updateInvoiceSchedule({
        variables: {
          corporateId,
          scheduleType,
          scheduleDay: scheduleType === 'WEEKLY' ? undefined : scheduleDay,
          autoGenerate,
          autoSubmit,
          notifyEmail: notifyEmail || undefined,
        },
      });
      const gqlError = result.data?.mealCorporateUpdateInvoiceSchedule?.error;
      if (gqlError) {
        setScheduleError(gqlError.message);
        return;
      }
      setScheduleSuccess(true);
    } catch (err) {
      setScheduleError(
        err instanceof Error ? err.message : t('invoiceSchedule.saveError'),
      );
    }
  };

  const handleCancel = () => {
    // Reset to original values from query
    if (profile) {
      setCompanyName(profile.companyName ?? '');
      setTaxCode(profile.taxCode ?? '');
      setAddressCity(profile.addressCity ?? '');
      setAddressDistrict(profile.addressDistrict ?? '');
      setAddressWard(profile.addressWard ?? '');
      setAddressDetail(profile.addressDetail ?? '');
      setContactName(profile.contactName ?? '');
      setContactEmail(profile.contactEmail ?? '');
      setContactPhone(profile.contactPhone ?? '');
      setContactFax(profile.contactFax ?? '');
      setBankAccountNumber(profile.bankAccountNumber ?? '');
      setBankName(profile.bankName ?? '');
      setConsolidationStrategy(
        (profile.einvoiceConsolidationStrategy as ConsolidationStrategy) ?? 'BY_MERCHANT',
      );
    }
    setSaveError(null);
    setEditing(false);
  };

  const readOnly = !editing;

  const renderLegalTab = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {saveError && activeTab === 'legal' && (
        <div className="rounded-md p-2 text-[12px] text-danger md:col-span-2" style={{ background: 'var(--danger-soft)' }}>
          {saveError}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">회사명 *</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="주식회사 예시"
            readOnly={readOnly}
            required
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">세금코드 (Tax Code) *</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={taxCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 13);
              setTaxCode(val);
            }}
            placeholder="10~13자리 숫자"
            readOnly={readOnly}
            required
          />
        )}
        {taxCode && (taxCode.length < 10 || taxCode.length > 13) && (
          <span className="text-[11px] text-danger">세금코드는 10~13자리 숫자입니다.</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">시/성 (City/Province)</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={addressCity}
            onChange={(e) => setAddressCity(e.target.value)}
            placeholder="Ho Chi Minh City"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">구/군 (District)</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={addressDistrict}
            onChange={(e) => setAddressDistrict(e.target.value)}
            placeholder="District 1"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">동/면 (Ward)</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={addressWard}
            onChange={(e) => setAddressWard(e.target.value)}
            placeholder="Ward Ben Nghe"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">상세주소</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="123 Nguyen Hue, Floor 5"
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {saveError && activeTab === 'contact' && (
        <div className="rounded-md p-2 text-[12px] text-danger md:col-span-2" style={{ background: 'var(--danger-soft)' }}>
          {saveError}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">담당자명</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="김담당"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">이메일</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="finance@company.com"
            type="email"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">전화번호 (+84)</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+84 28 1234 5678"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">팩스</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={contactFax}
            onChange={(e) => setContactFax(e.target.value)}
            placeholder="+84 28 1234 5679"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">은행 계좌번호</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
            placeholder="1234567890"
            readOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">은행명</label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Vietcombank"
            readOnly={readOnly}
          />
        )}
      </div>
    </div>
  );

  const renderEinvoiceTab = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="text-[12px] font-semibold text-fg-muted">
          인보이스 통합 전략 (Consolidation Strategy)
        </label>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <Select
            value={consolidationStrategy}
            onChange={(val) => setConsolidationStrategy(val as ConsolidationStrategy)}
            options={(Object.keys(CONSOLIDATION_LABELS) as ConsolidationStrategy[]).map((key) => ({
              value: key,
              label: CONSOLIDATION_LABELS[key],
            }))}
            disabled={readOnly}
          />
        )}
        <p className="text-[11px] text-fg-subtle">
          월간 정산 시 세금계산서 라인 항목을 어떤 기준으로 통합할지 선택합니다.
        </p>
      </div>
    </div>
  );

  const computeNextScheduledDate = (): string => {
    const now = new Date();
    let next: Date;
    if (scheduleType === 'WEEKLY') {
      next = new Date(now);
      next.setDate(now.getDate() + (7 - now.getDay()));
    } else if (scheduleType === 'BIWEEKLY') {
      const dayInMonth = now.getDate();
      if (dayInMonth < 15) {
        next = new Date(now.getFullYear(), now.getMonth(), 15);
      } else {
        next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
    } else {
      // MONTHLY or CUSTOM
      const day = Math.min(scheduleDay, 28);
      if (now.getDate() < day) {
        next = new Date(now.getFullYear(), now.getMonth(), day);
      } else {
        next = new Date(now.getFullYear(), now.getMonth() + 1, day);
      }
    }
    return next.toISOString().slice(0, 10);
  };

  const renderInvoiceScheduleTab = () => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {scheduleError && (
        <div
          className="rounded-md p-2 text-[12px] text-danger md:col-span-2"
          style={{ background: 'var(--danger-soft)' }}
        >
          {scheduleError}
        </div>
      )}
      {scheduleSuccess && (
        <div
          className="rounded-md p-2 text-[12px] text-fg md:col-span-2"
          style={{ background: 'var(--brand-soft)' }}
        >
          {t('invoiceSchedule.saveSuccess')}
        </div>
      )}

      {/* Current schedule display */}
      <div
        className="flex items-center gap-3 rounded-xl border p-4 md:col-span-2"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
      >
        <CalendarClock size={20} style={{ color: 'var(--brand)' }} />
        <div>
          <p className="text-[13px] font-semibold text-fg">
            {t('invoiceSchedule.currentSchedule')}: {t(`invoiceSchedule.type.${scheduleType}`)}
            {scheduleType !== 'WEEKLY' && ` (${t('invoiceSchedule.day')} ${scheduleDay})`}
          </p>
          <p className="text-[12px] text-fg-muted">
            {t('invoiceSchedule.nextDate')}: {computeNextScheduledDate()}
          </p>
        </div>
      </div>

      {/* Schedule type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-fg-muted">
          {t('invoiceSchedule.scheduleType')}
        </label>
        <Select
          value={scheduleType}
          onChange={(val) => setScheduleType(val as ScheduleType)}
          options={[
            { value: 'MONTHLY', label: t('invoiceSchedule.type.MONTHLY') },
            { value: 'BIWEEKLY', label: t('invoiceSchedule.type.BIWEEKLY') },
            { value: 'WEEKLY', label: t('invoiceSchedule.type.WEEKLY') },
            { value: 'CUSTOM', label: t('invoiceSchedule.type.CUSTOM') },
          ]}
        />
      </div>

      {/* Day picker (hidden for WEEKLY) */}
      {scheduleType !== 'WEEKLY' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-fg-muted">
            {t('invoiceSchedule.dayLabel')}
          </label>
          <Select
            value={scheduleDay}
            onChange={(val) => setScheduleDay(Number(val))}
            options={Array.from({ length: 28 }, (_, i) => ({
              value: i + 1,
              label: `${i + 1}`,
            }))}
          />
          <p className="text-[11px] text-fg-subtle">
            {t('invoiceSchedule.dayHint')}
          </p>
        </div>
      )}

      {/* Auto-generate toggle */}
      <div className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-[13px] font-semibold text-fg">{t('invoiceSchedule.autoGenerate')}</p>
          <p className="text-[11px] text-fg-muted">{t('invoiceSchedule.autoGenerateHint')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoGenerate}
          onClick={() => setAutoGenerate(!autoGenerate)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
          style={{ background: autoGenerate ? 'var(--brand)' : 'var(--border)' }}
        >
          <span
            className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: autoGenerate ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {/* Auto-submit toggle */}
      <div className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-[13px] font-semibold text-fg">{t('invoiceSchedule.autoSubmit')}</p>
          <p className="text-[11px] text-fg-muted">{t('invoiceSchedule.autoSubmitHint')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={autoSubmit}
          onClick={() => setAutoSubmit(!autoSubmit)}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors"
          style={{ background: autoSubmit ? 'var(--brand)' : 'var(--border)' }}
        >
          <span
            className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: autoSubmit ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {/* Notify email */}
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className="text-[12px] font-semibold text-fg-muted">
          {t('invoiceSchedule.notifyEmail')}
        </label>
        <Input
          type="email"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          placeholder={t('invoiceSchedule.notifyEmailPlaceholder')}
        />
      </div>

      {/* Save button */}
      <div className="md:col-span-2">
        <Button
          variant="primary"
          startIcon={<Save size={14} />}
          onClick={handleSaveSchedule}
          disabled={savingSchedule}
        >
          {savingSchedule
            ? t('common.loading')
            : t('invoiceSchedule.requestChange')}
        </Button>
      </div>
    </div>
  );

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.settings'), href: '/settings' },
          { label: t('nav.settings.company') },
        ],
        title: t('nav.settings.company'),
        description: t('settings.companyDescription'),
        actions: (
          <div className="flex gap-2">
            {canWrite && !editing && (
              <Button
                variant="primary"
                startIcon={<Pencil size={14} />}
                onClick={() => setEditing(true)}
              >
                {t('common.edit')}
              </Button>
            )}
            {editing && (
              <>
                <Button variant="ghost" startIcon={<X size={14} />} onClick={handleCancel}>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" startIcon={<Save size={14} />} onClick={handleSave} disabled={saving}>
                  {saving ? '저장 중...' : t('common.save')}
                </Button>
              </>
            )}
          </div>
        ),
      }}
    >
      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`px-4 py-2.5 text-[13px] font-semibold transition ${
              activeTab === tab.key
                ? 'border-b-2 text-fg'
                : 'text-fg-muted hover:text-fg'
            }`}
            style={
              activeTab === tab.key ? { borderBottomColor: 'var(--brand)' } : undefined
            }
            onClick={() => setActiveTab(tab.key)}
          >
            {t(tab.labelKey) || tab.fallback}
          </button>
        ))}
      </div>

      <SectionCard
        title={t(TABS.find((tab) => tab.key === activeTab)?.labelKey ?? '') || (TABS.find((tab) => tab.key === activeTab)?.fallback ?? '')}
      >
        {activeTab === 'legal' && renderLegalTab()}
        {activeTab === 'contact' && renderContactTab()}
        {activeTab === 'einvoice' && renderEinvoiceTab()}
        {activeTab === 'invoiceSchedule' && renderInvoiceScheduleTab()}
      </SectionCard>

      {/* Bottom save bar when editing */}
      {editing && (
        <div
          className="mt-4 flex items-center justify-end gap-3 rounded-xl border px-5 py-3"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
        >
          <span className="text-[12px] text-fg-muted">변경 사항을 저장하시겠습니까?</span>
          <Button variant="ghost" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" startIcon={<Save size={14} />} onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : t('common.save')}
          </Button>
        </div>
      )}
    </DetailPageTemplate>
  );
}
