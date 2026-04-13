'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { DetailPageTemplate, SectionCard, Button, Input, NumberInput, Select } from '@platform/shared-ui';
import { CREATE_MEAL_CORPORATE_MUTATION } from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

const FUNDING_MODELS = ['PREPAID_DEPOSIT', 'POSTPAID_INVOICE', 'HYBRID'] as const;

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

export function CorporateCreateScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const router = useRouter();
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_PROFILE_WRITE);
  const [createCorp, { loading }] = useMutation(CREATE_MEAL_CORPORATE_MUTATION);

  const [tenantCode, setTenantCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [fundingModel, setFundingModel] = useState<(typeof FUNDING_MODELS)[number]>('PREPAID_DEPOSIT');
  const [creditLimitVnd, setCreditLimitVnd] = useState('0');
  const [monthlyBudgetVnd, setMonthlyBudgetVnd] = useState('50000000');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!canWrite) return <LockedScreen />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await createCorp({
        variables: {
          input: {
            tenantCode,
            companyName,
            taxCode,
            fundingModel,
            creditLimitVnd,
            monthlyBudgetVnd,
            contactName: contactName || null,
            contactEmail: contactEmail || null,
            contactPhone: contactPhone || null,
          },
        },
      });
      const env = res.data?.mealCorporateCreate;
      if (env?.error) {
        setError(env.error.message);
        return;
      }
      const id = env?.success?.data?.id;
      if (id) router.push(`/tenants/corporates/${id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: t('corporate.create.title') },
        ],
        title: t('corporate.create.title'),
        description: t('corporate.create.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-003</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/tenants/corporates')}>
            {t('action.cancel')}
          </Button>
        ),
      }}
    >
      <SectionCard title={t('corporate.create.cardTitle')} description={t('corporate.create.cardDescription')}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('corporate.field.tenantCode')} required>
              <Input value={tenantCode} onChange={(e) => setTenantCode(e.target.value)} placeholder="CORP-VN-001" required />
            </Field>
            <Field label={t('corporate.field.companyName')} required>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Saigon Manufacturing JSC" required />
            </Field>
            <Field label={t('corporate.field.taxCode')} required>
              <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} placeholder="0312345678" required />
            </Field>
            <Field label={t('corporate.field.fundingModel')} required>
              <Select
                value={fundingModel}
                onChange={(v) => setFundingModel(v as (typeof FUNDING_MODELS)[number])}
                options={FUNDING_MODELS.map((m) => ({ value: m, label: t(`corporate.fundingModel.${m}`) }))}
                minWidth="100%"
              />
            </Field>
            <Field label={t('corporate.field.creditLimit')} required>
              <NumberInput
                value={creditLimitVnd}
                locale={localeTag}
                min={0}
                onValueChange={({ value }) => setCreditLimitVnd(value !== null ? String(value) : '')}
                style={{ width: '100%' }}
              />
            </Field>
            <Field label={t('corporate.field.monthlyBudget')} required>
              <NumberInput
                value={monthlyBudgetVnd}
                locale={localeTag}
                min={0}
                onValueChange={({ value }) => setMonthlyBudgetVnd(value !== null ? String(value) : '')}
                style={{ width: '100%' }}
              />
            </Field>
            <Field label={t('corporate.field.contactName')}>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </Field>
            <Field label={t('corporate.field.contactEmail')}>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </Field>
            <Field label={t('corporate.field.contactPhone')}>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+84 ..." />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.push('/tenants/corporates')}>
              {t('action.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={loading} startIcon={<Save size={14} />}>
              {t('action.create')}
            </Button>
          </div>
        </form>
      </SectionCard>
    </DetailPageTemplate>
  );
}
