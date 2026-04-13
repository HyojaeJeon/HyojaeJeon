'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, RefreshCw } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Input,
  Skeleton,
  Badge,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import {
  DEPARTMENTS_QUERY,
  CREATE_DEPARTMENT_MUTATION,
  type DepartmentsData,
  type DepartmentRow,
} from '@graphql/queries/department';
import { useCorporateId } from '@shared/hooks/useCorporateId';
import { useAppSelector } from '@store/index';

export function DepartmentListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.DEPARTMENT_READ);
  const canWrite = useHasPermission(PERMISSIONS.DEPARTMENT_WRITE);

  const corporateId = useCorporateId();
  const { data, loading, refetch } = useQuery<DepartmentsData>(DEPARTMENTS_QUERY, {
    variables: { corporateId },
    skip: !corporateId,
  });
  const departments: DepartmentRow[] = data?.mealDepartments?.success?.data ?? [];

  const [create, { loading: creating }] = useMutation(CREATE_DEPARTMENT_MUTATION);

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (hydrated && !canRead) return <LockedScreen />;

  const cols: DataTableColumn<DepartmentRow>[] = [
    {
      key: 'code',
      header: t('department.code'),
      width: '160px',
      render: (r) => <span className="font-mono text-[12px]">{r.departmentCode}</span>,
    },
    {
      key: 'name',
      header: t('department.name'),
      render: (r) => (
        <span className="font-semibold text-fg">{r.departmentName}</span>
      ),
    },
    {
      key: 'parent',
      header: t('department.parent'),
      width: '180px',
      render: (r) => <span className="text-fg-muted">{r.parentDepartmentName ?? '—'}</span>,
    },
    {
      key: 'employeeCount',
      header: t('department.employeeCount'),
      width: '120px',
      align: 'right',
      render: (r) => <span className="font-mono text-fg">{r.employeeCount ?? 0}</span>,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await create({
        variables: {
          input: {
            corporateId,
            departmentCode: code,
            departmentName: name,
            parentDepartmentId: null,
          },
        },
      });
      const gqlError = result.data?.mealDepartmentCreate?.error;
      if (gqlError) {
        setError(gqlError.message);
        return;
      }
      await refetch();
      setCode('');
      setName('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('department.createFailed'));
    }
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.departments') }],
        title: t('nav.departments'),
        description: t('department.description'),
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>{t('common.refresh')}</Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowForm((v) => !v)}>
                {t('action.addDepartment')}
              </Button>
            )}
          </div>
        ),
      }}
      summaryItems={[{ label: t('nav.departments'), value: departments.length, tone: 'brand' }]}
    >
      {showForm && canWrite && (
        <div className="mb-3">
          <SectionCard title={t('action.addDepartment')}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {error && <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('department.code')} *</label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="RND" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">{t('department.name')} *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="연구개발팀" required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary" disabled={creating}>{creating ? t('department.creating') : t('common.create')}</Button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}
      <SectionCard title={t('nav.departments')} description={`${departments.length}`} padding="none">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <DataTable
            columns={cols}
            rows={departments}
            rowKey={(r) => r.id}
            compact
            emptyState={t('department.emptyState')}
            onRowClick={(r) => router.push(`/departments/${r.id}`)}
          />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
