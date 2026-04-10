'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import {
  ListPageTemplate,
  SectionCard,
  DataTable,
  Input,
  Button,
  Skeleton,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  DISTRIBUTOR_LIST_QUERY,
  type DistributorListData,
  type DistributorListItem,
  type DistributorStatus,
} from '@graphql/queries/distributor';
import { FilterBar } from '@shared/ui/FilterBar';
import { Pager } from '@shared/ui/Pager';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { formatDateTime } from '@shared/utils/format';
import { LockedScreen } from '@screens/common/LockedScreen';

const STATUSES: DistributorStatus[] = ['ACTIVE', 'SUSPENDED', 'TERMINATED'];

export function DistributorListScreen() {
  const { t, locale } = useI18n();
  const canRead = useHasPermission(PERMISSIONS.DISTRIBUTOR_PROFILE_READ);
  const canWrite = useHasPermission(PERMISSIONS.DISTRIBUTOR_PROFILE_WRITE);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(20);
  const [status, setStatus] = useState<DistributorStatus | ''>('');
  const [country, setCountry] = useState('');
  const [search, setSearch] = useState('');

  const { data, loading, error } = useQuery<DistributorListData>(DISTRIBUTOR_LIST_QUERY, {
    variables: { skip, take },
    errorPolicy: 'all',
  });

  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';

  const rows: DistributorListItem[] = useMemo(() => {
    const raw = data?.distributors.success?.data ?? [];
    return raw.filter((row) => {
      if (status && row.status !== status) return false;
      if (country && row.countryCode !== country) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !row.companyName.toLowerCase().includes(q) &&
          !row.distributorCode.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, status, country, search]);

  const columns: DataTableColumn<DistributorListItem>[] = [
    {
      key: 'code',
      header: t('distributor.list.column.code'),
      width: '140px',
      render: (row) => <span className="font-mono text-[12px] text-fg">{row.distributorCode}</span>,
    },
    {
      key: 'companyName',
      header: t('distributor.list.column.companyName'),
      render: (row) => <span className="font-medium text-fg">{row.companyName}</span>,
    },
    {
      key: 'country',
      header: t('distributor.list.column.country'),
      width: '80px',
      render: (row) => <span className="font-mono text-[12px] uppercase">{row.countryCode}</span>,
    },
    {
      key: 'status',
      header: t('distributor.list.column.status'),
      width: '140px',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: t('distributor.list.column.createdAt'),
      width: '160px',
      align: 'right',
      render: (row) => (
        <span className="num text-[12px] text-fg-muted">
          {formatDateTime(row.createdAt, localeTag)}
        </span>
      ),
    },
  ];

  if (!canRead) return <LockedScreen />;

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.tenants') }, { label: t('nav.tenants.distributors') }],
        title: t('distributor.list.title'),
        description: t('distributor.list.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-DIST-001</code>,
        actions: canWrite && (
          <Link href="/tenants/distributors/new">
            <Button variant="primary" size="md" startIcon={<Plus size={14} />}>
              {t('distributor.list.cta.create')}
            </Button>
          </Link>
        ),
      }}
      filters={
        <FilterBar>
          <Input
            placeholder={t('distributor.filter.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<Search size={14} />}
            style={{ minWidth: 260 }}
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-9 rounded-md border bg-surface-3 px-2.5 text-[13px] text-fg"
            style={{ borderColor: 'var(--border)' }}
          >
            <option value="">{t('distributor.filter.country')} · {t('distributor.filter.all')}</option>
            <option value="VN">VN</option>
            <option value="KR">KR</option>
            <option value="SG">SG</option>
            <option value="JP">JP</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DistributorStatus | '')}
            className="h-9 rounded-md border bg-surface-3 px-2.5 text-[13px] text-fg"
            style={{ borderColor: 'var(--border)' }}
          >
            <option value="">{t('distributor.filter.status')} · {t('distributor.filter.all')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FilterBar>
      }
    >
      <SectionCard
        title={t('distributor.list.title')}
        description={error ? t('common.error') : `${rows.length} · page ${Math.floor(skip / take) + 1}`}
        padding="none"
        footer={
          <Pager
            skip={skip}
            take={take}
            currentCount={data?.distributors.success?.data.length ?? 0}
            onChange={({ skip: s, take: tk }) => {
              setSkip(s);
              setTake(tk);
            }}
          />
        }
      >
        {loading && !data ? (
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
            emptyState={t('distributor.list.empty')}
            compact
            onRowClick={(row) => {
              window.location.href = `/tenants/distributors/${row.id}`;
            }}
          />
        )}
      </SectionCard>
    </ListPageTemplate>
  );
}
