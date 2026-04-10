'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { DetailPageTemplate, SectionCard, Button, Input, NumberInput, Select, Badge, Skeleton } from '@platform/shared-ui';
import {
  CORPORATE_DETAIL_QUERY,
  UPDATE_MEAL_CORPORATE_MUTATION,
  DELETE_MEAL_CORPORATE_MUTATION,
  type CorporateDetailData,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';

const FUNDING_MODELS = ['PREPAID_DEPOSIT', 'POSTPAID_INVOICE', 'HYBRID'] as const;
const STATUSES = ['ACTIVE', 'SUSPENDED', 'TERMINATED'] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-fg-muted">{label}</label>
      {children}
    </div>
  );
}

export function CorporateEditScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_PROFILE_WRITE);

  const { data, loading } = useQuery<CorporateDetailData>(CORPORATE_DETAIL_QUERY, {
    variables: { id },
    skip: !id,
    errorPolicy: 'all',
  });

  const [updateCorp, { loading: saving }] = useMutation(UPDATE_MEAL_CORPORATE_MUTATION);
  const [deleteCorp, { loading: deleting }] = useMutation(DELETE_MEAL_CORPORATE_MUTATION);

  const c = data?.mealCorporate.success?.data;

  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [fundingModel, setFundingModel] = useState<(typeof FUNDING_MODELS)[number]>('PREPAID_DEPOSIT');
  const [creditLimitVnd, setCreditLimitVnd] = useState('0');
  const [monthlyBudgetVnd, setMonthlyBudgetVnd] = useState('0');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('ACTIVE');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (c) {
      setCompanyName(c.companyName);
      setTaxCode(c.taxCode ?? '');
      setFundingModel((c.fundingModel ?? 'PREPAID_DEPOSIT') as (typeof FUNDING_MODELS)[number]);
      setCreditLimitVnd(c.creditLimitVnd ?? '0');
      setMonthlyBudgetVnd(c.monthlyBudgetVnd ?? '0');
      setStatus((c.status ?? 'ACTIVE') as (typeof STATUSES)[number]);
    }
  }, [c]);

  if (!canWrite) return <LockedScreen />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await updateCorp({
      variables: {
        id,
        input: { companyName, taxCode, fundingModel, creditLimitVnd, monthlyBudgetVnd, status },
      },
    });
    const env = res.data?.mealCorporateUpdate;
    if (env?.error) {
      setError(env.error.message);
      return;
    }
    router.push(`/tenants/corporates/${id}`);
  };

  const handleDelete = async () => {
    const res = await deleteCorp({ variables: { id } });
    const env = res.data?.mealCorporateDelete;
    if (env?.error) {
      setError(env.error.message);
      return;
    }
    router.push('/tenants/corporates');
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${id}` },
          { label: t('corporate.edit.title') },
        ],
        title: c ? `${c.companyName}` : t('common.loading'),
        description: t('corporate.edit.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-004</code>,
        actions: (
          <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${id}`)}>
            {t('action.cancel')}
          </Button>
        ),
      }}
      summaryItems={c ? [
        { label: 'Tenant', value: <span className="font-mono text-sm">{c.tenantCode}</span> },
        { label: t('corporate.field.status'), value: <StatusBadge status={c.status} /> },
        { label: 'Deposit', value: <span className="num font-mono">{c.depositBalanceVnd ?? '—'}</span>, tone: 'success' },
      ] : undefined}
    >
      <SectionCard title={t('corporate.edit.cardTitle')} description={t('corporate.edit.cardDescription')}>
        {loading && !c ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md border border-danger bg-danger-soft p-3 text-[12.5px] text-danger">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('corporate.field.companyName')}>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Field>
              <Field label={t('corporate.field.taxCode')}>
                <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
              </Field>
              <Field label={t('corporate.field.fundingModel')}>
                <Select
                  value={fundingModel}
                  onChange={(v) => setFundingModel(v as (typeof FUNDING_MODELS)[number])}
                  options={FUNDING_MODELS.map((m) => ({ value: m, label: t(`corporate.fundingModel.${m}`) }))}
                  minWidth="100%"
                />
              </Field>
              <Field label={t('corporate.field.status')}>
                <Select
                  value={status}
                  onChange={(v) => setStatus(v as (typeof STATUSES)[number])}
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                  minWidth="100%"
                />
              </Field>
              <Field label={t('corporate.field.creditLimit')}>
                <NumberInput
                  value={creditLimitVnd}
                  locale={localeTag}
                  min={0}
                  onValueChange={({ value }) => setCreditLimitVnd(value !== null ? String(value) : '0')}
                  style={{ width: '100%' }}
                />
              </Field>
              <Field label={t('corporate.field.monthlyBudget')}>
                <NumberInput
                  value={monthlyBudgetVnd}
                  locale={localeTag}
                  min={0}
                  onValueChange={({ value }) => setMonthlyBudgetVnd(value !== null ? String(value) : '0')}
                  style={{ width: '100%' }}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                {!confirmDelete ? (
                  <Button type="button" variant="outline" startIcon={<Trash2 size={14} />} onClick={() => setConfirmDelete(true)}>
                    {t('corporate.action.cta.delete')}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge tone="danger" startDot>{t('corporate.edit.confirmDelete')}</Badge>
                    <Button type="button" variant="danger" loading={deleting} onClick={handleDelete}>
                      Yes, delete
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      {t('action.cancel')}
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => router.push(`/tenants/corporates/${id}`)}>
                  {t('action.cancel')}
                </Button>
                <Button type="submit" variant="primary" loading={saving} startIcon={<Save size={14} />}>
                  {t('action.save')}
                </Button>
              </div>
            </div>
          </form>
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
