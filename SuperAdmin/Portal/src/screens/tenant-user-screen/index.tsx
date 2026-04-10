'use client';

/**
 * 한국어: SA-TENANT-USER-001/002 — 플랫폼별 계정·역할·권한 통합 관리 화면.
 *
 *   - URL: /governance/tenant-users?platform=SUPER_ADMIN|DISTRIBUTOR|BRAND_HQ|CORPORATE
 *          &scopeId=<id>&tab=roles|matrix|users
 *   - 1P1Q: TENANT_USER_OVERVIEW_QUERY 가 roles + permissions + users 를 한 번에 가져온다.
 *   - Slice C: Role/Permission CRUD + locale-aware 라벨 (pickLabel) + ConfirmModal 통일.
 *
 * Tiếng Việt: Màn hình quản lý tài khoản · vai trò · quyền hợp nhất theo từng nền tảng.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery, type ApolloError } from '@apollo/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Shield, Settings, Users as UsersIcon, Plus } from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  Tabs,
  SegmentedControl,
  PermissionMatrix,
  DataTable,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  ConfirmModal,
  Skeleton,
  type DataTableColumn,
  type PermissionMatrixRole,
  type PermissionMatrixPermission,
} from '@platform/shared-ui';
import { StatusBadge } from '@shared/ui/StatusBadge';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { PERMISSIONS } from '@rbac/permissions';
import { LockedScreen } from '@screens/common/LockedScreen';
import {
  TENANT_USER_SCREEN_BOOTSTRAP_QUERY,
  type TenantUserScreenBootstrapData,
  TENANT_USER_SCREEN_ROLES_QUERY,
  type TenantUserScreenRolesData,
  TENANT_USER_SCREEN_MATRIX_QUERY,
  type TenantUserScreenMatrixData,
  TENANT_USER_SCREEN_USERS_QUERY,
  type TenantUserScreenUsersData,
  type TenantUserAccountRow,
  RBAC_ADD_PERMISSION_MUTATION,
  RBAC_REMOVE_PERMISSION_MUTATION,
  SUSPEND_AUTH_ACCOUNT_MUTATION,
  RESET_AUTH_ACCOUNT_PASSWORD_MUTATION,
  DELETE_AUTH_ACCOUNT_MUTATION,
  CREATE_AUTH_ACCOUNT_MUTATION,
  UPDATE_AUTH_ACCOUNT_MUTATION,
  RBAC_ASSIGN_ROLE_MUTATION,
  RBAC_REVOKE_ROLE_MUTATION,
  RBAC_CREATE_ROLE_MUTATION,
  RBAC_UPDATE_ROLE_MUTATION,
  RBAC_DELETE_ROLE_MUTATION,
  RBAC_CREATE_PERMISSION_MUTATION,
  RBAC_UPDATE_PERMISSION_MUTATION,
  RBAC_DELETE_PERMISSION_MUTATION,
  RBAC_USER_ASSIGNMENTS_LAZY_QUERY,
  type RoleRow,
  type PermissionRow,
  type AssignmentRow,
  type RbacUserAssignmentsData,
  type CreateRoleInput,
  type UpdateRoleInput,
  type CreatePermissionInput,
  type UpdatePermissionInput,
} from '@graphql/queries/governance';
import { pickLabel, pickDescription } from './components/i18n-label';
import { RoleCreateEditModal } from './components/role-create-edit-modal';
import { PermissionCreateEditModal } from './components/permission-create-edit-modal';

type Platform = 'SUPER_ADMIN' | 'DISTRIBUTOR' | 'BRAND_HQ' | 'CORPORATE';
type TabKey = 'roles' | 'matrix' | 'users';

const PLATFORM_TO_USER_TYPE: Record<Platform, string> = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  DISTRIBUTOR: 'DISTRIBUTOR_USER',
  BRAND_HQ: 'BRAND_ADMIN',
  CORPORATE: 'CORPORATE_ADMIN',
};

const PLATFORM_TO_ROLE_SCOPE: Record<Platform, string> = {
  SUPER_ADMIN: 'PLATFORM',
  DISTRIBUTOR: 'DISTRIBUTOR',
  BRAND_HQ: 'BRAND_HQ',
  CORPORATE: 'CORPORATE',
};

const PLATFORM_TO_PERMISSION_DOMAIN: Record<Platform, string> = {
  SUPER_ADMIN: 'platform',
  DISTRIBUTOR: 'distributor',
  BRAND_HQ: 'brand',
  CORPORATE: 'corporate',
};

interface ScopeOption {
  value: string;
  label: string;
}

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'default' | 'danger';
  action: () => Promise<void>;
}

export function TenantUserScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canRead = useHasPermission(PERMISSIONS.PLATFORM_USER_READ);
  const canWrite = useHasPermission(PERMISSIONS.PLATFORM_USER_WRITE);
  const canRbacWrite = useHasPermission(PERMISSIONS.PLATFORM_RBAC_WRITE);

  const platform = (searchParams.get('platform') as Platform) || 'SUPER_ADMIN';
  const tab = (searchParams.get('tab') as TabKey) || 'roles';
  const scopeId = searchParams.get('scopeId') || '';
  const userType = PLATFORM_TO_USER_TYPE[platform];
  const roleScope = PLATFORM_TO_ROLE_SCOPE[platform];
  const permissionDomain = PLATFORM_TO_PERMISSION_DOMAIN[platform];

  const updateQuery = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // ─────────── 1P1Q 탭 규칙: Bootstrap (페이지 진입 시 1회, 공유 scope 옵션) + 탭별 쿼리 (skip 패턴)
  const bootstrapQuery = useQuery<TenantUserScreenBootstrapData>(
    TENANT_USER_SCREEN_BOOTSTRAP_QUERY,
    { skip: platform === 'SUPER_ADMIN', fetchPolicy: 'cache-first' },
  );

  const rolesQuery = useQuery<TenantUserScreenRolesData>(TENANT_USER_SCREEN_ROLES_QUERY, {
    skip: tab !== 'roles',
    fetchPolicy: 'cache-and-network',
  });

  const matrixQuery = useQuery<TenantUserScreenMatrixData>(TENANT_USER_SCREEN_MATRIX_QUERY, {
    variables: { scope: roleScope },
    skip: tab !== 'matrix',
    fetchPolicy: 'cache-and-network',
  });

  const usersQuery = useQuery<TenantUserScreenUsersData>(TENANT_USER_SCREEN_USERS_QUERY, {
    variables: { userType, skip: 0, take: 100 },
    skip: tab !== 'users',
    fetchPolicy: 'cache-and-network',
  });

  // 활성 탭에 맞는 loading / error / refetch 선택
  const activeLoading =
    tab === 'roles' ? rolesQuery.loading : tab === 'matrix' ? matrixQuery.loading : usersQuery.loading;
  const activeError: ApolloError | undefined =
    tab === 'roles' ? rolesQuery.error : tab === 'matrix' ? matrixQuery.error : usersQuery.error;
  const refetch = useCallback(async () => {
    // 현재 활성 탭 + 교차 영향 쿼리 모두 갱신 (mutation 이후)
    if (tab === 'roles') await rolesQuery.refetch();
    else if (tab === 'matrix') await matrixQuery.refetch();
    else await usersQuery.refetch();
  }, [tab, rolesQuery, matrixQuery, usersQuery]);
  const refetchMatrix = useCallback(async () => {
    if (matrixQuery.called) await matrixQuery.refetch();
  }, [matrixQuery]);

  const scopeOptions: ScopeOption[] = useMemo(() => {
    const bs = bootstrapQuery.data;
    if (platform === 'DISTRIBUTOR') {
      const rows = bs?.distributors.success?.data ?? [];
      return rows.map((r) => ({ value: r.id, label: `${r.companyName} · ${r.distributorCode}` }));
    }
    if (platform === 'BRAND_HQ') {
      const rows = bs?.brands.success?.data ?? [];
      return rows.map((r) => ({ value: r.id, label: `${r.brandName} · ${r.brandCode}` }));
    }
    if (platform === 'CORPORATE') {
      const rows = bs?.mealCorporates.success?.data ?? [];
      return rows.map((r) => ({ value: r.id, label: `${r.companyName} · ${r.tenantCode}` }));
    }
    return [];
  }, [platform, bootstrapQuery.data]);

  // ─────────── Mutations
  const [addPermission] = useMutation(RBAC_ADD_PERMISSION_MUTATION);
  const [removePermission] = useMutation(RBAC_REMOVE_PERMISSION_MUTATION);
  const [suspendAccount] = useMutation(SUSPEND_AUTH_ACCOUNT_MUTATION);
  const [resetPassword] = useMutation(RESET_AUTH_ACCOUNT_PASSWORD_MUTATION);
  const [deleteAccount] = useMutation(DELETE_AUTH_ACCOUNT_MUTATION);
  const [createAccount] = useMutation(CREATE_AUTH_ACCOUNT_MUTATION);
  const [updateAccount] = useMutation(UPDATE_AUTH_ACCOUNT_MUTATION);
  const [assignRole] = useMutation(RBAC_ASSIGN_ROLE_MUTATION);
  const [revokeRole] = useMutation(RBAC_REVOKE_ROLE_MUTATION);
  const [createRoleMut] = useMutation(RBAC_CREATE_ROLE_MUTATION);
  const [updateRoleMut] = useMutation(RBAC_UPDATE_ROLE_MUTATION);
  const [deleteRoleMut] = useMutation(RBAC_DELETE_ROLE_MUTATION);
  const [createPermissionMut] = useMutation(RBAC_CREATE_PERMISSION_MUTATION);
  const [updatePermissionMut] = useMutation(RBAC_UPDATE_PERMISSION_MUTATION);
  const [deletePermissionMut] = useMutation(RBAC_DELETE_PERMISSION_MUTATION);

  // roles: Roles 탭 데이터 우선, 없으면 Matrix 탭 데이터 재사용 (둘 다 rbacRoles 공유)
  const roles: RoleRow[] = useMemo(() => {
    const fromRolesTab = rolesQuery.data?.rbacRoles.success?.data;
    const fromMatrixTab = matrixQuery.data?.rbacRoles.success?.data;
    const src = fromRolesTab ?? fromMatrixTab ?? [];
    return src.filter((r) => r.scope === roleScope);
  }, [rolesQuery.data, matrixQuery.data, roleScope]);

  const permissions: PermissionRow[] = useMemo(() => {
    const all = matrixQuery.data?.rbacPermissions.success?.data ?? [];
    const prefixMap: Record<Platform, string[]> = {
      SUPER_ADMIN: ['platform'],
      DISTRIBUTOR: ['distributor'],
      BRAND_HQ: ['brand', 'edgepos'],
      CORPORATE: ['corporate'],
    };
    const allowedPrefixes = prefixMap[platform];
    return all.filter((p) =>
      allowedPrefixes.some((prefix) => p.permissionKey.startsWith(`${prefix}.`)),
    );
  }, [matrixQuery.data, platform]);

  const users: TenantUserAccountRow[] = useMemo(
    () => (usersQuery.data?.authAccounts.success?.data ?? []).filter((u) => u.userType === userType),
    [usersQuery.data, userType],
  );

  // ─────────── Matrix assigned Set
  const [assignedOverride, setAssignedOverride] = useState<Map<string, boolean>>(new Map());
  const assigned = useMemo(() => {
    const set = new Set<string>();
    const pairs = matrixQuery.data?.rbacRolePermissionsMatrix.success?.data ?? [];
    const permById = new Map(permissions.map((p) => [p.id, p.permissionKey]));
    for (const pair of pairs) {
      const key = permById.get(pair.permissionId);
      if (!key) continue;
      set.add(`${pair.roleId}:${key}`);
    }
    for (const [k, v] of assignedOverride) {
      if (v) set.add(k);
      else set.delete(k);
    }
    return set;
  }, [matrixQuery.data, permissions, assignedOverride]);

  const [busyCell, setBusyCell] = useState<string | null>(null);
  const onToggleMatrix = useCallback(
    async (roleId: string, permissionKey: string, next: boolean) => {
      const cellKey = `${roleId}:${permissionKey}`;
      setBusyCell(cellKey);
      setAssignedOverride((prev) => {
        const n = new Map(prev);
        n.set(cellKey, next);
        return n;
      });
      try {
        if (next) await addPermission({ variables: { roleId, permissionKey } });
        else await removePermission({ variables: { roleId, permissionKey } });
        await refetchMatrix();
      } catch (err) {
        setAssignedOverride((prev) => {
          const n = new Map(prev);
          n.delete(cellKey);
          return n;
        });
        throw err;
      } finally {
        setAssignedOverride((prev) => {
          if (!prev.has(cellKey)) return prev;
          const n = new Map(prev);
          n.delete(cellKey);
          return n;
        });
        setBusyCell(null);
      }
    },
    [addPermission, removePermission, refetchMatrix],
  );

  // ─────────── Modal state
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<TenantUserAccountRow | null>(null);
  const [roleModal, setRoleModal] = useState<{ open: boolean; initial: RoleRow | null }>({
    open: false,
    initial: null,
  });
  const [permissionModal, setPermissionModal] = useState<{
    open: boolean;
    initial: PermissionRow | null;
  }>({ open: false, initial: null });
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [toastErr, setToastErr] = useState<string | null>(null);

  const runConfirm = useCallback(async () => {
    if (!confirmState) return;
    setConfirmBusy(true);
    setToastErr(null);
    try {
      await confirmState.action();
      setConfirmState(null);
    } catch (e) {
      setToastErr(e instanceof Error ? e.message : String(e));
    } finally {
      setConfirmBusy(false);
    }
  }, [confirmState]);

  // Envelope error extraction helper
  const envelopeError = (payload: unknown, root: string): string | null => {
    const node = (payload as Record<string, { error?: { message?: string } | null }> | undefined)?.[
      root
    ];
    return node?.error?.message ?? null;
  };

  // ─────────── Role CRUD handlers
  const handleRoleSubmit = useCallback(
    async (payload: CreateRoleInput | UpdateRoleInput) => {
      setToastErr(null);
      const isUpdate = 'roleId' in payload;
      const mut = isUpdate ? updateRoleMut : createRoleMut;
      const res = await mut({ variables: { input: payload } });
      const err = envelopeError(res.data, isUpdate ? 'rbacUpdateRole' : 'rbacCreateRole');
      if (err) {
        setToastErr(err);
        throw new Error(err);
      }
      await refetch();
    },
    [createRoleMut, updateRoleMut, refetch],
  );

  const requestRoleDelete = useCallback(
    (row: RoleRow) => {
      setConfirmState({
        title: t('tenantUser.roles.delete.title'),
        message: t('tenantUser.roles.delete.message'),
        confirmLabel: t('common.delete'),
        variant: 'danger',
        action: async () => {
          const res = await deleteRoleMut({ variables: { roleId: row.id } });
          const err = envelopeError(res.data, 'rbacDeleteRole');
          if (err) throw new Error(err);
          await refetch();
          await refetchMatrix();
        },
      });
    },
    [deleteRoleMut, refetch, refetchMatrix, t],
  );

  // ─────────── Permission CRUD handlers
  const handlePermissionSubmit = useCallback(
    async (payload: CreatePermissionInput | UpdatePermissionInput) => {
      setToastErr(null);
      const isUpdate = 'permissionId' in payload;
      const mut = isUpdate ? updatePermissionMut : createPermissionMut;
      const res = await mut({ variables: { input: payload } });
      const err = envelopeError(res.data, isUpdate ? 'rbacUpdatePermission' : 'rbacCreatePermission');
      if (err) {
        setToastErr(err);
        throw new Error(err);
      }
      await refetch();
    },
    [createPermissionMut, updatePermissionMut, refetch],
  );

  const requestPermissionDelete = useCallback(
    (row: PermissionRow) => {
      setConfirmState({
        title: t('tenantUser.permissions.delete.title'),
        message: t('tenantUser.permissions.delete.message'),
        confirmLabel: t('common.delete'),
        variant: 'danger',
        action: async () => {
          const res = await deletePermissionMut({ variables: { permissionId: row.id } });
          const err = envelopeError(res.data, 'rbacDeletePermission');
          if (err) throw new Error(err);
          await refetch();
          await refetchMatrix();
        },
      });
    },
    [deletePermissionMut, refetch, refetchMatrix, t],
  );

  if (!canRead) {
    return <LockedScreen />;
  }

  const matrixRoles: PermissionMatrixRole[] = roles.map((r) => ({
    id: r.id,
    roleCode: r.roleCode,
    roleName: pickLabel(locale, { name: r.roleName, nameKo: r.nameKo, nameEn: r.nameEn }, r.roleCode),
  }));
  const matrixPermissions: PermissionMatrixPermission[] = permissions.map((p) => ({
    permissionKey: p.permissionKey,
    description: pickLabel(
      locale,
      { name: p.name, nameKo: p.nameKo, nameEn: p.nameEn },
      p.permissionKey,
    ),
    domain: p.domain,
  }));

  const tabs = [
    { key: 'roles', label: t('tenantUser.tab.roles'), icon: <Shield size={14} /> },
    { key: 'matrix', label: t('tenantUser.tab.matrix'), icon: <Settings size={14} /> },
    { key: 'users', label: t('tenantUser.tab.users'), icon: <UsersIcon size={14} /> },
  ];

  const platformItems = [
    { value: 'SUPER_ADMIN' as const, label: t('tenantUser.platform.superAdmin') },
    { value: 'DISTRIBUTOR' as const, label: t('tenantUser.platform.distributor') },
    { value: 'BRAND_HQ' as const, label: t('tenantUser.platform.brandHq') },
    { value: 'CORPORATE' as const, label: t('tenantUser.platform.corporate') },
  ];

  const scopePlaceholder =
    platform === 'DISTRIBUTOR'
      ? t('tenantUser.scope.placeholder.distributor')
      : platform === 'BRAND_HQ'
      ? t('tenantUser.scope.placeholder.brand')
      : platform === 'CORPORATE'
      ? t('tenantUser.scope.placeholder.corporate')
      : '';

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={t('tenantUser.title')}
        description={t('tenantUser.description')}
        breadcrumbs={[{ label: t('nav.governance') }, { label: t('tenantUser.breadcrumb') }]}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <SegmentedControl<Platform>
            ariaLabel={t('tenantUser.platformSelectorLabel')}
            items={platformItems}
            value={platform}
            onChange={(v) => updateQuery({ platform: v, scopeId: null })}
          />
          {platform !== 'SUPER_ADMIN' && (
            <Select<string>
              value={scopeId || null}
              onChange={(v) => updateQuery({ scopeId: v })}
              options={scopeOptions}
              placeholder={scopePlaceholder}
              minWidth={260}
            />
          )}
        </div>
        <Tabs variant="pill" items={tabs} value={tab} onChange={(k) => updateQuery({ tab: k })} />
      </div>

      {activeError ? (
        <SectionCard title={t('common.error')}>
          <div className="text-sm text-fg-muted">{activeError.message}</div>
        </SectionCard>
      ) : null}
      {toastErr ? (
        <SectionCard title={t('common.error')}>
          <div className="text-sm text-red-600">{toastErr}</div>
        </SectionCard>
      ) : null}

      {activeLoading &&
      ((tab === 'roles' && !rolesQuery.data) ||
        (tab === 'matrix' && !matrixQuery.data) ||
        (tab === 'users' && !usersQuery.data)) ? (
        <Skeleton height={240} />
      ) : tab === 'roles' ? (
        <RolesTab
          roles={roles}
          locale={locale}
          canRbacWrite={canRbacWrite}
          onCreate={() => setRoleModal({ open: true, initial: null })}
          onEdit={(r) => setRoleModal({ open: true, initial: r })}
          onDelete={requestRoleDelete}
        />
      ) : tab === 'matrix' ? (
        <>
          <SectionCard
            title={t('tenantUser.matrix.title')}
            description={t('tenantUser.matrix.description')}
          >
            <PermissionMatrix
              roles={matrixRoles}
              permissions={matrixPermissions}
              assigned={assigned}
              editable={canRbacWrite}
              busyCell={busyCell}
              onToggle={onToggleMatrix}
              emptyLabel={t('common.empty')}
            />
          </SectionCard>
          <PermissionsListSection
            permissions={permissions}
            locale={locale}
            canRbacWrite={canRbacWrite}
            onCreate={() => setPermissionModal({ open: true, initial: null })}
            onEdit={(p) => setPermissionModal({ open: true, initial: p })}
            onDelete={requestPermissionDelete}
          />
        </>
      ) : (
        <UsersTab
          platform={platform}
          users={users}
          canWrite={canWrite}
          onCreate={() => setCreateUserOpen(true)}
          onOpenDetail={(row) => setDetailUser(row)}
        />
      )}

      {createUserOpen && (
        <TenantUserCreateModal
          open={createUserOpen}
          onClose={() => setCreateUserOpen(false)}
          platform={platform}
          scopeId={scopeId}
          roles={roles}
          locale={locale}
          onSubmit={async ({ loginId, displayName, password, email, roleCodes }) => {
            const res = await createAccount({
              variables: {
                input: {
                  loginId,
                  displayName,
                  password,
                  email: email || null,
                  userType,
                  distributorId: platform === 'DISTRIBUTOR' ? scopeId || null : null,
                  brandHqId: platform === 'BRAND_HQ' ? scopeId || null : null,
                  corporateId: platform === 'CORPORATE' ? scopeId || null : null,
                  roleCode: roleCodes[0] ?? '',
                },
              },
            });
            const createdId = (
              res.data as { createAuthAccount?: { success?: { data?: { id?: string } } } } | undefined
            )?.createAuthAccount?.success?.data?.id;
            if (createdId && roleCodes.length > 1) {
              await Promise.allSettled(
                roleCodes.slice(1).map((roleCode) =>
                  assignRole({
                    variables: {
                      userType,
                      userId: createdId,
                      roleCode,
                      scopeDistributorId: platform === 'DISTRIBUTOR' ? scopeId || null : null,
                      scopeBrandHqId: platform === 'BRAND_HQ' ? scopeId || null : null,
                      scopeCorporateId: platform === 'CORPORATE' ? scopeId || null : null,
                      scopeBranchId: null,
                      expiresAt: null,
                    },
                  }),
                ),
              );
            }
            await refetch();
            setCreateUserOpen(false);
          }}
        />
      )}

      {detailUser && (
        <TenantUserDetailModal
          open={!!detailUser}
          onClose={() => setDetailUser(null)}
          user={detailUser}
          roles={roles}
          platform={platform}
          scopeId={scopeId}
          locale={locale}
          canWrite={canWrite}
          onUpdate={async (input) => {
            await updateAccount({
              variables: { userType: detailUser.userType, id: detailUser.id, input },
            });
            await refetch();
          }}
          onSuspendRequest={() =>
            setConfirmState({
              title:
                detailUser.status === 'SUSPENDED'
                  ? t('tenantUser.detail.reactivate.confirm.title')
                  : t('tenantUser.detail.suspend.confirm.title'),
              message:
                detailUser.status === 'SUSPENDED'
                  ? t('tenantUser.detail.reactivate.confirm.message')
                  : t('tenantUser.detail.suspend.confirm.message'),
              confirmLabel: t('common.confirm'),
              action: async () => {
                await suspendAccount({
                  variables: {
                    userType: detailUser.userType,
                    id: detailUser.id,
                    nextStatus: detailUser.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
                    reason: null,
                  },
                });
                await refetch();
                setDetailUser(null);
              },
            })
          }
          onResetPasswordRequest={(pw) =>
            setConfirmState({
              title: t('tenantUser.detail.resetPassword.confirm.title'),
              message: t('tenantUser.detail.resetPassword.confirm.message'),
              confirmLabel: t('common.confirm'),
              action: async () => {
                await resetPassword({
                  variables: {
                    userType: detailUser.userType,
                    id: detailUser.id,
                    newPassword: pw,
                  },
                });
              },
            })
          }
          onDeleteRequest={() =>
            setConfirmState({
              title: t('tenantUser.detail.delete.confirm.title'),
              message: t('tenantUser.detail.delete.confirm.message'),
              confirmLabel: t('common.delete'),
              variant: 'danger',
              action: async () => {
                await deleteAccount({
                  variables: { userType: detailUser.userType, id: detailUser.id },
                });
                await refetch();
                setDetailUser(null);
              },
            })
          }
          onRevokeRequest={(assignment) =>
            setConfirmState({
              title: t('tenantUser.detail.revoke'),
              message: `${assignment.roleCode}`,
              confirmLabel: t('common.confirm'),
              variant: 'danger',
              action: async () => {
                await revokeRole({
                  variables: { assignmentId: assignment.id, reason: 'manual revoke' },
                });
                await refetch();
              },
            })
          }
          onAssignRole={async (roleCode) => {
            await assignRole({
              variables: {
                userType: detailUser.userType,
                userId: detailUser.id,
                roleCode,
                scopeDistributorId: platform === 'DISTRIBUTOR' ? scopeId || null : null,
                scopeBrandHqId: platform === 'BRAND_HQ' ? scopeId || null : null,
                scopeCorporateId: platform === 'CORPORATE' ? scopeId || null : null,
                scopeBranchId: null,
                expiresAt: null,
              },
            });
            await refetch();
          }}
        />
      )}

      {roleModal.open && (
        <RoleCreateEditModal
          open={roleModal.open}
          onClose={() => setRoleModal({ open: false, initial: null })}
          scope={roleScope}
          initial={roleModal.initial}
          onSubmit={handleRoleSubmit}
        />
      )}

      {permissionModal.open && (
        <PermissionCreateEditModal
          open={permissionModal.open}
          onClose={() => setPermissionModal({ open: false, initial: null })}
          initial={permissionModal.initial}
          defaultDomain={permissionDomain}
          onSubmit={handlePermissionSubmit}
        />
      )}

      {confirmState && (
        <ConfirmModal
          open={!!confirmState}
          onClose={() => (confirmBusy ? undefined : setConfirmState(null))}
          onConfirm={runConfirm}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={t('common.cancel')}
          variant={confirmState.variant}
          busy={confirmBusy}
        />
      )}
    </div>
  );
}

function RolesTab({
  roles,
  locale,
  canRbacWrite,
  onCreate,
  onEdit,
  onDelete,
}: {
  roles: RoleRow[];
  locale: string;
  canRbacWrite: boolean;
  onCreate: () => void;
  onEdit: (r: RoleRow) => void;
  onDelete: (r: RoleRow) => void;
}) {
  const { t } = useI18n();
  const columns: DataTableColumn<RoleRow>[] = [
    {
      key: 'code',
      header: t('tenantUser.roles.col.code'),
      width: '200px',
      render: (r) => <span className="font-mono text-[12px]">{r.roleCode}</span>,
    },
    {
      key: 'name',
      header: t('tenantUser.roles.col.name'),
      render: (r) => (
        <span className="font-medium text-fg">
          {pickLabel(locale, { name: r.roleName, nameKo: r.nameKo, nameEn: r.nameEn }, r.roleCode)}
        </span>
      ),
    },
    {
      key: 'scope',
      header: t('tenantUser.roles.col.scope'),
      width: '120px',
      render: (r) => (
        <Badge tone="info" variant="soft">
          {r.scope}
        </Badge>
      ),
    },
    {
      key: 'level',
      header: t('tenantUser.roles.col.level'),
      width: '70px',
      align: 'right',
      render: (r) => <span className="num font-mono text-[12px]">{r.hierarchyLevel}</span>,
    },
    {
      key: 'desc',
      header: t('tenantUser.roles.col.description'),
      render: (r) => (
        <span className="text-[12px] text-fg-muted">
          {pickDescription(
            locale,
            {
              description: r.description,
              descriptionKo: r.descriptionKo,
              descriptionEn: r.descriptionEn,
            },
            '—',
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('tenantUser.users.col.actions'),
      width: '160px',
      render: (r) => {
        const sys = r.isSystem === true;
        const title = sys ? t('tenantUser.roles.delete.systemBlocked') : undefined;
        return (
          <div className="flex gap-1" title={title}>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!canRbacWrite || sys}
              onClick={() => onEdit(r)}
            >
              {t('common.edit')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!canRbacWrite || sys}
              onClick={() => onDelete(r)}
            >
              {t('common.delete')}
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <SectionCard
      title={t('tenantUser.roles.title')}
      description={t('tenantUser.roles.description')}
      actions={
        canRbacWrite ? (
          <Button type="button" variant="primary" size="sm" startIcon={<Plus size={14} />} onClick={onCreate}>
            {t('tenantUser.roles.action.create')}
          </Button>
        ) : null
      }
    >
      <DataTable<RoleRow>
        rows={roles}
        columns={columns}
        rowKey={(r) => r.id}
        emptyState={t('common.empty')}
      />
    </SectionCard>
  );
}

function PermissionsListSection({
  permissions,
  locale,
  canRbacWrite,
  onCreate,
  onEdit,
  onDelete,
}: {
  permissions: PermissionRow[];
  locale: string;
  canRbacWrite: boolean;
  onCreate: () => void;
  onEdit: (p: PermissionRow) => void;
  onDelete: (p: PermissionRow) => void;
}) {
  const { t } = useI18n();
  const columns: DataTableColumn<PermissionRow>[] = [
    {
      key: 'key',
      header: t('tenantUser.permissions.form.permissionKey'),
      width: '240px',
      render: (p) => <span className="font-mono text-[12px]">{p.permissionKey}</span>,
    },
    {
      key: 'name',
      header: t('tenantUser.permissions.form.name'),
      render: (p) => (
        <span className="font-medium text-fg">
          {pickLabel(locale, { name: p.name, nameKo: p.nameKo, nameEn: p.nameEn }, p.permissionKey)}
        </span>
      ),
    },
    {
      key: 'domain',
      header: t('tenantUser.permissions.form.domain'),
      width: '120px',
      render: (p) => <span className="text-[12px] text-fg-muted">{p.domain ?? '—'}</span>,
    },
    {
      key: 'desc',
      header: t('tenantUser.permissions.form.description'),
      render: (p) => (
        <span className="text-[12px] text-fg-muted">
          {pickDescription(
            locale,
            {
              description: p.description,
              descriptionKo: p.descriptionKo,
              descriptionEn: p.descriptionEn,
            },
            '—',
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('tenantUser.users.col.actions'),
      width: '160px',
      render: (p) => {
        const sys = p.isSystem === true;
        const title = sys ? t('tenantUser.permissions.delete.systemBlocked') : undefined;
        return (
          <div className="flex gap-1" title={title}>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!canRbacWrite || sys}
              onClick={() => onEdit(p)}
            >
              {t('common.edit')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!canRbacWrite || sys}
              onClick={() => onDelete(p)}
            >
              {t('common.delete')}
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <SectionCard
      title={t('tenantUser.permissions.title')}
      description={t('tenantUser.permissions.description')}
      actions={
        canRbacWrite ? (
          <Button type="button" variant="primary" size="sm" startIcon={<Plus size={14} />} onClick={onCreate}>
            {t('tenantUser.permissions.action.create')}
          </Button>
        ) : null
      }
    >
      <DataTable<PermissionRow>
        rows={permissions}
        columns={columns}
        rowKey={(p) => p.id}
        emptyState={t('common.empty')}
      />
    </SectionCard>
  );
}

function UsersTab({
  platform,
  users,
  canWrite,
  onCreate,
  onOpenDetail,
}: {
  platform: Platform;
  users: TenantUserAccountRow[];
  canWrite: boolean;
  onCreate: () => void;
  onOpenDetail: (row: TenantUserAccountRow) => void;
}) {
  const { t } = useI18n();
  const columns: DataTableColumn<TenantUserAccountRow>[] = [
    {
      key: 'loginId',
      header: t('tenantUser.users.col.loginId'),
      width: '180px',
      render: (r) => <span className="font-mono text-[12px]">{r.loginId}</span>,
    },
    {
      key: 'name',
      header: t('tenantUser.users.col.name'),
      render: (r) => <span className="font-medium text-fg">{r.displayName}</span>,
    },
    {
      key: 'status',
      header: t('tenantUser.users.col.status'),
      width: '120px',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: t('tenantUser.users.col.actions'),
      width: '140px',
      render: (r) => (
        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenDetail(r)}>
          {t('tenantUser.users.action.openDetail')}
        </Button>
      ),
    },
  ];
  return (
    <SectionCard
      title={`${t(`tenantUser.platform.${platformToI18n(platform)}`)} · ${t('tenantUser.users.title')}`}
      description={t('tenantUser.users.description')}
      actions={
        canWrite ? (
          <Button type="button" variant="primary" size="sm" startIcon={<Plus size={14} />} onClick={onCreate}>
            {t('tenantUser.users.action.create')}
          </Button>
        ) : null
      }
    >
      <DataTable<TenantUserAccountRow>
        rows={users}
        columns={columns}
        rowKey={(r) => r.id}
        emptyState={t('common.empty')}
      />
    </SectionCard>
  );
}

// ─────────────────────────── Create Modal ───────────────────────────

function TenantUserCreateModal({
  open,
  onClose,
  platform,
  scopeId,
  roles,
  locale,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform;
  scopeId: string;
  roles: RoleRow[];
  locale: string;
  onSubmit: (v: {
    loginId: string;
    displayName: string;
    password: string;
    email: string;
    roleCodes: string[];
  }) => Promise<void>;
}) {
  const { t } = useI18n();
  const [loginId, setLoginId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [roleCodes, setRoleCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const canSubmit =
    loginId.length > 0 &&
    displayName.length > 0 &&
    password.length >= 8 &&
    roleCodes.length > 0 &&
    (platform === 'SUPER_ADMIN' || scopeId.length > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('tenantUser.create.title')}
      description={t('tenantUser.create.description')}
      width={560}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canSubmit || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onSubmit({ loginId, displayName, password, email, roleCodes });
              } finally {
                setBusy(false);
              }
            }}
          >
            {t('tenantUser.create.submit')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={t('tenantUser.create.loginId')}>
          <Input value={loginId} onChange={(e) => setLoginId(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.create.displayName')}>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.create.email')}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.create.password')}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.create.roles')}>
          <div className="flex flex-col gap-1">
            {roles.length === 0 ? (
              <div className="text-[12px] text-fg-muted">{t('common.empty')}</div>
            ) : (
              roles.map((r) => {
                const checked = roleCodes.includes(r.roleCode);
                const label = pickLabel(
                  locale,
                  { name: r.roleName, nameKo: r.nameKo, nameEn: r.nameEn },
                  r.roleCode,
                );
                return (
                  <label key={r.id} className="flex items-center gap-2 text-[12.5px]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setRoleCodes((prev) =>
                          e.target.checked
                            ? [...prev, r.roleCode]
                            : prev.filter((c) => c !== r.roleCode),
                        );
                      }}
                    />
                    <span className="font-mono">{r.roleCode}</span>
                    <span className="text-fg-muted">· {label}</span>
                  </label>
                );
              })
            )}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

// ─────────────────────────── Detail Modal ───────────────────────────

function TenantUserDetailModal({
  open,
  onClose,
  user,
  roles,
  platform,
  scopeId,
  locale,
  canWrite,
  onUpdate,
  onSuspendRequest,
  onResetPasswordRequest,
  onDeleteRequest,
  onRevokeRequest,
  onAssignRole,
}: {
  open: boolean;
  onClose: () => void;
  user: TenantUserAccountRow;
  roles: RoleRow[];
  platform: Platform;
  scopeId: string;
  locale: string;
  canWrite: boolean;
  onUpdate: (input: { displayName?: string | null; email?: string | null }) => Promise<void>;
  onSuspendRequest: () => void;
  onResetPasswordRequest: (pw: string) => void;
  onDeleteRequest: () => void;
  onRevokeRequest: (assignment: AssignmentRow) => void;
  onAssignRole: (roleCode: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email ?? '');
  const [busy, setBusy] = useState(false);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string | null>(null);
  const [pwInput, setPwInput] = useState('');

  const [loadAssignments, assignmentsState] = useLazyQuery<RbacUserAssignmentsData>(
    RBAC_USER_ASSIGNMENTS_LAZY_QUERY,
  );

  useEffect(() => {
    if (open) {
      loadAssignments({ variables: { userType: user.userType, userId: user.id } });
    }
  }, [open, user.id, user.userType, loadAssignments]);

  const assignments: AssignmentRow[] = assignmentsState.data?.rbacUserAssignments.success?.data ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('tenantUser.detail.title')}
      description={`${user.loginId} · ${user.userType}`}
      width={620}
      footer={
        <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={busy}>
          {t('common.close')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Field label={t('tenantUser.detail.displayName')}>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!canWrite}
            />
          </Field>
          <Field label={t('tenantUser.detail.email')}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!canWrite}
            />
          </Field>
          <div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!canWrite || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onUpdate({ displayName, email: email || null });
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t('tenantUser.detail.saveBasic')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-[12px] font-semibold text-fg">
            {t('tenantUser.detail.statusSection')}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canWrite}
              onClick={onSuspendRequest}
            >
              {user.status === 'SUSPENDED'
                ? t('tenantUser.users.action.reactivate')
                : t('tenantUser.users.action.suspend')}
            </Button>
            <Input
              type="password"
              value={pwInput}
              placeholder={t('tenantUser.users.promptNewPassword')}
              onChange={(e) => setPwInput(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canWrite || pwInput.length < 8}
              onClick={() => {
                onResetPasswordRequest(pwInput);
                setPwInput('');
              }}
            >
              {t('tenantUser.users.action.resetPassword')}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={!canWrite}
              onClick={onDeleteRequest}
            >
              {t('tenantUser.users.action.delete')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-[12px] font-semibold text-fg">
            {t('tenantUser.detail.assignments')}
          </div>
          {assignments.length === 0 ? (
            <div className="text-[12px] text-fg-muted">{t('common.empty')}</div>
          ) : (
            <div className="flex flex-col gap-1">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2 text-[12.5px] border border-border rounded px-2 py-1"
                >
                  <span className="font-mono">{a.roleCode}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!canWrite}
                    onClick={() => onRevokeRequest(a)}
                  >
                    {t('tenantUser.detail.revoke')}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 text-[12px] font-semibold text-fg">
            {t('tenantUser.detail.grantRole')}
          </div>
          <div className="flex gap-2 items-center">
            <Select<string>
              value={selectedRoleCode}
              onChange={(v) => setSelectedRoleCode(v)}
              options={roles.map((r) => ({
                value: r.roleCode,
                label: pickLabel(
                  locale,
                  { name: r.roleName, nameKo: r.nameKo, nameEn: r.nameEn },
                  r.roleCode,
                ),
              }))}
              minWidth={260}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={
                !canWrite ||
                !selectedRoleCode ||
                (platform !== 'SUPER_ADMIN' && !scopeId)
              }
              onClick={async () => {
                if (!selectedRoleCode) return;
                setBusy(true);
                try {
                  await onAssignRole(selectedRoleCode);
                  await assignmentsState.refetch?.();
                  setSelectedRoleCode(null);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t('tenantUser.detail.grantRoleButton')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  );
}

function platformToI18n(p: Platform): string {
  switch (p) {
    case 'SUPER_ADMIN':
      return 'superAdmin';
    case 'DISTRIBUTOR':
      return 'distributor';
    case 'BRAND_HQ':
      return 'brandHq';
    case 'CORPORATE':
      return 'corporate';
  }
}
