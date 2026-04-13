'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { Search, UserPlus, UserMinus, RefreshCw, Star } from 'lucide-react';
import { SectionCard, Button, Badge, Input, Skeleton } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { toast } from 'sonner';
import {
  RBAC_SUPERADMIN_USERS_QUERY,
  RBAC_USER_ASSIGNMENTS_QUERY,
  RBAC_ASSIGN_ROLE_MUTATION,
  RBAC_UNASSIGN_ROLE_MUTATION,
  type RbacRoleRow,
  type UserAssignmentsData,
  type UserAssignmentRow,
  type SuperAdminUsersData,
  type SuperAdminUserRow,
} from '@graphql/queries/rbac';

/* ── constants ── */

const SUPER_ADMIN_ROLE_CODE = 'SA_SUPER_ADMIN';

/* ── helpers ── */

function statusTone(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'success' as const;
    case 'SUSPENDED':
    case 'LOCKED':
      return 'danger' as const;
    case 'PENDING':
      return 'warning' as const;
    default:
      return 'neutral' as const;
  }
}

/* ── component ── */

interface Props {
  roles: RbacRoleRow[];
}

export function UserAssignmentTab({ roles }: Props) {
  const { t } = useI18n();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    () => roles[0]?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState('');

  /* ── queries ── */

  const client = useApolloClient();

  const {
    data: usersRaw,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery<SuperAdminUsersData>(RBAC_SUPERADMIN_USERS_QUERY, {
    variables: { userType: 'SUPER_ADMIN' },
  });

  const [allAssignments, setAllAssignments] = useState<UserAssignmentRow[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  const allUsers = (usersRaw as { authAccounts?: { success?: { data?: SuperAdminUserRow[] } } })?.authAccounts?.success?.data ?? [];

  const fetchAllAssignments = useCallback(async () => {
    if (allUsers.length === 0) return;
    setAssignmentsLoading(true);
    try {
      const results = await Promise.all(
        allUsers.map((user) =>
          client.query<UserAssignmentsData>({
            query: RBAC_USER_ASSIGNMENTS_QUERY,
            variables: { userType: 'SUPER_ADMIN', userId: user.id },
            fetchPolicy: 'network-only',
          }),
        ),
      );
      const merged: UserAssignmentRow[] = results.flatMap(
        (r) => r.data?.rbacUserAssignments?.success?.data ?? [],
      );
      setAllAssignments(merged);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [allUsers, client]);

  useEffect(() => {
    void fetchAllAssignments();
  }, [fetchAllAssignments]);

  const refetchAssignments = useCallback(async () => {
    await fetchAllAssignments();
  }, [fetchAllAssignments]);

  /* ── mutations ── */

  const [assignRole, { loading: assigning }] = useMutation(RBAC_ASSIGN_ROLE_MUTATION);
  const [unassignRole, { loading: unassigning }] = useMutation(RBAC_UNASSIGN_ROLE_MUTATION);
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  const assignedForRole: UserAssignmentRow[] = useMemo(
    () =>
      selectedRoleId
        ? allAssignments.filter((a) => a.roleId === selectedRoleId && a.status === 'ACTIVE')
        : [],
    [allAssignments, selectedRoleId],
  );

  const assignedUserIds = useMemo(
    () => new Set(assignedForRole.map((a) => a.userId)),
    [assignedForRole],
  );

  /** Total ACTIVE SA_SUPER_ADMIN assignments across all users (for last-admin protection). */
  const superAdminActiveCount = useMemo(() => {
    const saRole = roles.find((r) => r.roleCode === SUPER_ADMIN_ROLE_CODE);
    if (!saRole) return 0;
    return allAssignments.filter(
      (a) => a.roleId === saRole.id && a.status === 'ACTIVE',
    ).length;
  }, [allAssignments, roles]);

  const filterUser = (user: SuperAdminUserRow) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(q) ||
      user.loginId.toLowerCase().includes(q) ||
      (user.email?.toLowerCase().includes(q) ?? false)
    );
  };

  const assignedUsers: SuperAdminUserRow[] = useMemo(
    () => allUsers.filter((u) => assignedUserIds.has(u.id) && filterUser(u)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allUsers, assignedUserIds, searchQuery],
  );

  const availableUsers: SuperAdminUserRow[] = useMemo(
    () => allUsers.filter((u) => !assignedUserIds.has(u.id) && filterUser(u)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allUsers, assignedUserIds, searchQuery],
  );

  /* ── handlers ── */

  const handleAssign = async (user: SuperAdminUserRow) => {
    if (!selectedRole) return;
    try {
      const res = await assignRole({
        variables: {
          userType: 'SUPER_ADMIN',
          userId: user.id,
          roleCode: selectedRole.roleCode,
        },
      });
      if (res.data?.rbacAssignRole?.error) {
        toast.error(res.data.rbacAssignRole.error.message);
        return;
      }
      toast.success(t('settings.rbac.users.assignSuccess'));
      await refetchAssignments();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleUnassign = async (assignment: UserAssignmentRow) => {
    if (!selectedRole) return;

    /* protection: cannot unassign the last SUPER_ADMIN user */
    if (
      selectedRole.roleCode === SUPER_ADMIN_ROLE_CODE &&
      superAdminActiveCount <= 1
    ) {
      toast.error(t('settings.rbac.users.cannotRemoveLastSuperAdmin'));
      return;
    }

    try {
      const res = await unassignRole({
        variables: { assignmentId: assignment.id, reason: 'ADMIN_REVOKE' },
      });
      if (res.data?.rbacRevokeRoleAssignment?.error) {
        toast.error(res.data.revokeRole.error.message);
        return;
      }
      toast.success(t('settings.rbac.users.unassignSuccess'));
      await refetchAssignments();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refetchUsers(), refetchAssignments()]);
  };

  /* ── loading state ── */

  const loading = usersLoading || assignmentsLoading;
  const mutating = assigning || unassigning;

  /* ── sub-components ── */

  const UserCard = ({
    user,
    action,
  }: {
    user: SuperAdminUserRow;
    action: React.ReactNode;
  }) => (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--surface-1)]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* avatar placeholder */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full text-[11px] font-bold"
        style={{
          width: 32,
          height: 32,
          background: 'var(--surface-1)',
          color: 'var(--fg-muted)',
        }}
      >
        {user.displayName.charAt(0).toUpperCase()}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-fg truncate">
            {user.displayName}
          </span>
          <Badge tone={statusTone(user.status)} size="sm">
            {user.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-fg-subtle font-mono truncate">
            {user.loginId}
          </span>
          {user.email && (
            <>
              <span className="text-[11px] text-fg-subtle">|</span>
              <span className="text-[11px] text-fg-subtle truncate">
                {user.email}
              </span>
            </>
          )}
        </div>
      </div>

      {/* action button */}
      <div className="shrink-0">{action}</div>
    </div>
  );

  /* ── render ── */

  return (
    <div className="flex flex-col gap-4">
      {/* Role selector row */}
      <div className="flex items-center gap-2 flex-wrap">
        {roles
          .filter((r) => r.scope === 'PLATFORM')
          .map((role) => {
            const isSelected = role.id === selectedRoleId;
            const assignCount = allAssignments.filter(
              (a) => a.roleId === role.id && a.status === 'ACTIVE',
            ).length;

            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap"
                style={{
                  background: isSelected ? 'var(--primary)' : 'var(--surface-1)',
                  color: isSelected ? '#fff' : 'var(--fg-muted)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                }}
              >
                {role.isSystem && (role.permissions as string[])?.includes('*') && (
                  <Star size={10} className={isSelected ? 'text-amber-200' : 'text-amber-500'} />
                )}
                {role.roleNameKo ?? role.roleName}
                <span
                  className="ml-0.5 text-[10px] rounded-full px-1.5 py-0.5"
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--surface)',
                    color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--fg-subtle)',
                  }}
                >
                  {assignCount}
                </span>
              </button>
            );
          })}

        {/* refresh */}
        <Button
          variant="ghost"
          size="sm"
          startIcon={<RefreshCw size={14} />}
          onClick={handleRefresh}
          disabled={loading}
          style={{ marginLeft: 'auto' }}
        >
          {t('action.refresh')}
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder={t('settings.rbac.users.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startIcon={<Search size={14} />}
        />
      </div>

      {/* Two-column panels */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((col) => (
            <SectionCard
              key={col}
              title=""
              description=""
            >
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={52} />
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : !selectedRole ? (
        <div className="p-6 text-center text-[13px] text-fg-muted">
          {t('settings.rbac.users.selectRolePrompt')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Assigned users */}
          <SectionCard
            title={t('settings.rbac.users.assignedTitle')}
            description={`${t('settings.rbac.users.assignedDesc')} — ${selectedRole.roleNameKo ?? selectedRole.roleName}`}
          >
            <div
              className="flex flex-col"
              style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}
            >
              {assignedUsers.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-fg-muted">
                  {searchQuery
                    ? t('settings.rbac.users.noSearchResults')
                    : t('settings.rbac.users.noAssignedUsers')}
                </div>
              ) : (
                assignedUsers.map((user) => {
                  const assignment = assignedForRole.find((a) => a.userId === user.id);
                  if (!assignment) return null;

                  const isLastSuperAdmin =
                    selectedRole.roleCode === SUPER_ADMIN_ROLE_CODE &&
                    superAdminActiveCount <= 1;

                  return (
                    <UserCard
                      key={user.id}
                      user={user}
                      action={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="whitespace-nowrap"
                          startIcon={<UserMinus size={14} />}
                          disabled={mutating || isLastSuperAdmin}
                          onClick={() => handleUnassign(assignment)}
                          title={
                            isLastSuperAdmin
                              ? t('settings.rbac.users.cannotRemoveLastSuperAdmin')
                              : t('settings.rbac.users.unassign')
                          }
                          style={{
                            color: isLastSuperAdmin
                              ? 'var(--fg-subtle)'
                              : 'var(--danger)',
                          }}
                        >
                          {t('settings.rbac.users.unassign')}
                        </Button>
                      }
                    />
                  );
                })
              )}
            </div>
          </SectionCard>

          {/* Right: Available users */}
          <SectionCard
            title={t('settings.rbac.users.availableTitle')}
            description={`${t('settings.rbac.users.availableDesc')} — ${selectedRole.roleNameKo ?? selectedRole.roleName}`}
          >
            <div
              className="flex flex-col"
              style={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}
            >
              {availableUsers.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-fg-muted">
                  {searchQuery
                    ? t('settings.rbac.users.noSearchResults')
                    : t('settings.rbac.users.allUsersAssigned')}
                </div>
              ) : (
                availableUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    action={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="whitespace-nowrap"
                        startIcon={<UserPlus size={14} />}
                        disabled={mutating}
                        onClick={() => handleAssign(user)}
                        title={t('settings.rbac.users.assign')}
                        style={{ color: 'var(--primary)' }}
                      >
                        {t('settings.rbac.users.assign')}
                      </Button>
                    }
                  />
                ))
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
