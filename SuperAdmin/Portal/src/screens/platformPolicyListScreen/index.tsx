'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { RefreshCw, Plus } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  PLATFORM_POLICY_LIST_QUERY,
  type PlatformPolicyListData,
  type PlatformPolicyRow,
} from '@graphql/queries/governance';
import { FilterBar } from '@shared/ui/FilterBar';
import { Pager } from '@shared/ui/Pager';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime } from '@shared/utils/format';
import { CreatePolicyModal } from './CreatePolicyModal';

const SCOPES = ['GLOBAL', 'REGIONAL_DISTRIBUTOR', 'BRAND_HQ', 'BRANCH', 'EDGE_POS'] as const;

export function PlatformPolicyListScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [scopeType, setScopeType] = useState<(typeof SCOPES)[number]>('GLOBAL');
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery<PlatformPolicyListData>(PLATFORM_POLICY_LIST_QUERY, {
    variables: { scopeType, scopeId: null, skip, take },
    errorPolicy: 'all',
  });

  const rows: PlatformPolicyRow[] = data?.policies.success?.data ?? [];

  const columns: DataTableColumn<PlatformPolicyRow>[] = [
    { key: 'key', header: t('policy.form.policyKey'), render: (r) => <span className="font-mono text-[12px]">{r.policyKey}</span> },
    { key: 'scope', header: t('policy.form.scopeType'), width: '200px', render: (r) => <><Badge tone="info" variant="soft">{r.scopeType}</Badge>{r.scopeId && <span className="ml-2 font-mono text-[11px] text-fg-subtle">{r.scopeId.slice(0, 8)}</span>}</> },
    { key: 'version', header: t('policy.form.version'), width: '100px', align: 'right', render: (r) => <span className="num font-mono text-[12px]">v{r.version}</span> },
    { key: 'active', header: t('field.active'), width: '100px', align: 'center', render: (r) => r.isActive ? <Badge tone="success" startDot>{t('enum.status.ACTIVE')}</Badge> : <Badge tone="neutral" variant="soft">{t('enum.status.INACTIVE')}</Badge> },
    { key: 'updated', header: t('field.updatedAt'), width: '180px', align: 'right', render: (r) => <span className="num text-[12px] text-fg-muted">{formatDateTime(r.updatedAt)}</span> },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.governance') }, { label: t('nav.governance.policies') }],
        title: t('policy.list.title'),
        description: t('policy.list.description'),
        meta: (
          <span className="flex items-center gap-2">
            <code className="text-[11px] text-fg-subtle">SA-POL-001</code>
            {error && <Badge tone="danger" startDot>{t('common.error')}</Badge>}
          </span>
        ),
        actions: (
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg hover:bg-surface-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <RefreshCw size={13} />
              {t('action.refresh')}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-md border bg-primary px-3 text-[12.5px] font-medium text-white hover:bg-primary/90"
              style={{ borderColor: 'var(--border)' }}
            >
              <Plus size={13} />
              {t('policy.action.create')}
            </button>
          </span>
        ),
      }}
      filters={
        <FilterBar>
          <select
            value={scopeType}
            onChange={(e) => {
              setScopeType(e.target.value as (typeof SCOPES)[number]);
              setSkip(0);
            }}
            className="h-9 rounded-md border bg-surface-3 px-3 text-[13px] text-fg"
            style={{ borderColor: 'var(--border)' }}
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                scope: {s}
              </option>
            ))}
          </select>
        </FilterBar>
      }
    >
      <SectionCard
        title={t('policy.list.title')}
        description={`${rows.length} · page ${Math.floor(skip / take) + 1}`}
        padding="none"
        footer={
          <Pager
            skip={skip}
            take={take}
            currentCount={rows.length}
            onChange={({ skip: s, take: tk }) => {
              setSkip(s);
              setTake(tk);
            }}
          />
        }
      >
        {loading && rows.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={30} />)}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            compact
            emptyState={t('common.empty')}
            onRowClick={(r) => router.push(`/governance/platformPolicies/${r.id}`)}
          />
        )}
      </SectionCard>

      <CreatePolicyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => refetch()}
      />
    </ListPageTemplate>
  );
}
