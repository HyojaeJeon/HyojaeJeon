'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { DetailPageTemplate, SectionCard, Button, Badge, Skeleton } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';

export function DepartmentDetailScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.DEPARTMENT_READ);
  const canWrite = useHasPermission(PERMISSIONS.DEPARTMENT_WRITE);

  if (!canRead) return <LockedScreen />;

  // TODO: useQuery for mealDepartmentDetail(params.id)
  const loading = true;

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [
          { label: t('nav.departments'), href: '/departments' },
          { label: '...' },
        ],
        title: t('common.loading'),
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<ArrowLeft size={14} />} onClick={() => router.push('/departments')}>
              {t('common.back')}
            </Button>
            {canWrite && <Button variant="primary" startIcon={<Pencil size={14} />}>{t('common.edit')}</Button>}
          </div>
        ),
      }}
      summaryItems={[{ label: '소속 인원', value: 0, tone: 'brand' }]}
    >
      <SectionCard title="기본 정보">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} height={20} />)}</div>
        ) : (
          <p className="text-fg-muted">부서 정보를 불러오는 중입니다.</p>
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
