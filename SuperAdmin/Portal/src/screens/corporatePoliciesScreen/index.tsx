'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Input,
  NumberInput,
  DatePicker,
  Select,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_POLICIES_QUERY,
  CREATE_MEAL_POLICY_MUTATION,
  DELETE_MEAL_POLICY_MUTATION,
  type CorporatePoliciesData,
  type FullPolicyRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useCurrencyFormat } from '@shared/hooks/useCurrencyFormat';
import { formatDateTime } from '@shared/utils/format';

export function CorporatePoliciesScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const fmt = useCurrencyFormat('VND');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_POLICY_READ);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_POLICY_WRITE);

  const { data, loading, refetch } = useQuery<CorporatePoliciesData>(CORPORATE_POLICIES_QUERY, {
    variables: { id: corporateId },
    skip: !corporateId,
    errorPolicy: 'all',
  });
  const [create, { loading: creating }] = useMutation(CREATE_MEAL_POLICY_MUTATION, { onCompleted: () => refetch() });
  const [remove, { loading: deleting }] = useMutation(DELETE_MEAL_POLICY_MUTATION, { onCompleted: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [policyCode, setPolicyCode] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [dailyLimit, setDailyLimit] = useState<string>('100000');
  const [maxPerTxn, setMaxPerTxn] = useState<string>('50000');
  const [allowSplit, setAllowSplit] = useState<'true' | 'false'>('true');
  const [effectiveFrom, setEffectiveFrom] = useState<string | null>(new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState<string | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const depts = data?.mealDepartments.success?.data ?? [];
  const deptById = new Map(depts.map((d) => [d.id, d]));
  const policies: FullPolicyRow[] = data?.mealPoliciesByCorporate.success?.data ?? [];

  const cols: DataTableColumn<FullPolicyRow>[] = [
    { key: 'code', header: t('field.code'), width: '180px', render: (r) => <span className="font-mono text-[12px]">{r.policyCode}</span> },
    { key: 'name', header: t('field.name'), render: (r) => <span className="font-semibold text-fg">{r.policyName}</span> },
    { key: 'daily', header: t('field.dailyLimit'), width: '140px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.dailyLimitVnd)}</span> },
    { key: 'tx', header: t('field.maxPerTxn'), width: '140px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">{fmt.decimal(r.maxPerTransactionVnd)}</span> },
    {
      key: 'deps',
      header: t('field.department'),
      render: (r) => r.appliesToDepartmentIds.length === 0
        ? <Badge tone="neutral" variant="soft">{t('corporate.badgeAll')}</Badge>
        : <span className="flex flex-wrap gap-1">{r.appliesToDepartmentIds.slice(0, 3).map((id) => <Badge key={id} tone="info" variant="soft">{deptById.get(id)?.departmentCode ?? id.slice(0, 6)}</Badge>)}</span>,
    },
    { key: 'split', header: t('field.splitPayment'), width: '70px', align: 'center', render: (r) => r.allowSplitPayment ? <Badge tone="info" variant="soft">YES</Badge> : <span className="text-fg-subtle">—</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'from', header: t('field.effectiveFrom'), width: '140px', render: (r) => <span className="num text-[11px] text-fg-muted">{formatDateTime(r.effectiveFrom, localeTag)}</span> },
    {
      key: 'action',
      header: '',
      width: '60px',
      align: 'right',
      render: (r) => canWrite && (
        <button
          type="button"
          onClick={() => remove({ variables: { id: r.id } })}
          disabled={deleting}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-danger disabled:opacity-40"
          style={{ background: 'var(--danger-soft)' }}
          aria-label="delete"
        >
          <Trash2 size={12} />
        </button>
      ),
    },
  ];

  const toggleDept = (id: string) => {
    setSelectedDepts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!effectiveFrom) {
      setError(t('corporate.errorEffectiveFromRequired'));
      return;
    }
    const res = await create({
      variables: {
        input: {
          corporateId,
          policyCode,
          policyName,
          dailyLimitVnd: dailyLimit,
          maxPerTransactionVnd: maxPerTxn,
          allowSplitPayment: allowSplit === 'true',
          effectiveFrom: new Date(effectiveFrom).toISOString(),
          effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
          appliesToDepartmentIds: selectedDepts,
          appliesToRoleCodes: [],
        },
      },
    });
    const env = res.data?.mealPolicyCreate;
    if (env?.error) {
      setError(env.error.message);
      return;
    }
    setPolicyCode('');
    setPolicyName('');
    setSelectedDepts([]);
    setShowForm(false);
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${corporateId}` },
          { label: t('corporate.policies.summary.total') },
        ],
        title: c ? `${c.companyName} · ${t('corporate.policies.title')}` : t('common.loading'),
        description: t('corporate.policies.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-POL-001</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${corporateId}`)}>
              Back
            </Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowForm((v) => !v)}>
                {t('corporate.action.cta.createPolicy')}
              </Button>
            )}
          </>
        ),
      }}
      summaryItems={[
        { label: t('corporate.policies.summary.total'), value: policies.length, tone: 'brand' },
        { label: t('corporate.policies.summary.active'), value: policies.filter((p) => p.status === 'ACTIVE').length, tone: 'success' },
      ]}
    >
      {showForm && canWrite && (
        <div className="mb-3">
          <SectionCard title={t('corporate.policies.formTitle')}>
            <form onSubmit={submit} className="flex flex-col gap-3">
              {error && <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.policyCode')} *</label>
                  <Input value={policyCode} onChange={(e) => setPolicyCode(e.target.value)} placeholder="STANDARD_LUNCH" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.policyName')} *</label>
                  <Input value={policyName} onChange={(e) => setPolicyName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.dailyLimit')} *</label>
                  <NumberInput value={dailyLimit} locale={localeTag} min={0} onValueChange={({ value }) => setDailyLimit(String(value ?? 0))} style={{ width: '100%' }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.maxPerTxn')} *</label>
                  <NumberInput value={maxPerTxn} locale={localeTag} min={0} onValueChange={({ value }) => setMaxPerTxn(String(value ?? 0))} style={{ width: '100%' }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.splitPayment')}</label>
                  <Select
                    value={allowSplit}
                    onChange={(v) => setAllowSplit(v as 'true' | 'false')}
                    options={[
                      { value: 'true', label: t('corporate.policies.split.allow') },
                      { value: 'false', label: t('corporate.policies.split.companyOnly') },
                    ]}
                    minWidth="100%"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.effectiveFrom')} *</label>
                  <DatePicker value={effectiveFrom} onChange={setEffectiveFrom} locale={localeTag} minWidth="100%" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.effectiveTo')}</label>
                  <DatePicker value={effectiveTo} onChange={setEffectiveTo} locale={localeTag} minWidth="100%" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-fg-muted">{t('corporate.policies.targetDepartments')}</label>
                <div className="flex flex-wrap gap-2">
                  {depts.length === 0 && <span className="text-[12px] text-fg-subtle">No departments yet</span>}
                  {depts.map((d) => {
                    const on = selectedDepts.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDept(d.id)}
                        className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-semibold transition-colors"
                        style={{
                          background: on ? 'var(--primary-soft)' : 'var(--surface-2)',
                          color: on ? 'var(--primary)' : 'var(--fg-muted)',
                          boxShadow: on ? 'inset 0 0 0 1.5px var(--primary)' : 'none',
                        }}
                      >
                        {d.departmentCode} · {d.departmentName}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('action.cancel')}</Button>
                <Button type="submit" variant="primary" loading={creating}>{t('action.create')}</Button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}
      <SectionCard title={t('corporate.policies.cardTitle')} description={`${policies.length} policy(ies)`} padding="none">
        {loading && policies.length === 0 ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <DataTable columns={cols} rows={policies} rowKey={(r) => r.id} compact emptyState={t('corporate.policies.empty')} />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
