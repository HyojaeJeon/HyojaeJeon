'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { ScrollText, DollarSign, Languages as LanguagesIcon, Globe2, ArrowRight } from 'lucide-react';
import {
  DashboardPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type SharedUiStat,
  type DataTableColumn,
} from '@platform/shared-ui';
import { SYSTEM_OVERVIEW_QUERY, type SystemOverviewData } from '@graphql/queries/landing';
import { useI18n } from '@i18n/I18nProvider';
import { formatRelativeTime } from '@shared/utils/format';

export function SystemOverviewScreen() {
  const { t, locale } = useI18n();
  const tag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';
  const { data, loading } = useQuery<SystemOverviewData>(SYSTEM_OVERVIEW_QUERY, { errorPolicy: 'all' });

  const currencies = data?.currencies.success?.data ?? [];
  const languages = data?.languages.success?.data ?? [];
  const regions = data?.regions.success?.data ?? [];
  const audits = data?.auditLogConnection?.success?.data.edges.map((e) => e.node) ?? [];

  const metrics: SharedUiStat[] = [
    { label: t('reference.currency.list.title'), value: loading ? <Skeleton width={40} height={22} /> : currencies.length, icon: <DollarSign size={14} />, tone: 'brand' },
    { label: t('reference.language.list.title'), value: loading ? <Skeleton width={40} height={22} /> : languages.length, icon: <LanguagesIcon size={14} />, tone: 'info' },
    { label: t('reference.region.list.title'), value: loading ? <Skeleton width={40} height={22} /> : regions.length, icon: <Globe2 size={14} />, tone: 'success' },
  ];

  const auditCols: DataTableColumn<{ id: string; createdAt: string; actionType: string; targetType: string }>[] = [
    { key: 'when', header: 'When', width: '130px', render: (r) => <span className="num text-[12px] text-fg-muted">{formatRelativeTime(r.createdAt, tag)}</span> },
    { key: 'action', header: 'Action', render: (r) => <span className="font-mono text-[12px]">{r.actionType}</span> },
    { key: 'target', header: 'Target', width: '160px', render: (r) => <span className="text-[12px]">{r.targetType}</span> },
  ];

  return (
    <DashboardPageTemplate
      header={{
        title: t('nav.system'),
        description: 'Audit · Reference · Health',
        meta: <code className="text-[11px] text-fg-subtle">SA-SYS</code>,
      }}
      metrics={metrics}
      primary={
        <>
          <SectionCard
            title={
              <Link href="/system/audit" className="flex items-center gap-2 text-fg hover:text-primary">
                <ScrollText size={14} className="text-primary" />
                {t('audit.list.title')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${audits.length} recent`}
            padding="none"
          >
            {loading ? (
              <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
            ) : (
              <DataTable columns={auditCols} rows={audits} rowKey={(r) => r.id} compact emptyState={t('common.empty')} />
            )}
          </SectionCard>
          <SectionCard title={t('reference.currency.list.title')}>
            {loading ? (
              <Skeleton height={32} />
            ) : (
              <ul className="flex flex-wrap gap-2 text-[12px]">
                {currencies.map((c) => (
                  <li key={c.id}>
                    <Badge tone={c.isDefault ? 'success' : 'neutral'} variant="soft">
                      <span className="font-mono">{c.currencyCode}</span>
                      {c.isDefault && ' ★'}
                    </Badge>
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
