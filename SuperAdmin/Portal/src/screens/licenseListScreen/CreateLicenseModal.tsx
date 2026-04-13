'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { Modal, Button, Input, Select, DatePicker, type SelectOption } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { CREATE_LICENSE_MUTATION, type CreateLicenseInput } from '@graphql/queries/governance';
import {
  TENANT_USER_SCREEN_BOOTSTRAP_QUERY,
  type TenantUserScreenBootstrapData,
} from '@graphql/queries/governance';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const SCOPE_TYPES = ['GLOBAL', 'REGIONAL_DISTRIBUTOR', 'BRAND_HQ', 'BRANCH', 'EDGE_POS'] as const;
const LICENSE_TYPES = ['SUBSCRIPTION', 'PERPETUAL', 'TRIAL'] as const;
const COUNTRY_CODES = ['VN', 'KR', 'JP', 'US'] as const;

const QUICK_DURATIONS = [
  { key: '1y', years: 1 },
  { key: '2y', years: 2 },
  { key: '3y', years: 3 },
  { key: '5y', years: 5 },
] as const;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function CreateLicenseModal({ open, onClose, onCreated }: Props) {
  const { t } = useI18n();
  const [createLicense, { loading: creating }] = useMutation(CREATE_LICENSE_MUTATION);

  const { data: bootstrapData } = useQuery<TenantUserScreenBootstrapData>(
    TENANT_USER_SCREEN_BOOTSTRAP_QUERY,
    { skip: !open },
  );

  const [scopeType, setScopeType] = useState<string>('GLOBAL');
  const [scopeId, setScopeId] = useState('');
  const [licenseType, setLicenseType] = useState<string>('SUBSCRIPTION');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [maxBranchCount, setMaxBranchCount] = useState('0');
  const [maxTerminalCount, setMaxTerminalCount] = useState('0');
  const [allowedCountryCode, setAllowedCountryCode] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [licensePayloadJson, setLicensePayloadJson] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const scopeOptions: SelectOption[] = SCOPE_TYPES.map((v) => ({
    value: v,
    label: t(`license.scopeType.${v}`),
  }));

  const typeOptions: SelectOption[] = LICENSE_TYPES.map((v) => ({
    value: v,
    label: t(`license.licenseType.${v}`),
  }));

  const countryOptions: SelectOption[] = [
    { value: '', label: t('field.selectNone') },
    ...COUNTRY_CODES.map((v) => ({ value: v, label: t(`license.country.${v}`) })),
  ];

  const scopeEntityOptions: SelectOption[] = useMemo(() => {
    if (scopeType === 'GLOBAL') return [];
    if (scopeType === 'REGIONAL_DISTRIBUTOR') {
      return (bootstrapData?.distributors.success?.data ?? []).map((d) => ({
        value: d.id,
        label: `${d.companyName} (${d.distributorCode})`,
      }));
    }
    if (scopeType === 'BRAND_HQ') {
      return (bootstrapData?.brands.success?.data ?? []).map((b) => ({
        value: b.id,
        label: `${b.brandName} (${b.brandCode})`,
      }));
    }
    return [];
  }, [scopeType, bootstrapData]);

  const needsScopeEntity = scopeType !== 'GLOBAL';
  const canSubmit =
    (!needsScopeEntity || scopeId.trim().length > 0) &&
    licenseType.trim().length > 0 &&
    effectiveFrom.length > 0 &&
    !creating;

  const resetForm = () => {
    setScopeType('GLOBAL');
    setScopeId('');
    setLicenseType('SUBSCRIPTION');
    setEffectiveFrom('');
    setEffectiveTo('');
    setMaxBranchCount('0');
    setMaxTerminalCount('0');
    setAllowedCountryCode('');
    setShowAdvanced(false);
    setLicensePayloadJson('');
    setErr(null);
  };

  const handleScopeTypeChange = (v: string) => {
    setScopeType(v);
    setScopeId('');
  };

  const handleEffectiveFromChange = (v: string | null) => {
    const next = v ?? '';
    setEffectiveFrom(next);
    if (effectiveTo && next && effectiveTo < next) {
      setEffectiveTo('');
    }
  };

  const handleQuickDuration = (years: number) => {
    const now = new Date();
    const from = toISODate(now);
    const to = new Date(now);
    to.setFullYear(to.getFullYear() + years);
    setEffectiveFrom(from);
    setEffectiveTo(toISODate(to));
  };

  const handleSubmit = async () => {
    setErr(null);
    let parsedPayload: unknown = null;
    if (licensePayloadJson.trim()) {
      try {
        parsedPayload = JSON.parse(licensePayloadJson);
      } catch {
        setErr('Invalid JSON in payload');
        return;
      }
    }

    const input: CreateLicenseInput = {
      scopeType,
      scopeId: needsScopeEntity ? scopeId.trim() : scopeType,
      licenseType,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      maxBranchCount: Number(maxBranchCount) || 0,
      maxTerminalCount: Number(maxTerminalCount) || 0,
      allowedCountryCode: allowedCountryCode || null,
      licensePayloadJson: parsedPayload,
    };

    try {
      const res = await createLicense({ variables: { input } });
      const result = res.data?.createLicense;
      if (result?.success?.data) {
        toast.success(t('license.toast.created'));
        resetForm();
        onCreated();
        onClose();
      } else {
        toast.error(result?.error?.message ?? t('common.error'));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('license.action.create')}
      width={600}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={creating}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={t('license.form.scope')}>
          <Select value={scopeType} onChange={handleScopeTypeChange} options={scopeOptions} />
        </Field>

        {needsScopeEntity && (
          <Field label={t('license.form.scopeEntity')}>
            {scopeEntityOptions.length > 0 ? (
              <Select
                value={scopeId}
                onChange={setScopeId}
                options={[{ value: '', label: t('field.selectPlaceholder') }, ...scopeEntityOptions]}
              />
            ) : (
              <Input
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
                placeholder="ID"
              />
            )}
          </Field>
        )}

        <Field label={t('license.form.type')}>
          <Select value={licenseType} onChange={setLicenseType} options={typeOptions} />
        </Field>

        <Field label={t('license.form.country')}>
          <Select value={allowedCountryCode} onChange={setAllowedCountryCode} options={countryOptions} />
        </Field>

        {/* 시작일 · 종료일 나란히 배치 */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('license.form.effectiveFrom')}>
            <DatePicker
              value={effectiveFrom || null}
              onChange={handleEffectiveFromChange}
              minWidth="100%"
            />
          </Field>
          <Field label={t('license.form.effectiveTo')}>
            <DatePicker
              value={effectiveTo || null}
              onChange={(v) => setEffectiveTo(v ?? '')}
              minDate={effectiveFrom || undefined}
              minWidth="100%"
            />
          </Field>
        </div>

        {/* 빠른 기간 선택 */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-fg-muted">{t('license.quickDuration.label')}:</span>
          {QUICK_DURATIONS.map((d) => (
            <button
              key={d.key}
              type="button"
              className="rounded-md border px-2.5 py-1 text-[11px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => handleQuickDuration(d.years)}
            >
              {t(`license.quickDuration.${d.key}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('license.form.maxBranch')}>
            <Input type="number" value={maxBranchCount} onChange={(e) => setMaxBranchCount(e.target.value)} />
          </Field>
          <Field label={t('license.form.maxTerminal')}>
            <Input type="number" value={maxTerminalCount} onChange={(e) => setMaxTerminalCount(e.target.value)} />
          </Field>
        </div>

        <button
          type="button"
          className="text-left text-[11.5px] text-fg-muted underline"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {t('license.form.payload')} {showAdvanced ? '▲' : '▼'}
        </button>
        {showAdvanced && (
          <textarea
            className="w-full rounded-md border bg-surface-1 p-2 font-mono text-[12px] text-fg"
            style={{ borderColor: 'var(--border)', minHeight: 80 }}
            value={licensePayloadJson}
            onChange={(e) => setLicensePayloadJson(e.target.value)}
            placeholder="{}"
          />
        )}

        {err && <div className="text-[12px] text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}

/** label 과 children 을 감싸는 필드. <div> 사용 — <label> 로 감싸면 내부 Select 버튼에 click 이 전파되어 드롭다운 깜빡임이 발생한다. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-fg-muted">{label}</span>
      {children}
    </div>
  );
}
