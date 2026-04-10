'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Button,
  Input,
  Select,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  CORPORATE_EMPLOYEES_QUERY,
  CREATE_MEAL_EMPLOYEE_MUTATION,
  type CorporateEmployeesData,
  type EmployeeFullRow,
} from '@graphql/queries/corporate';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { StatusBadge } from '@shared/ui/StatusBadge';

export function CorporateEmployeesScreen() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const corporateId = params?.id;
  const canRead = useHasPermission(PERMISSIONS.CORPORATE_EMPLOYEE_READ);
  const canWrite = useHasPermission(PERMISSIONS.CORPORATE_EMPLOYEE_WRITE);

  const { data, loading, refetch } = useQuery<CorporateEmployeesData>(CORPORATE_EMPLOYEES_QUERY, {
    variables: { id: corporateId, skip: 0, take: 100 },
    skip: !corporateId,
    errorPolicy: 'all',
  });
  const [create, { loading: creating }] = useMutation(CREATE_MEAL_EMPLOYEE_MUTATION, {
    onCompleted: () => refetch(),
  });

  const [showForm, setShowForm] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [badgeRfid, setBadgeRfid] = useState('');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const c = data?.mealCorporate.success?.data;
  const depts = data?.mealDepartments.success?.data ?? [];
  const deptById = new Map(depts.map((d) => [d.id, d]));
  const employees: EmployeeFullRow[] = data?.mealEmployees.success?.data ?? [];

  const cols: DataTableColumn<EmployeeFullRow>[] = [
    { key: 'code', header: t('field.employeeCode'), width: '180px', render: (r) => <span className="font-mono text-[12px]">{r.employeeCode}</span> },
    { key: 'name', header: t('field.name'), render: (r) => <span className="font-semibold text-fg">{r.fullName}</span> },
    { key: 'email', header: t('field.email'), render: (r) => <span className="text-[12px] text-fg-muted">{r.email ?? '—'}</span> },
    { key: 'phone', header: t('field.phone'), width: '140px', render: (r) => <span className="font-mono text-[12px] text-fg-muted">{r.phone ?? '—'}</span> },
    { key: 'dept', header: t('field.department'), width: '180px', render: (r) => r.departmentId ? <Badge tone="info" variant="soft">{deptById.get(r.departmentId)?.departmentCode ?? r.departmentId.slice(0, 8)}</Badge> : <span className="text-fg-subtle">—</span> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await create({
      variables: {
        input: {
          corporateId,
          employeeCode,
          fullName,
          email: email || null,
          phone: phone || null,
          badgeRfid: badgeRfid || null,
          departmentId: departmentId || null,
        },
      },
    });
    const env = res.data?.mealEmployeeCreate;
    if (env?.error) {
      setError(env.error.message);
      return;
    }
    setEmployeeCode('');
    setFullName('');
    setEmail('');
    setPhone('');
    setBadgeRfid('');
    setDepartmentId(null);
    setShowForm(false);
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.tenants') },
          { label: t('nav.tenants.corporates'), href: '/tenants/corporates' },
          { label: c?.tenantCode ?? '…', href: `/tenants/corporates/${corporateId}` },
          {  label: t('corporate.detail.subnav.employees') },
        ],
        title: c ? `${c.companyName} · ${t('corporate.detail.subnav.employees')}` : t('common.loading'),
        description: '임직원 등록 · 부서 배정 · badge RFID 관리',
        meta: <code className="text-[11px] text-fg-subtle">SA-CORP-006</code>,
        actions: (
          <>
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push(`/tenants/corporates/${corporateId}`)}>
              Back
            </Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowForm((v) => !v)}>
                {t('corporate.action.cta.createEmployee')}
              </Button>
            )}
          </>
        ),
      }}
      summaryItems={[
        { label: t('corporate.employees.summary.total'), value: employees.length, tone: 'brand' },
        { label: t('corporate.employees.summary.active'), value: employees.filter((e) => e.status === 'ACTIVE').length, tone: 'success' },
        { label: t('corporate.employees.summary.departments'), value: depts.length, tone: 'info' },
      ]}
    >
      {showForm && canWrite && (
        <div className="mb-3">
          <SectionCard title={t('corporate.employees.formTitle')}>
            <form onSubmit={submit} className="flex flex-col gap-3">
              {error && <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.employeeCode')} *</label>
                  <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="E0001" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.fullName')} *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.email')}</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.phone')}</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+84 ..." />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.badgeRfid')}</label>
                  <Input value={badgeRfid} onChange={(e) => setBadgeRfid(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('field.department')}</label>
                  <Select
                    value={departmentId}
                    onChange={(v) => setDepartmentId(String(v))}
                    options={depts.map((d) => ({ value: d.id, label: `${d.departmentCode} · ${d.departmentName}` }))}
                    placeholder={t('field.selectNone')}
                    minWidth="100%"
                  />
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
      <SectionCard title={t('corporate.employees.cardTitle')} description={`${employees.length} employee(s)`} padding="none">
        {loading && employees.length === 0 ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <DataTable columns={cols} rows={employees} rowKey={(r) => r.id} compact emptyState={t('corporate.employees.empty')} />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
