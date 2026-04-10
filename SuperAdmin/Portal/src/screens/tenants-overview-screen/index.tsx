'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Building2, Store, Ticket, ArrowRight } from 'lucide-react';
import {
  DashboardPageTemplate,
  SectionCard,
  DataTable,
  Skeleton,
  type SharedUiStat,
  type DataTableColumn,
} from '@platform/shared-ui';
import { TENANTS_OVERVIEW_QUERY, type TenantsOverviewData } from '@graphql/queries/landing';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';

export function TenantsOverviewScreen() {
  const { t } = useI18n();
  const { data, loading } = useQuery<TenantsOverviewData>(TENANTS_OVERVIEW_QUERY, { errorPolicy: 'all' });

  const dists = data?.distributors.success?.data ?? [];
  const brands = data?.brands.success?.data ?? [];
  const corps = data?.mealCorporates.success?.data ?? [];

  const metrics: SharedUiStat[] = [
    { label: t('nav.tenants.distributors'), value: loading ? <Skeleton width={50} height={22} /> : dists.length, icon: <Building2 size={14} />, tone: 'brand' },
    { label: t('nav.tenants.brands'), value: loading ? <Skeleton width={50} height={22} /> : brands.length, icon: <Store size={14} />, tone: 'info' },
    { label: t('nav.tenants.corporates'), value: loading ? <Skeleton width={50} height={22} /> : corps.length, icon: <Ticket size={14} />, tone: 'warning' },
  ];

  const distCols: DataTableColumn<{ id: string; distributorCode: string; companyName: string; countryCode: string; status: string }>[] = [
    { key: 'code', header: 'Code', width: '140px', render: (r) => <span className="font-mono text-[12px]">{r.distributorCode}</span> },
    { key: 'name', header: 'Company', render: (r) => <span className="font-medium text-fg">{r.companyName}</span> },
    { key: 'country', header: 'Country', width: '80px', render: (r) => <span className="font-mono text-[12px] uppercase">{r.countryCode}</span> },
    { key: 'status', header: 'Status', width: '120px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DashboardPageTemplate
      header={{
        title: t('nav.tenants'),
        description: 'Distributors · Brands · Meal Corporates — platform tenant tree',
        meta: <code className="text-[11px] text-fg-subtle">SA-TENANTS</code>,
      }}
      metrics={metrics}
      primary={
        <>
          <SectionCard
            title={
              <Link href="/tenants/distributors" className="flex items-center gap-2 text-fg hover:text-primary">
                <Building2 size={14} className="text-primary" />
                {t('nav.tenants.distributors')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${dists.length} distributor(s)`}
            padding="none"
          >
            {loading ? (
              <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
            ) : (
              <DataTable
                columns={distCols}
                rows={dists.slice(0, 5)}
                rowKey={(r) => r.id}
                compact
                onRowClick={(r) => (window.location.href = `/tenants/distributors/${r.id}`)}
                emptyState={t('common.empty')}
              />
            )}
          </SectionCard>

          <SectionCard
            title={
              <Link href="/tenants/brands" className="flex items-center gap-2 text-fg hover:text-primary">
                <Store size={14} className="text-primary" />
                {t('nav.tenants.brands')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${brands.length} brand(s)`}
          >
            {loading ? (
              <Skeleton height={32} />
            ) : brands.length === 0 ? (
              <div className="text-[12.5px] text-fg-subtle">{t('common.empty')}</div>
            ) : (
              <ul className="space-y-1 text-[12.5px]">
                {brands.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <Link href={`/tenants/brands/${b.id}`} className="font-mono text-fg hover:text-primary">
                      {b.brandCode}
                    </Link>
                    <StatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title={
              <Link href="/tenants/corporates" className="flex items-center gap-2 text-fg hover:text-primary">
                <Ticket size={14} className="text-primary" />
                {t('nav.tenants.corporates')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${corps.length} corporate(s)`}
          >
            {loading ? (
              <Skeleton height={32} />
            ) : corps.length === 0 ? (
              <div className="text-[12.5px] text-fg-subtle">{t('common.empty')}</div>
            ) : (
              <ul className="space-y-1 text-[12.5px]">
                {corps.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <Link href={`/tenants/corporates/${c.id}`} className="font-mono text-fg hover:text-primary">
                      {c.tenantCode}
                    </Link>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      }
    />
  );
}
