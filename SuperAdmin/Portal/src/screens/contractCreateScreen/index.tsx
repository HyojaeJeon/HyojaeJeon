'use client';

import { useState, useMemo, useCallback, useReducer } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  DetailPageTemplate,
  SectionCard,
  Button,
  Input,
  NumberInput,
  Select,
  DatePicker,
  Tabs,
  AsyncSearchSelect,
  type SelectOption,
  type AsyncSearchSelectPage,
} from '@platform/shared-ui';
import {
  CONTRACT_CREATE_MUTATION,
  CONTRACT_TEMPLATES_QUERY,
  type ContractTemplatesData,
  type CreateContractInput,
  type ContractType,
} from '@graphql/queries/contract';
import { BRAND_LIST_QUERY, type BrandListData } from '@graphql/queries/brand';
import { DISTRIBUTOR_LIST_QUERY } from '@graphql/queries/distributor';
import { CORPORATE_LIST_QUERY, type CorporateListData } from '@graphql/queries/corporate';
import { HtmlEditor } from '@shared/ui/HtmlEditor';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

/* ─────────────────────── Helpers ─────────────────────── */

const CONTRACT_TYPES: ContractType[] = ['MERCHANT', 'DISTRIBUTOR', 'CORPORATE'];
const PARTY_B_TYPES = ['BRAND_HQ', 'DISTRIBUTOR', 'CORPORATE'] as const;

type LocaleTab = 'vi' | 'ko' | 'en';
const LOCALE_TABS: { key: LocaleTab; label: string }[] = [
  { key: 'vi', label: 'Tiếng Việt' },
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-fg-muted">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─────────────────────── Party B entity search helpers ─────────────────────── */

interface DistributorListData {
  distributors: {
    success: { data: { id: string; distributorCode: string; companyName: string; status: string }[] } | null;
    error: { code: string; message: string } | null;
  };
}

function usePartyBSearch(partyBType: string) {
  const client = useApolloClient();

  return useCallback(
    async (query: string, offset: number): Promise<AsyncSearchSelectPage> => {
      const q = query.toLowerCase();
      const PAGE = 10;

      if (partyBType === 'BRAND_HQ') {
        const { data } = await client.query<BrandListData>({
          query: BRAND_LIST_QUERY,
          variables: { skip: 0, take: 200 },
          fetchPolicy: 'cache-first',
        });
        const rows = (data?.brands?.success?.data ?? []).filter(
          (r) => !q || r.brandName.toLowerCase().includes(q) || r.brandCode.toLowerCase().includes(q),
        );
        const slice = rows.slice(offset, offset + PAGE);
        return { items: slice.map((r) => ({ value: r.id, label: r.brandName, description: `${r.brandCode} · ${r.status}` })), hasMore: offset + PAGE < rows.length };
      }

      if (partyBType === 'DISTRIBUTOR') {
        const { data } = await client.query<DistributorListData>({
          query: DISTRIBUTOR_LIST_QUERY,
          variables: { skip: 0, take: 200 },
          fetchPolicy: 'cache-first',
        });
        const rows = (data?.distributors?.success?.data ?? []).filter(
          (r) => !q || r.companyName.toLowerCase().includes(q) || r.distributorCode.toLowerCase().includes(q),
        );
        const slice = rows.slice(offset, offset + PAGE);
        return { items: slice.map((r) => ({ value: r.id, label: r.companyName, description: `${r.distributorCode} · ${r.status}` })), hasMore: offset + PAGE < rows.length };
      }

      if (partyBType === 'CORPORATE') {
        const { data } = await client.query<CorporateListData>({
          query: CORPORATE_LIST_QUERY,
          variables: { skip: 0, take: 200 },
          fetchPolicy: 'cache-first',
        });
        const rows = (data?.mealCorporates?.success?.data ?? []).filter(
          (r) => !q || r.companyName.toLowerCase().includes(q) || r.tenantCode.toLowerCase().includes(q),
        );
        const slice = rows.slice(offset, offset + PAGE);
        return { items: slice.map((r) => ({ value: r.id, label: r.companyName, description: `${r.tenantCode}${r.taxCode ? ` · ${r.taxCode}` : ''} · ${r.status}` })), hasMore: offset + PAGE < rows.length };
      }

      return { items: [], hasMore: false };
    },
    [client, partyBType],
  );
}

/* ─────────────────────── Screen ─────────────────────── */

export function ContractCreateScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canCreate = useHasPermission(PERMISSIONS.CONTRACT_CREATE);
  const [createContract, { loading }] = useMutation(CONTRACT_CREATE_MUTATION);

  /* --- form state --- */
  const [contractType, setContractType] = useState<string>('CORPORATE');
  const [partyBType, setPartyBType] = useState<string>('CORPORATE');
  const [partyBId, setPartyBId] = useState('');
  const [partyBLabel, setPartyBLabel] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [titleKo, setTitleKo] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  /* --- body (3-locale HTML) --- */
  const [bodyLocale, setBodyLocale] = useState<LocaleTab>('vi');
  const [bodyVi, setBodyVi] = useState({ html: '', text: '' });
  const [bodyKo, setBodyKo] = useState({ html: '', text: '' });
  const [bodyEn, setBodyEn] = useState({ html: '', text: '' });

  /* --- terms (structured form → serialized to JSON) --- */
  interface TermsState {
    baseRatePct: string;
    specialZoneRatePct: string;
    franchiseFlatRatePct: string;
    settlementCycle: string;
    settlementDay: string;
    fundingModel: string;
    serviceFeeType: string;
    serviceFeeAmount: string;
    creditLimitVnd: string;
    creditPaymentTerms: string;
    overdueInterestRate: string;
    minDepositVnd: string;
    contractDurationMonths: string;
    autoRenew: boolean;
    earlyTerminationPenaltyPct: string;
    exclusiveTerritory: string;
    recruitmentTarget: string;
    managementFeePct: string;
    recruitmentFeeVnd: string;
  }
  const [terms, setTerms] = useReducer(
    (prev: TermsState, next: Partial<TermsState>) => ({ ...prev, ...next }),
    {
      baseRatePct: '', specialZoneRatePct: '', franchiseFlatRatePct: '',
      settlementCycle: 'MONTHLY', settlementDay: '10',
      fundingModel: 'PREPAID_DEPOSIT', serviceFeeType: 'FIXED', serviceFeeAmount: '',
      creditLimitVnd: '', creditPaymentTerms: 'NET15', overdueInterestRate: '0.05',
      minDepositVnd: '', contractDurationMonths: '12', autoRenew: true,
      earlyTerminationPenaltyPct: '50', exclusiveTerritory: '', recruitmentTarget: '',
      managementFeePct: '', recruitmentFeeVnd: '',
    },
  );

  /* --- templates --- */
  const { data: templatesData } = useQuery<ContractTemplatesData>(CONTRACT_TEMPLATES_QUERY, {
    variables: { contractType },
  });

  /* --- party B search --- */
  const searchPartyB = usePartyBSearch(partyBType);

  const contractTypeOptions: SelectOption[] = CONTRACT_TYPES.map((v) => ({
    value: v,
    label: t(`contract.type.${v}`),
  }));

  const partyBTypeOptions: SelectOption[] = PARTY_B_TYPES.map((v) => ({
    value: v,
    label: t(`contract.partyBType.${v}`),
  }));

  const templateOptions: SelectOption[] = useMemo(() => {
    const templates = templatesData?.contractTemplates.success?.data ?? [];
    return [
      { value: '', label: t('contract.create.noTemplate') },
      ...templates.filter((tpl) => tpl.isActive).map((tpl) => ({
        value: tpl.id,
        label: `${tpl.templateCode} — ${tpl.title}`,
      })),
    ];
  }, [templatesData, t]);

  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    if (!id) return;
    const tpl = templatesData?.contractTemplates.success?.data?.find((t) => t.id === id);
    if (!tpl) return;
    if (!title && tpl.title) setTitle(tpl.title);
    if (!titleKo && tpl.titleKo) setTitleKo(tpl.titleKo);
    if (!titleEn && tpl.titleEn) setTitleEn(tpl.titleEn);
  };

  const currentBody = bodyLocale === 'vi' ? bodyVi : bodyLocale === 'ko' ? bodyKo : bodyEn;
  const setCurrentBody = bodyLocale === 'vi' ? setBodyVi : bodyLocale === 'ko' ? setBodyKo : setBodyEn;

  const localeTag = 'ko-KR';

  const buildTermsJson = (): Record<string, unknown> => {
    const out: Record<string, unknown> = {};

    // Common
    out.contractDurationMonths = terms.contractDurationMonths ? Number(terms.contractDurationMonths) : 12;
    out.autoRenew = terms.autoRenew;
    if (terms.earlyTerminationPenaltyPct) out.earlyTerminationPenaltyPct = Number(terms.earlyTerminationPenaltyPct);

    if (contractType === 'MERCHANT') {
      if (terms.baseRatePct) out.commissionRate = { baseRatePct: Number(terms.baseRatePct), specialZoneRatePct: terms.specialZoneRatePct ? Number(terms.specialZoneRatePct) : null, franchiseFlatRatePct: terms.franchiseFlatRatePct ? Number(terms.franchiseFlatRatePct) : null };
      out.settlementCycle = terms.settlementCycle;
      if (terms.settlementDay) out.settlementDay = Number(terms.settlementDay);
    } else if (contractType === 'DISTRIBUTOR') {
      if (terms.exclusiveTerritory) out.exclusiveTerritory = terms.exclusiveTerritory;
      if (terms.recruitmentFeeVnd) out.recruitmentFeeVnd = Number(terms.recruitmentFeeVnd);
      if (terms.managementFeePct) out.managementFeePct = Number(terms.managementFeePct);
      if (terms.recruitmentTarget) out.quarterlyRecruitmentTarget = Number(terms.recruitmentTarget);
    } else if (contractType === 'CORPORATE') {
      out.fundingModel = terms.fundingModel;
      out.serviceFee = { type: terms.serviceFeeType, amount: terms.serviceFeeAmount ? Number(terms.serviceFeeAmount) : 0 };
      if (terms.fundingModel === 'PREPAID_DEPOSIT' && terms.minDepositVnd) out.minDepositVnd = Number(terms.minDepositVnd);
      if (terms.fundingModel.startsWith('CREDIT')) {
        if (terms.creditLimitVnd) out.creditLimitVnd = Number(terms.creditLimitVnd);
        out.creditPaymentTerms = terms.creditPaymentTerms;
        if (terms.overdueInterestRate) out.overdueInterestDailyPct = Number(terms.overdueInterestRate);
      }
    }

    return out;
  };

  const canSubmit =
    contractType.trim().length > 0 &&
    partyBType.trim().length > 0 &&
    partyBId.trim().length > 0 &&
    title.trim().length > 0 &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const termsJson = buildTermsJson();

    const bodyJson: Record<string, { html: string; text: string }> = {};
    if (bodyVi.html) bodyJson.vi = bodyVi;
    if (bodyKo.html) bodyJson.ko = bodyKo;
    if (bodyEn.html) bodyJson.en = bodyEn;

    const input: CreateContractInput & { bodyJson?: unknown } = {
      contractType,
      partyBType,
      partyBId: partyBId.trim(),
      templateId: templateId || null,
      title: title.trim(),
      titleKo: titleKo.trim() || null,
      titleEn: titleEn.trim() || null,
      effectiveFrom: effectiveFrom || null,
      effectiveTo: effectiveTo || null,
      termsJson: Object.keys(termsJson).length > 0 ? termsJson : undefined,
    };

    try {
      const res = await createContract({ variables: { input } });
      const result = res.data?.contractCreate;
      if (result?.success?.data) {
        const newId = result.success.data.id;
        toast.success(t('contract.toast.created'));
        if (bodyVi.html || bodyKo.html || bodyEn.html) {
          router.push(`/governance/contracts/${newId}/edit`);
        } else {
          router.push(`/governance/contracts/${newId}`);
        }
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!canCreate) return <LockedScreen />;

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.governance') },
          { label: t('nav.governance.contracts'), href: '/governance/contracts' },
          { label: t('contract.create.title') },
        ],
        title: t('contract.create.title'),
        description: t('contract.create.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CTR-NEW</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/governance/contracts')}>
            {t('action.cancel')}
          </Button>
        ),
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
            {error}
          </div>
        )}

        {/* ── Section 1: 기본 정보 ── */}
        <SectionCard title={t('contract.create.basicInfo')} description={t('contract.create.basicInfoDesc')}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('contract.col.contractType')} required>
                <Select
                  value={contractType}
                  onChange={(v) => {
                    setContractType(v);
                    setPartyBId('');
                    setPartyBLabel('');
                    if (v === 'MERCHANT') setPartyBType('BRAND_HQ');
                    else if (v === 'DISTRIBUTOR') setPartyBType('DISTRIBUTOR');
                    else setPartyBType('CORPORATE');
                  }}
                  options={contractTypeOptions}
                  minWidth="100%"
                />
              </Field>
              <Field label={t('contract.col.partyBType')} required>
                <Select
                  value={partyBType}
                  onChange={(v) => {
                    setPartyBType(v);
                    setPartyBId('');
                    setPartyBLabel('');
                  }}
                  options={partyBTypeOptions}
                  minWidth="100%"
                />
              </Field>
            </div>

            <Field label={t('contract.create.partyB')} required>
              <AsyncSearchSelect
                key={partyBType}
                value={partyBId || null}
                onChange={(val, opt) => {
                  setPartyBId(val);
                  setPartyBLabel(opt.label);
                }}
                onSearch={searchPartyB}
                debounceMs={500}
                placeholder={t('contract.create.partyBPlaceholder')}
                emptyLabel={partyBLabel || undefined}
                searchPlaceholder={t('contract.create.partyBSearchPlaceholder')}
                noResultsLabel={t('contract.create.partyBNoResults')}
                loadingLabel={t('common.loading')}
                minWidth="100%"
              />
            </Field>

            <Field label={t('contract.create.template')}>
              <Select value={templateId} onChange={handleTemplateSelect} options={templateOptions} minWidth="100%" />
            </Field>
          </div>
        </SectionCard>

        {/* ── Section 2: 다국어 제목 ── */}
        <SectionCard title={t('contract.create.titles')} description={t('contract.create.titlesDesc')}>
          <div className="flex flex-col gap-4">
            <Field label={t('contract.create.titleVi')} required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('contract.create.titleViPlaceholder')} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('contract.create.titleKo')}>
                <Input value={titleKo} onChange={(e) => setTitleKo(e.target.value)} placeholder={t('contract.create.titleKoPlaceholder')} />
              </Field>
              <Field label={t('contract.create.titleEn')}>
                <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder={t('contract.create.titleEnPlaceholder')} />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 3: 유효 기간 ── */}
        <SectionCard title={t('contract.create.period')} description={t('contract.create.periodDesc')}>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('field.effectiveFrom')}>
              <DatePicker value={effectiveFrom || null} onChange={(v) => setEffectiveFrom(v ?? '')} minWidth="100%" />
            </Field>
            <Field label={t('field.effectiveTo')}>
              <DatePicker
                value={effectiveTo || null}
                onChange={(v) => setEffectiveTo(v ?? '')}
                minDate={effectiveFrom || undefined}
                minWidth="100%"
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Section 4: 계약서 본문 (3개 언어 HTML 에디터) ── */}
        <SectionCard title={t('contract.create.body')} description={t('contract.create.bodyDesc')}>
          <div className="flex flex-col gap-3">
            <Tabs
              variant="underline"
              items={LOCALE_TABS}
              value={bodyLocale}
              onChange={(k) => setBodyLocale(k as LocaleTab)}
            />
            <HtmlEditor
              key={bodyLocale}
              value={currentBody.html}
              onChange={(html, text) => setCurrentBody({ html, text })}
              placeholder={t('contract.create.bodyPlaceholder')}
              minHeight={350}
            />
          </div>
        </SectionCard>

        {/* ── Section 5: 계약 조건 (구조화 폼) ── */}
        <SectionCard title={t('contract.create.terms')} description={t('contract.create.termsDesc')}>
          <div className="flex flex-col gap-5">
            {/* ── Common terms ── */}
            <div className="grid grid-cols-3 gap-4">
              <Field label={t('contract.terms.duration')}>
                <Select
                  value={terms.contractDurationMonths}
                  onChange={(v) => setTerms({ contractDurationMonths: v })}
                  options={[
                    { value: '6', label: '6' + t('contract.terms.months') },
                    { value: '12', label: '12' + t('contract.terms.months') },
                    { value: '24', label: '24' + t('contract.terms.months') },
                    { value: '36', label: '36' + t('contract.terms.months') },
                  ]}
                  minWidth="100%"
                />
              </Field>
              <Field label={t('contract.terms.autoRenew')}>
                <Select
                  value={terms.autoRenew ? 'true' : 'false'}
                  onChange={(v) => setTerms({ autoRenew: v === 'true' })}
                  options={[
                    { value: 'true', label: t('common.yes') },
                    { value: 'false', label: t('common.no') },
                  ]}
                  minWidth="100%"
                />
              </Field>
              <Field label={t('contract.terms.earlyTermPenalty')}>
                <NumberInput
                  value={terms.earlyTerminationPenaltyPct}
                  onValueChange={({ raw }) => setTerms({ earlyTerminationPenaltyPct: raw })}
                  locale={localeTag}
                  allowDecimal
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="50"
                />
              </Field>
            </div>

            {/* ── Merchant-specific ── */}
            {contractType === 'MERCHANT' && (
              <>
                <div className="border-t pt-4 text-[12px] font-semibold text-fg-muted" style={{ borderColor: 'var(--border)' }}>
                  {t('contract.terms.commissionSection')}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field label={t('contract.terms.baseRate')} required>
                    <NumberInput
                      value={terms.baseRatePct}
                      onValueChange={({ raw }) => setTerms({ baseRatePct: raw })}
                      locale={localeTag}
                      allowDecimal
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="5.0"
                    />
                  </Field>
                  <Field label={t('contract.terms.specialZoneRate')}>
                    <NumberInput
                      value={terms.specialZoneRatePct}
                      onValueChange={({ raw }) => setTerms({ specialZoneRatePct: raw })}
                      locale={localeTag}
                      allowDecimal
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </Field>
                  <Field label={t('contract.terms.franchiseFlatRate')}>
                    <NumberInput
                      value={terms.franchiseFlatRatePct}
                      onValueChange={({ raw }) => setTerms({ franchiseFlatRatePct: raw })}
                      locale={localeTag}
                      allowDecimal
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('contract.terms.settlementCycle')}>
                    <Select
                      value={terms.settlementCycle}
                      onChange={(v) => setTerms({ settlementCycle: v })}
                      options={[
                        { value: 'MONTHLY', label: t('contract.terms.monthly') },
                        { value: 'BIWEEKLY', label: t('contract.terms.biweekly') },
                        { value: 'WEEKLY', label: t('contract.terms.weekly') },
                      ]}
                      minWidth="100%"
                    />
                  </Field>
                  <Field label={t('contract.terms.settlementDay')}>
                    <NumberInput
                      value={terms.settlementDay}
                      onValueChange={({ raw }) => setTerms({ settlementDay: raw })}
                      locale={localeTag}
                      min={1}
                      max={28}
                      style={{ width: '100%' }}
                      placeholder="10"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* ── Distributor-specific ── */}
            {contractType === 'DISTRIBUTOR' && (
              <>
                <div className="border-t pt-4 text-[12px] font-semibold text-fg-muted" style={{ borderColor: 'var(--border)' }}>
                  {t('contract.terms.distributorSection')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('contract.terms.territory')}>
                    <Input value={terms.exclusiveTerritory} onChange={(e) => setTerms({ exclusiveTerritory: e.target.value })} placeholder={t('contract.terms.territoryPlaceholder')} />
                  </Field>
                  <Field label={t('contract.terms.recruitmentTarget')}>
                    <NumberInput
                      value={terms.recruitmentTarget}
                      onValueChange={({ raw }) => setTerms({ recruitmentTarget: raw })}
                      locale={localeTag}
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="10"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('contract.terms.recruitmentFee')}>
                    <NumberInput
                      value={terms.recruitmentFeeVnd}
                      onValueChange={({ raw }) => setTerms({ recruitmentFeeVnd: raw })}
                      locale={localeTag}
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="5,000,000"
                    />
                  </Field>
                  <Field label={t('contract.terms.managementFee')}>
                    <NumberInput
                      value={terms.managementFeePct}
                      onValueChange={({ raw }) => setTerms({ managementFeePct: raw })}
                      locale={localeTag}
                      allowDecimal
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="2.0"
                    />
                  </Field>
                </div>
              </>
            )}

            {/* ── Corporate-specific ── */}
            {contractType === 'CORPORATE' && (
              <>
                <div className="border-t pt-4 text-[12px] font-semibold text-fg-muted" style={{ borderColor: 'var(--border)' }}>
                  {t('contract.terms.corporateSection')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('contract.terms.fundingModel')} required>
                    <Select
                      value={terms.fundingModel}
                      onChange={(v) => setTerms({ fundingModel: v })}
                      options={[
                        { value: 'PREPAID_DEPOSIT', label: t('contract.terms.prepaidDeposit') },
                        { value: 'CREDIT_NET15', label: t('contract.terms.creditNet15') },
                        { value: 'CREDIT_NET30', label: t('contract.terms.creditNet30') },
                      ]}
                      minWidth="100%"
                    />
                  </Field>
                  <Field label={t('contract.terms.serviceFeeType')}>
                    <Select
                      value={terms.serviceFeeType}
                      onChange={(v) => setTerms({ serviceFeeType: v })}
                      options={[
                        { value: 'FIXED', label: t('contract.terms.fixedMonthly') },
                        { value: 'PERCENTAGE', label: t('contract.terms.transactionPct') },
                      ]}
                      minWidth="100%"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={terms.serviceFeeType === 'FIXED' ? t('contract.terms.monthlyFeeVnd') : t('contract.terms.transactionFeePct')}>
                    <NumberInput
                      value={terms.serviceFeeAmount}
                      onValueChange={({ raw }) => setTerms({ serviceFeeAmount: raw })}
                      locale={localeTag}
                      allowDecimal={terms.serviceFeeType === 'PERCENTAGE'}
                      min={0}
                      style={{ width: '100%' }}
                      placeholder={terms.serviceFeeType === 'FIXED' ? '1,000,000' : '2.5'}
                    />
                  </Field>
                  {terms.fundingModel === 'PREPAID_DEPOSIT' && (
                    <Field label={t('contract.terms.minDeposit')}>
                      <NumberInput
                        value={terms.minDepositVnd}
                        onValueChange={({ raw }) => setTerms({ minDepositVnd: raw })}
                        locale={localeTag}
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="10,000,000"
                      />
                    </Field>
                  )}
                  {terms.fundingModel.startsWith('CREDIT') && (
                    <Field label={t('contract.terms.creditLimit')}>
                      <NumberInput
                        value={terms.creditLimitVnd}
                        onValueChange={({ raw }) => setTerms({ creditLimitVnd: raw })}
                        locale={localeTag}
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="100,000,000"
                      />
                    </Field>
                  )}
                </div>
                {terms.fundingModel.startsWith('CREDIT') && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('contract.terms.paymentTerms')}>
                      <Select
                        value={terms.creditPaymentTerms}
                        onChange={(v) => setTerms({ creditPaymentTerms: v })}
                        options={[
                          { value: 'NET15', label: 'NET 15' },
                          { value: 'NET30', label: 'NET 30' },
                          { value: 'NET45', label: 'NET 45' },
                          { value: 'NET60', label: 'NET 60' },
                        ]}
                        minWidth="100%"
                      />
                    </Field>
                    <Field label={t('contract.terms.overdueInterest')}>
                      <NumberInput
                        value={terms.overdueInterestRate}
                        onValueChange={({ raw }) => setTerms({ overdueInterestRate: raw })}
                        locale={localeTag}
                        allowDecimal
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="0.05"
                      />
                    </Field>
                  </div>
                )}
              </>
            )}
          </div>
        </SectionCard>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pb-8">
          <Button type="button" variant="ghost" onClick={() => router.push('/governance/contracts')}>
            {t('action.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!canSubmit} startIcon={<Save size={14} />}>
            {t('contract.action.create')}
          </Button>
        </div>
      </form>
    </DetailPageTemplate>
  );
}
