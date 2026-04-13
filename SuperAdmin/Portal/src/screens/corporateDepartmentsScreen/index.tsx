'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Input,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_DEPARTMENTS_QUERY,
  CREATE_MEAL_DEPARTMENT_MUTATION,
  type CorporateDepartmentsData,
  type CorporateDepartmentRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

export function CorporateDepartmentsScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_DEPARTMENT_READ);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_DEPARTMENT_WRITE);

  const { data, loading, refetch } = useQuery<CorporateDepartmentsData>(CORPORATE_DEPARTMENTS_QUERY, {
    variables: { id: corporateId },
    skip: !corporateId,
    errorPolicy: 'all',
  });

  const [create, { loading: creating }] = useMutation(CREATE_MEAL_DEPARTMENT_MUTATION, {
    onCompleted: () => refetch(),
  });

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const depts: CorporateDepartmentRow[] = data?.mealDepartments.success?.data ?? [];

  const cols: DataTableColumn<CorporateDepartmentRow>[] = [
    { key: 'code', header: t('field.code'), width: '220px', render: (r) => <span className="font-mono text-[12px]">{r.departmentCode}</span> },
    { key: 'name', header: t('field.name'), render: (r) => <span className="font-semibold text-fg">{r.departmentName}</span> },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await create({
      variables: { input: { corporateId, departmentCode: code, departmentName: name, parentDepartmentId: null } },
    });
    const env = res.data?.mealDepartmentCreate;
    if (env?.error) {
      setError(env.error.message);
      return;
    }
    setCode('');
    setName('');
    setShowForm(false);
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${corporateId}` },
          { label: t('corporate.detail.subnav.departments') },
        ],
        title: c ? `${c.companyName} · ${t('corporate.detail.subnav.departments')}` : t('common.loading'),
        description: t('corporate.departments.cardTitle'),
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-005</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${corporateId}`)}>
              {t('action.cancel')}
            </Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowForm((v) => !v)}>
                {t('corporate.action.cta.createDepartment')}
              </Button>
            )}
          </>
        ),
      }}
      summaryItems={[
        { label: t('corporate.departments.cardTitle'), value: depts.length, tone: 'brand' },
      ]}
    >
      {showForm && canWrite && (
        <div className="mb-3">
          <SectionCard title={t('corporate.departments.formTitle')}>
            <form onSubmit={submit} className="flex flex-col gap-3">
              {error && (
                <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.departmentCode')} *</label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="RND" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.departmentName')} *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="R&D" required />
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
      <SectionCard title={t('corporate.departments.cardTitle')} description={`${depts.length}`} padding="none">
        {loading && depts.length === 0 ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <DataTable columns={cols} rows={depts} rowKey={(r) => r.id} compact emptyState={t('corporate.departments.empty')} />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
