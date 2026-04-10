'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, RefreshCw, Download } from 'lucide-react';
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
  EMPLOYEES_QUERY,
  CREATE_EMPLOYEE_MUTATION,
  type EmployeesData,
  type EmployeeRow,
} from '@graphql/queries/employee';
import { DEPARTMENTS_QUERY, type DepartmentsData } from '@graphql/queries/department';
import { useCorporateId } from '@shared/hooks/useCorporateId';

type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'FROZEN' | 'CLOSED';
type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'DISPATCH' | 'CONTRACTOR_AGENCY';

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  DISPATCH: '파견직',
  CONTRACTOR_AGENCY: '도급',
};

const WALLET_STATUS_TONE: Record<WalletStatus, 'success' | 'warning' | 'info' | 'neutral'> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  FROZEN: 'info',
  CLOSED: 'neutral',
};

function maskBadge(rfid: string | null): string {
  if (!rfid) return '—';
  const last4 = rfid.slice(-4);
  return `****${last4}`;
}

export function EmployeeListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.EMPLOYEE_READ);
  const canWrite = useHasPermission(PERMISSIONS.EMPLOYEE_WRITE);

  const corporateId = useCorporateId();
  const { data, loading, refetch } = useQuery<EmployeesData>(EMPLOYEES_QUERY, {
    variables: { corporateId, skip: 0, take: 50 },
    skip: !corporateId,
  });
  const employees: EmployeeRow[] = data?.mealEmployees?.success?.data ?? [];

  const [create, { loading: creating }] = useMutation(CREATE_EMPLOYEE_MUTATION);

  // Fetch departments for the dropdown
  const { data: deptData } = useQuery<DepartmentsData>(DEPARTMENTS_QUERY, {
    variables: { corporateId },
    skip: !corporateId,
  });
  const departments = deptData?.mealDepartments?.success?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [error, setError] = useState<string | null>(null);

  if (!canRead) return <LockedScreen />;

  const cols: DataTableColumn<EmployeeRow>[] = [
    {
      key: 'employeeCode',
      header: '사번',
      width: '120px',
      render: (r) => <span className="font-mono text-[12px]">{r.employeeCode}</span>,
    },
    {
      key: 'fullName',
      header: '이름',
      render: (r) => <span className="font-semibold text-fg">{r.fullName}</span>,
    },
    {
      key: 'departmentName',
      header: '부서',
      width: '160px',
      render: (r) => <span className="text-fg-muted">{r.departmentName ?? '—'}</span>,
    },
    {
      key: 'employmentType',
      header: '직급',
      width: '120px',
      render: (r) => (
        <Badge tone="neutral" size="sm">
          {r.employmentType ? (EMPLOYMENT_TYPE_LABEL[r.employmentType as EmploymentType] ?? r.employmentType) : '—'}
        </Badge>
      ),
    },
    {
      key: 'walletStatus',
      header: '지갑상태',
      width: '120px',
      render: (r) => (
        <Badge tone={r.walletStatus ? (WALLET_STATUS_TONE[r.walletStatus as WalletStatus] ?? 'neutral') : 'neutral'} size="sm" startDot>
          {r.walletStatus ?? '—'}
        </Badge>
      ),
    },
    {
      key: 'badgeRfid',
      header: '배지번호',
      width: '120px',
      render: (r) => <span className="font-mono text-[12px] text-fg-muted">{maskBadge(r.badgeRfid)}</span>,
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
            employeeCode,
            fullName,
            email,
            phone: phone || null,
            departmentId,
            employmentType,
          },
        },
      });
      const gqlError = result.data?.mealEmployeeCreate?.error;
      if (gqlError) {
        setError(gqlError.message);
        return;
      }
      await refetch();
      setEmployeeCode('');
      setFullName('');
      setEmail('');
      setPhone('');
      setDepartmentId('');
      setEmploymentType('FULL_TIME');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '임직원 생성에 실패했습니다.');
    }
  };

  const handleExportCsv = () => {
    // TODO: Implement CSV export
  };

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.employees') }],
        title: t('nav.employees'),
        description: '임직원 목록을 관리합니다.',
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />} onClick={() => refetch()}>
              {t('common.refresh')}
            </Button>
            <Button variant="ghost" startIcon={<Download size={14} />} onClick={handleExportCsv}>
              CSV 내보내기
            </Button>
            {canWrite && (
              <Button variant="primary" startIcon={<Plus size={14} />} onClick={() => setShowForm((v) => !v)}>
                임직원 추가
              </Button>
            )}
          </div>
        ),
      }}
      summaryItems={[{ label: t('nav.employees'), value: employees.length, tone: 'brand' }]}
    >
      {showForm && canWrite && (
        <div className="mb-3">
          <SectionCard title="임직원 추가">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {error && (
                <div className="rounded-md p-2 text-[12px] text-danger" style={{ background: 'var(--danger-soft)' }}>
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">사번 *</label>
                  <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="EMP-001" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">이름 *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="홍길동" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">이메일 *</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hong@company.com" type="email" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">전화번호</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">부서 *</label>
                  <select
                    className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] text-fg outline-none"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                  >
                    <option value="">부서 선택</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-fg-muted">고용형태 *</label>
                  <select
                    className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] text-fg outline-none"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    required
                  >
                    <option value="FULL_TIME">정규직</option>
                    <option value="CONTRACT">계약직</option>
                    <option value="DISPATCH">파견직</option>
                    <option value="CONTRACTOR_AGENCY">도급</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? '생성 중...' : t('common.create')}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>
      )}
      <SectionCard title={t('nav.employees')} description={`${employees.length}명`} padding="none">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={30} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={cols}
            rows={employees}
            rowKey={(r) => r.id}
            compact
            emptyState="등록된 임직원이 없습니다."
            onRowClick={(r) => router.push(`/employees/${r.id}`)}
          />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
