'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Shield, Settings, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ListPageTemplate, SectionCard, Tabs, Skeleton } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import {
  RBAC_ROLES_QUERY,
  RBAC_PERMISSION_CATALOG_QUERY,
  RBAC_UPDATE_ROLE_PERMISSIONS_MUTATION,
  type RbacRolesData,
  type PermissionCatalogQueryData,
  type PermissionCatalogData,
} from '@graphql/queries/rbac';
import { PermissionMatrixTab } from './components/PermissionMatrixTab';
import { RoleListTab } from './components/RoleListTab';
import { UserAssignmentTab } from './components/UserAssignmentTab';

export function SettingsRbacScreen() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('roles');

  const { data: rolesData, loading: rolesLoading, refetch } = useQuery<RbacRolesData>(RBAC_ROLES_QUERY);
  const { data: catalogRaw, loading: catalogLoading } = useQuery<PermissionCatalogQueryData>(RBAC_PERMISSION_CATALOG_QUERY);
  const [updatePerms] = useMutation(RBAC_UPDATE_ROLE_PERMISSIONS_MUTATION);

  const roles = rolesData?.rbacRoles?.success?.data ?? [];
  const catalog = useMemo<PermissionCatalogData | null>(() => {
    return catalogRaw?.permissionCatalog?.success?.data ?? null;
  }, [catalogRaw]);
  const catalogError = catalogRaw?.permissionCatalog?.error ?? null;

  useEffect(() => {
    if (catalogError?.message) {
      toast.error(catalogError.message);
    }
  }, [catalogError?.message]);

  const handleUpdatePermissions = async (roleId: string, permissions: string[]) => {
    try {
      const res = await updatePerms({ variables: { roleId, permissions } });
      if (res.data?.updateRolePermissions?.error) {
        toast.error(res.data.updateRolePermissions.error.message);
        return;
      }
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const loading = rolesLoading || catalogLoading;

  const tabs = [
    { key: 'roles', label: t('settings.rbac.tab.roles'), icon: <Shield size={14} /> },
    { key: 'matrix', label: t('settings.rbac.tab.permissions'), icon: <Settings size={14} /> },
    { key: 'users', label: t('settings.rbac.tab.users'), icon: <Users size={14} /> },
  ];

  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: t('nav.settings') }, { label: t('nav.settings.rbac') }],
        title: t('nav.settings.rbac'),
        description: t('settings.rbac.description'),
        meta: <code className="text-[11px] text-fg-subtle">SA-SET-RBAC</code>,
      }}
    >
      <Tabs
        items={tabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      {loading ? (
        <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={40} />)}</div>
      ) : activeTab === 'matrix' ? (
        catalog ? (
          <PermissionMatrixTab
            roles={roles}
            categories={catalog.categories}
            menuStructure={catalog.menuStructure}
            onUpdatePermissions={handleUpdatePermissions}
          />
        ) : catalogError ? (
          <SectionCard title={t('settings.rbac.tab.permissions')} description={t('settings.rbac.permissionsDesc')}>
            <div className="p-4 text-[13px] text-red-600">{catalogError.message}</div>
          </SectionCard>
        ) : (
          <SectionCard title={t('settings.rbac.tab.permissions')} description={t('settings.rbac.permissionsDesc')}>
            <div className="p-4 text-[13px] text-fg-muted">{t('settings.rbac.permissionsPlaceholder')}</div>
          </SectionCard>
        )
      ) : activeTab === 'roles' ? (
        <RoleListTab roles={roles} onRefetch={async () => { await refetch(); }} />
      ) : activeTab === 'users' ? (
        <UserAssignmentTab roles={roles} />
      ) : null}
    </ListPageTemplate>
  );
}
