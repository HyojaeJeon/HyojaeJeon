'use client';

import { useRouter } from 'next/navigation';
import { Plus, RefreshCw } from 'lucide-react';
import {
  DetailPageTemplate,
  SectionCard,
  DataTable,
  Button,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import { formatCurrency } from '@shared/utils/format';

type PolicyStatus = 'ACTIVE' | 'SCHEDULED' | 'PAUSED' | 'EXPIRED' | 'DRAFT';

interface PolicyRow {
  id: string;
  policyCode: string;
  policyName: string;
  status: PolicyStatus;
  maxPerTransactionVnd: number;
  dailyLimitVnd: number;
  allowSplitPayment: boolean;
  effectiveFrom: string;
  effectiveTo: string;
}

const STATUS_TONE: Record<PolicyStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  ACTIVE: 'success',
  SCHEDULED: 'info',
  PAUSED: 'warning',
  EXPIRED: 'neutral',
  DRAFT: 'neutral',
};

export function PolicyListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const canRead = useHasPermission(PERMISSIONS.POLICY_READ);
  const canWrite = useHasPermission(PERMISSIONS.POLICY_WRITE);

  // TODO: useQuery(POLICY_LIST_QUERY, { variables: { corporateId } })
  const policies: PolicyRow[] = [];
  const loading = false;

  if (!canRead) return <LockedScreen />;

  const cols: DataTableColumn<PolicyRow>[] = [
    {
      key: 'policyCode',
      header: '정책코드',
      width: '140px',
      render: (r) => <span className="font-mono text-[12px]">{r.policyCode}</span>,
    },
    {
      key: 'policyName',
      header: '정책명',
      render: (r) => <span className="font-semibold text-fg">{r.policyName}</span>,
    },
    {
      key: 'status',
      header: '상태',
      width: '110px',
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]} size="sm">
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'maxPerTransaction',
      header: '1회한도',
      width: '140px',
      render: (r) => (
        <span className="num font-semibold">{formatCurrency(r.maxPerTransactionVnd)}</span>
      ),
    },
    {
      key: 'dailyLimit',
      header: '일일한도',
      width: '140px',
      render: (r) => (
        <span className="num font-semibold">{formatCurrency(r.dailyLimitVnd)}</span>
      ),
    },
    {
      key: 'allowSplit',
      header: 'Split허용',
      width: '100px',
      render: (r) => (
        <Badge tone={r.allowSplitPayment ? 'success' : 'neutral'} size="sm">
          {r.allowSplitPayment ? 'Y' : 'N'}
        </Badge>
      ),
    },
    {
      key: 'period',
      header: '유효기간',
      width: '200px',
      render: (r) => (
        <span className="text-[12px] text-fg-muted">
          {r.effectiveFrom} ~ {r.effectiveTo}
        </span>
      ),
    },
  ];

  return (
    <DetailPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.policies') }],
        title: t('nav.policies'),
        description: '식대 정책을 조회하고 관리합니다.',
        actions: (
          <div className="flex gap-2">
            <Button variant="ghost" startIcon={<RefreshCw size={14} />}>
              {t('common.refresh')}
            </Button>
            {canWrite && (
              <Button
                variant="primary"
                startIcon={<Plus size={14} />}
                onClick={() => router.push('/policies/new')}
              >
                새 정책 추가
              </Button>
            )}
          </div>
        ),
      }}
      summaryItems={[{ label: '정책 수', value: policies.length, tone: 'brand' }]}
    >
      <SectionCard title={t('nav.policies')} description={`${policies.length}개`} padding="none">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={30} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={cols}
            rows={policies}
            rowKey={(r) => r.id}
            compact
            emptyState="등록된 정책이 없습니다. '새 정책 추가' 버튼을 눌러 시작하세요."
            onRowClick={(r) => router.push(`/policies/${r.id}`)}
          />
        )}
      </SectionCard>
    </DetailPageTemplate>
  );
}
