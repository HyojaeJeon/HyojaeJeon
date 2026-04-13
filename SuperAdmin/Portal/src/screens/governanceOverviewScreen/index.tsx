'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { BadgeCheck, UsersRound, KeyRound, UserCog, ArrowRight } from 'lucide-react';
import {
  DashboardPageTemplate,
  SectionCard,
  DataTable,
  Badge,
  Skeleton,
  type SharedUiStat,
  type DataTableColumn,
} from '@platform/shared-ui';
import { GOVERNANCE_OVERVIEW_QUERY, type GovernanceOverviewData } from '@graphql/queries/landing';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';

export function GovernanceOverviewScreen() {
  const { t } = useI18n();
  const { data, loading } = useQuery<GovernanceOverviewData>(GOVERNANCE_OVERVIEW_QUERY, { errorPolicy: 'all' });
  const licenses = data?.licenses.success?.data ?? [];
  const licenseCount = (data?.licenses.success as { totalCount?: number })?.totalCount ?? licenses.length;
  const roles = data?.rbacRoles.success?.data ?? [];
  const permissions = data?.rbacPermissions.success?.data ?? [];
  const users = data?.authAccounts.success?.data ?? [];
  const userCount = (data?.authAccounts.success as { totalCount?: number })?.totalCount ?? users.length;

  const metrics: SharedUiStat[] = [
    { label: t('nav.governance.licenses'), value: loading ? <Skeleton width={40} height={22} /> : licenseCount, icon: <BadgeCheck size={14} />, tone: 'brand' },
    { label: t('role.list.title'), value: loading ? <Skeleton width={40} height={22} /> : roles.length, icon: <UsersRound size={14} />, tone: 'info' },
    { label: t('permission.list.title'), value: loading ? <Skeleton width={40} height={22} /> : permissions.length, icon: <KeyRound size={14} />, tone: 'warning' },
    { label: t('user.list.title'), value: loading ? <Skeleton width={40} height={22} /> : userCount, icon: <UserCog size={14} />, tone: 'success' },
  ];

  const userCols: DataTableColumn<{ id: string; loginId: string; userType: string; status: string }>[] = [
    { key: 'loginId', header: t('login.loginId'), render: (r) => <span className="font-mono text-[12px]">{r.loginId}</span> },
    { key: 'type', header: t('governance.col.userType'), width: '180px', render: (r) => <Badge tone="info" variant="soft">{t(`enum.userType.${r.userType}`)}</Badge> },
    { key: 'status', header: t('field.status'), width: '120px', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DashboardPageTemplate
      header={{
        title: t('nav.governance'),
        description: t('governance.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-GOV</code>,
      }}
      metrics={metrics}
      primary={
        <>
          <SectionCard
            title={
              <Link href="/governance/tenantUsers" className="flex items-center gap-2 text-fg hover:text-primary">
                <UsersRound size={14} className="text-primary" />
                {t('role.list.title')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${roles.length} ${t('governance.roleCount')}`}
          >
            {loading ? (
              <Skeleton height={32} />
            ) : (
              <ul className="space-y-1 text-[12.5px]">
                {roles.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <Link href={`/governance/TenantUsers?tab=roles`} className="font-mono text-fg hover:text-primary">
                      {r.roleCode}
                    </Link>
                    <Badge tone="info" variant="soft">{r.scope}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
          <SectionCard
            title={
              <Link href="/governance/tenantUsers" className="flex items-center gap-2 text-fg hover:text-primary">
                <UserCog size={14} className="text-primary" />
                {t('user.list.title')}
                <ArrowRight size={12} />
              </Link>
            }
            description={`${users.length} ${t('governance.userCount')}`}
            padding="none"
          >
            {loading ? (
              <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={28} />)}</div>
            ) : (
              <DataTable columns={userCols} rows={users} rowKey={(r) => r.id} compact emptyState={t('common.empty')} />
            )}
          </SectionCard>
        </>
      }
    />
  );
}
