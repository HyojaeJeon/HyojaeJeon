'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { ArrowLeft, Pencil } from 'lucide-react';
import { DetailPageTemplate, SectionCard, Button, Skeleton } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { useAppSelector } from '@store/index';
import { DEPARTMENT_DETAIL_QUERY, type DepartmentDetailData } from '@graphql/queries/department';

export function DepartmentDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const canRead = useHasPermission(PERMISSIONS.DEPARTMENT_READ);
  const canWrite = useHasPermission(PERMISSIONS.DEPARTMENT_WRITE);

  const { data, loading } = useQuery<DepartmentDetailData>(DEPARTMENT_DETAIL_QUERY, {
    variables: { id: params.id },
    skip: !params.id,
  });

  const dept = data?.mealDepartment?.success?.data ?? null;

  if (hydrated && !canRead) return <LockedScreen />;

  const infoRows = dept
    ? [
        { label: t('department.code'), value: dept.departmentCode },
        { label: t('department.name'), value: dept.departmentName },
        { label: t('department.parent'), value: dept.parentDepartmentName ?? '—' },
        { label: t('department.employeeCount'), value: String(dept.employeeCount ?? 0) },
        { label: t('common.createdAt'), value: new Date(dept.createdAt).toLocaleDateString('ko-KR') },
        { label: t('common.updatedAt'), value: new Date(dept.updatedAt).toLocaleDateString('ko-KR') },
      ]
    : [];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.departments'), href: '/departments' },
          { label: dept?.departmentName ?? '...' },
        ],
        title: dept?.departmentName ?? (loading ? '' : '—'),
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/departments')}>
              {t('common.back')}
            </Button>
            {canWrite && <Button variant="primary" startIcon={<Pencil size={14} />}>{t('common.edit')}</Button>}
          </div>
        ),
      }}
      summaryItems={[{ label: t('department.employeeCount'), value: dept?.employeeCount ?? 0, tone: 'brand' }]}
    >
      <SectionCard title={t('department.basicInfo')}>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} height={20} />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-fg-muted">{row.label}</span>
                <span className="text-[14px] font-medium text-fg">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
