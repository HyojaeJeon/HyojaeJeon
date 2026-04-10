'use client';

import { useQuery } from '@apollo/client';
import {
  Building2,
  Store,
  MapPin,
  MonitorDot,
  Ticket,
  BadgeCheck,
  Activity,
  ScrollText,
  RefreshCw,
} from 'lucide-react';
import {
  DashboardPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type SharedUiStat,
  type DataTableColumn,
} from '@platform/shared-ui';
import {
  DASHBOARD_OVERVIEW_QUERY,
  type DashboardOverviewData,
} from '@graphql/queries/dashboard';
import { useI18n } from '@i18n/I18nProvider';
import { formatDateTime, formatRelativeTime } from '@shared/utils/format';

interface AuditRow {
  id: string;
  createdAt: string;
  actorType: string;
  actionType: string;
  targetType: string;
  targetId: string | null;
}

interface LicenseRow {
  id: string;
  licenseCode: string;
  licenseType: string;
  status: string;
  effectiveTo: string | null;
  scopeType: string;
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'SUSPENDED' || status === 'PENDING') return 'warning';
  if (status === 'TERMINATED' || status === 'REVOKED') return 'danger';
  return 'neutral';
}

export function DashboardScreen() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'ko' ? 'ko-KR' : locale === 'vi' ? 'vi-VN' : 'en-US';

  // 1P1Q — 단일 operation 으로 dashboard 의 모든 데이터를 fetch
  const { data, loading, error, refetch } = useQuery<DashboardOverviewData>(
    DASHBOARD_OVERVIEW_QUERY,
    { errorPolicy: 'all' },
  );

  // envelope unwrap
  const distributorCount = data?.distributors.success?.data.length ?? null;
  const brandCount = data?.brands.success?.data.length ?? null;
  const branchCount: number | null = null; // branches 는 brandHQId 필수 — backend count resolver 추가 필요
  const edgePosCount: number | null = null; // edgePosTerminals 는 branchId 필수 — 위와 동일
  const corporateCount: number | null = null; // mealCorporates 는 tenant ctx 요구 — backend scope 완화 필요
  const licenseCount = data?.licenses.success?.data.length ?? null;
  const licenses: LicenseRow[] = data?.licenses.success?.data ?? [];
  const audits: AuditRow[] =
    data?.auditLogConnection.success?.data.edges.map((e) => ({
      id: e.node.id,
      createdAt: e.node.createdAt,
      actorType: e.node.actorType,
      actionType: e.node.actionType,
      targetType: e.node.targetType,
      targetId: e.node.targetId,
    })) ?? [];

  const renderCount = (n: number | null): React.ReactNode =>
    loading && n === null ? <Skeleton width={60} height={22} /> : (n ?? '—');

  const metrics: SharedUiStat[] = [
    { label: t('dashboard.stat.distributors'), value: renderCount(distributorCount), icon: <Building2 size={14} />, tone: 'brand' },
    { label: t('dashboard.stat.brands'), value: renderCount(brandCount), icon: <Store size={14} />, tone: 'info' },
    { label: t('dashboard.stat.branches'), value: renderCount(branchCount), icon: <MapPin size={14} /> },
    { label: t('dashboard.stat.edgePos'), value: renderCount(edgePosCount), icon: <MonitorDot size={14} />, tone: 'success' },
    { label: t('dashboard.stat.corporates'), value: renderCount(corporateCount), icon: <Ticket size={14} />, tone: 'warning' },
    { label: t('dashboard.stat.licenses'), value: renderCount(licenseCount), icon: <BadgeCheck size={14} /> },
  ];

  const auditColumns: DataTableColumn<AuditRow>[] = [
    {
      key: 'when',
      header: 'When',
      width: '110px',
      render: (row) => (
        <span className="num text-[12px] text-fg-muted" title={formatDateTime(row.createdAt, localeTag)}>
          {formatRelativeTime(row.createdAt, localeTag)}
        </span>
      ),
    },
    { key: 'actor', header: 'Actor', render: (row) => <Badge tone="neutral" variant="outline">{row.actorType}</Badge> },
    { key: 'action', header: 'Action', render: (row) => <span className="font-mono text-[12px]">{row.actionType}</span> },
    {
      key: 'target',
      header: 'Target',
      render: (row) => (
        <span className="text-[12px] text-fg-muted">
          <span className="text-fg">{row.targetType}</span>
          {row.targetId && <span className="text-fg-subtle"> · {row.targetId.slice(0, 8)}</span>}
        </span>
      ),
    },
  ];

  const licenseColumns: DataTableColumn<LicenseRow>[] = [
    { key: 'code', header: 'Code', render: (row) => <span className="font-mono text-[12px]">{row.licenseCode}</span> },
    { key: 'type', header: 'Type', render: (row) => <span className="text-[12px]">{row.licenseType}</span> },
    { key: 'scope', header: 'Scope', render: (row) => <Badge tone="neutral" variant="soft">{row.scopeType}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone(row.status)} startDot>{row.status}</Badge> },
    {
      key: 'expires',
      header: 'Expires',
      align: 'right',
      render: (row) => (
        <span className="num text-[12px] text-fg-muted">
          {row.effectiveTo ? formatDateTime(row.effectiveTo, localeTag) : '—'}
        </span>
      ),
    },
  ];

  return (
    <DashboardPageTemplate
      header={{
        title: t('dashboard.title'),
        description: t('dashboard.subtitle'),
        meta: error ? (
          <Badge tone="danger" startDot>
            {t('dashboard.status.backendDown')}
          </Badge>
        ) : loading ? (
          <Badge tone="info" startDot>
            {t('common.loading')}
          </Badge>
        ) : (
          <Badge tone="success" startDot>
            {t('dashboard.status.live')} · CentralApi
          </Badge>
        ),
        actions: (
          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-surface-1 px-3 text-[12.5px] font-medium text-fg transition-colors hover:bg-surface-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <RefreshCw size={13} />
            {t('action.refresh')}
          </button>
        ),
      }}
      metrics={metrics}
      primary={
        <>
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <ScrollText size={14} className="text-primary" />
                {t('dashboard.card.recentAudits')}
              </span>
            }
            description={t('dashboard.card.recentAudits.description')}
            padding="none"
          >
            {loading && audits.length === 0 ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height={28} />
                ))}
              </div>
            ) : (
              <DataTable
                columns={auditColumns}
                rows={audits}
                rowKey={(row) => row.id}
                emptyState={t('common.empty')}
                compact
              />
            )}
          </SectionCard>

          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <BadgeCheck size={14} className="text-primary" />
                {t('dashboard.card.expiringLicenses')}
              </span>
            }
            description={t('dashboard.card.expiringLicenses.description')}
            padding="none"
          >
            {loading && licenses.length === 0 ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={28} />
                ))}
              </div>
            ) : (
              <DataTable
                columns={licenseColumns}
                rows={licenses}
                rowKey={(row) => row.id}
                emptyState={t('common.empty')}
                compact
              />
            )}
          </SectionCard>
        </>
      }
      secondary={
        <>
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                {t('dashboard.card.syncHealth')}
              </span>
            }
            description={t('dashboard.card.syncHealth.description')}
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              {(
                [
                  { key: 'sync.pending', value: '—' },
                  { key: 'sync.failed', value: '—' },
                  { key: 'sync.acked', value: '—' },
                ] as const
              ).map((item) => (
                <div
                  key={item.key}
                  className="rounded-md border bg-surface-1 p-3"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                    {t(`dashboard.${item.key}`)}
                  </div>
                  <div className="num mt-1 font-mono text-xl font-bold text-fg">{item.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="text-primary" />
                {t('dashboard.card.transactions24h')}
              </span>
            }
            description={t('dashboard.card.transactions24h.description')}
          >
            <div className="flex h-[120px] items-center justify-center text-[12px] text-fg-subtle">
              {t('dashboard.chartPlaceholder')}
            </div>
          </SectionCard>

          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <MonitorDot size={14} className="text-primary" />
                {t('dashboard.card.realtimeSockets')}
              </span>
            }
            description={t('dashboard.card.realtimeSockets.description')}
          >
            <div className="flex items-baseline gap-2">
              <span className="num font-mono text-3xl font-bold text-fg">—</span>
              <span className="text-[11px] text-fg-subtle">{t('dashboard.socketsConnected')}</span>
            </div>
          </SectionCard>
        </>
      }
    />
  );
}
