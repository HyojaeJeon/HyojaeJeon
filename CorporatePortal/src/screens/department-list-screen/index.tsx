'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface DepartmentRow {
  id: string;
  departmentCode: string;
  departmentName: string;
  parentDepartmentName: string | null;
  employeeCount: number;
  isExternalSync: boolean;
}

export function DepartmentListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.DEPARTMENT_READ);
  const canWrite = useHasPermission(PERMISSIONS.DEPARTMENT_WRITE);

  // TODO: useQuery(DEPARTMENT_LIST_QUERY, { variables: { corporateId } })
  const departments: DepartmentRow[] = [];
  const loading = false;

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const cols: DataTableColumn<DepartmentRow>[] = [
    {
      key: 'code',
      header: '부서 코드',
      width: '160px',
      render: (r) => <span className="font-mono text-[12px]">{r.departmentCode}</span>,
    },
    {
      key: 'name',
      header: '부서명',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-fg">{r.departmentName}</span>
          {r.isExternalSync && <Badge tone="info" size="sm">HRIS</Badge>}
        </div>
      ),
    },
    {
      key: 'parent',
      header: '상위 부서',
      width: '180px',
      render: (r) => <span className="text-fg-muted">{r.parentDepartmentName ?? '—'}</span>,
    },
    {
      key: 'employees',
      header: '인원',
      width: '80px',
      render: (r) => <span className="num font-semibold">{r.employeeCount}</span>,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // TODO: Call mealDepartmentCreate mutation
    setCode('');
    setName('');
    setShowForm(false);
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.departments') }],
        title: t('nav.departments'),
        description: '회사 부서 조직도를 관리합니다.',
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />}>{t('common.refresh')}</Button>
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
          <SectionCard title="부서 추가">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {error && <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">부서 코드 *</label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="RND" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">부서명 *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="연구개발팀" required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
                <Button type="submit" variant="primary">{t('common.create')}</Button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}
      <SectionCard title={t('nav.departments')} description={`${departments.length}개`} padding="none">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={30} />)}</div>
        ) : (
          <DataTable
            columns={cols}
            rows={departments}
            rowKey={(r) => r.id}
            compact
            emptyState="등록된 부서가 없습니다. '부서 추가' 버튼을 눌러 시작하세요."
            onRowClick={(r) => router.push(`/departments/${r.id}`)}
          />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
