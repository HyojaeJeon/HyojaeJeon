'use client';

import { useState, type ReactNode } from 'react';
import { useQuery, type DocumentNode, type OperationVariables } from '@apollo/client';
import { RefreshCw, Search } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Input,
  Skeleton,
  Badge,
  type DataTableColumn,
} from '@platform/shared-ui';
import { FilterBar } from '@shared/ui/FilterBar';
import { Pager } from '@shared/ui/Pager';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import type { PermissionKey } from '@rbac/permissions';
import { LockedScreen } from './LockedScreen';

export interface ResourceListScreenProps<Row extends { id: string }> {
  /** i18n key for title (e.g. "license.list.title") */
  titleKey: string;
  /** i18n key for description */
  descriptionKey?: string;
  /** breadcrumb labels (i18n keys) */
  breadcrumbKeys?: string[];
  /** screen ID (SA-XXX-001) */
  screenId: string;
  /** required permission key(s) */
  permissions?: PermissionKey | PermissionKey[];
  /** GraphQL query document */
  query: DocumentNode;
  /** function to build variables from skip/take/search */
  buildVariables?: (args: { skip: number; take: number; search: string }) => OperationVariables;
  /** unwrap envelope → rows */
  unwrap: (data: unknown) => Row[];
  /** columns */
  columns: DataTableColumn<Row>[];
  /** enable search box */
  searchable?: boolean;
  /** header actions (e.g. create button) */
  actions?: ReactNode;
  /** optional custom filters (additional to search) */
  filters?: ReactNode;
  /** row click handler */
  onRowClick?: (row: Row) => void;
}

/**
 * 제네릭 리스트 화면 템플릿. 대부분의 SA-XXX-001 (목록) 화면은 이 템플릿의 config 로 구현된다.
 */
export function ResourceListScreen<Row extends { id: string }>({
  titleKey,
  descriptionKey,
  breadcrumbKeys,
  screenId,
  permissions,
  query,
  buildVariables,
  unwrap,
  columns,
  searchable = true,
  actions,
  filters,
  onRowClick,
}: ResourceListScreenProps<Row>) {
  const { t } = useI18n();
  const allowed = useHasPermission(permissions ?? []);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(20);
  const [search, setSearch] = useState('');

  const variables = buildVariables
    ? buildVariables({ skip, take, search })
    : { skip, take };

  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    errorPolicy: 'all',
  });

  if (!allowed) return <LockedScreen />;

  const rows = data ? unwrap(data) : [];

  const breadcrumbs = breadcrumbKeys?.map((k) => ({ label: t(k) }));

  return (
    <ListPageTemplate
      header={{
        breadcrumbs,
        title: t(titleKey),
        description: descriptionKey ? t(descriptionKey) : undefined,
        meta: (
          <span className="flex items-center gap-2">
            <code className="text-[11px] text-fg-subtle">{screenId}</code>
            {error && (
              <Badge tone="danger" startDot>
                {t('common.error')}
              </Badge>
            )}
          </span>
        ),
        actions: (
          <>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex h-9 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg transition-colors hover:bg-surface-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <RefreshCw size={13} />
              {t('action.refresh')}
            </button>
            {actions}
          </>
        ),
      }}
      filters={
        searchable || filters ? (
          <FilterBar>
            {searchable && (
              <Input
                placeholder={t('common.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startIcon={<Search size={14} />}
                style={{ minWidth: 260 }}
              />
            )}
            {filters}
          </FilterBar>
        ) : undefined
      }
    >
      <SectionCard
        title={t(titleKey)}
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
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={32} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyState={t('common.empty')}
            compact
            onRowClick={onRowClick}
          />
        )}
      </SectionCard>
    </ListPageTemplate>
  );
}
