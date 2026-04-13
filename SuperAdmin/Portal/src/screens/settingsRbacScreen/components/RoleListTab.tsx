'use client';

import { useState, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Plus, Pencil, Trash2, Search, Shield, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Badge, Input, Modal, DataTable, type DataTableColumn } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import {
  RBAC_CREATE_ROLE_MUTATION,
  RBAC_UPDATE_ROLE_MUTATION,
  RBAC_DELETE_ROLE_MUTATION,
  type RbacRoleRow,
  type RbacCreateRoleData,
  type RbacUpdateRoleData,
  type RbacDeleteRoleData,
} from '@graphql/queries/rbac';

/* ── Scope config ── */

/** SuperAdmin Portal 은 PLATFORM 스코프 역할만 관리한다. BRAND_HQ/BRANCH/CORPORATE 는 각 프로젝트 관리자가 관리. */
const FIXED_SCOPE = 'PLATFORM' as const;

/* ── Form state ── */

interface RoleFormState {
  roleName: string;
  roleNameKo: string;
  roleNameEn: string;
  description: string;
  descriptionKo: string;
  descriptionEn: string;
}

const EMPTY_FORM: RoleFormState = {
  roleName: '',
  roleNameKo: '',
  roleNameEn: '',
  description: '',
  descriptionKo: '',
  descriptionEn: '',
};

/* ── Props ── */

interface Props {
  roles: RbacRoleRow[];
  onRefetch: () => Promise<void>;
}

export function RoleListTab({ roles, onRefetch }: Props) {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  /* modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RbacRoleRow | null>(null);
  const [form, setForm] = useState<RoleFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  /* delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<RbacRoleRow | null>(null);

  /* mutations */
  const [createRole, { loading: creating }] = useMutation<RbacCreateRoleData>(RBAC_CREATE_ROLE_MUTATION);
  const [updateRole, { loading: updating }] = useMutation<RbacUpdateRoleData>(RBAC_UPDATE_ROLE_MUTATION);
  const [deleteRole, { loading: deleting }] = useMutation<RbacDeleteRoleData>(RBAC_DELETE_ROLE_MUTATION);

  const busy = creating || updating;

  /* ── Helpers ── */

  const pickName = (role: RbacRoleRow): string => {
    if (locale === 'ko' && role.roleNameKo) return role.roleNameKo;
    if (locale === 'en' && role.roleNameEn) return role.roleNameEn;
    return role.roleName;
  };

  const pickDescription = (role: RbacRoleRow): string | null => {
    if (locale === 'ko' && role.descriptionKo) return role.descriptionKo;
    if (locale === 'en' && role.descriptionEn) return role.descriptionEn;
    return role.description ?? null;
  };

  /* ── Filter ── */

  const platformRoles = roles.filter((r) => r.scope === FIXED_SCOPE);

  const filtered = platformRoles.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.roleName.toLowerCase().includes(q) ||
      r.roleCode.toLowerCase().includes(q) ||
      (r.roleNameKo ?? '').toLowerCase().includes(q) ||
      (r.roleNameEn ?? '').toLowerCase().includes(q)
    );
  });

  /* ── Table columns ── */

  const roleColumns: DataTableColumn<RbacRoleRow>[] = [
    {
      key: 'roleName',
      header: t('settings.rbac.form.roleName'),
      render: (role) => (
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-fg-subtle shrink-0" />
          <span className="text-[13px] font-semibold text-fg whitespace-nowrap">{pickName(role)}</span>
        </div>
      ),
    },
    {
      key: 'isSystem',
      header: t('settings.rbac.systemRole'),
      align: 'center',
      render: (role) =>
        role.isSystem ? (
          <Badge tone="warning" size="sm">
            <Star size={10} />
            {t('settings.rbac.systemRole')}
          </Badge>
        ) : (
          <span className="text-[11px] text-fg-subtle">—</span>
        ),
    },
    {
      key: 'permissions',
      header: t('settings.rbac.permissions'),
      align: 'center',
      render: (role) => {
        const hasWildcard = role.permissions?.includes('*');
        const permCount = role.permissions?.length ?? 0;
        return (
          <span className="text-[12px] text-fg-subtle whitespace-nowrap">
            {hasWildcard ? t('settings.rbac.allPermissions') : `${permCount} ${t('settings.rbac.permissions')}`}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (role) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" disabled={role.isSystem} onClick={() => openEditModal(role)} startIcon={<Pencil size={13} />}>
            {t('common.edit')}
          </Button>
          <Button variant="ghost" size="sm" disabled={role.isSystem} onClick={() => setDeleteTarget(role)} startIcon={<Trash2 size={13} className="text-red-500" />}>
            <span className="text-red-500">{t('common.delete')}</span>
          </Button>
        </div>
      ),
    },
  ];

  /* ── Open create/edit modal ── */

  const openCreateModal = () => {
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (role: RbacRoleRow) => {
    setEditingRole(role);
    setForm({
      roleName: role.roleName,
      roleNameKo: role.roleNameKo ?? '',
      roleNameEn: role.roleNameEn ?? '',
      description: role.description ?? '',
      descriptionKo: role.descriptionKo ?? '',
      descriptionEn: role.descriptionEn ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  /* ── Submit create/edit ── */

  const canSubmit = form.roleName.trim().length > 0 && !busy;

  const handleSubmit = async () => {
    setFormError(null);

    if (editingRole) {
      try {
        const res = await updateRole({
          variables: {
            input: {
              roleId: editingRole.id,
              roleName: form.roleName.trim(),
              roleNameKo: form.roleNameKo.trim() || null,
              roleNameEn: form.roleNameEn.trim() || null,
              scope: FIXED_SCOPE,
              description: form.description.trim() || null,
              descriptionKo: form.descriptionKo.trim() || null,
              descriptionEn: form.descriptionEn.trim() || null,
            },
          },
        });
        const error = res.data?.rbacUpdateRole?.error;
        if (error) {
          setFormError(error.message ?? error.code);
          return;
        }
        toast.success(t('settings.rbac.toast.roleUpdated'));
        closeModal();
        await onRefetch();
      } catch (e) {
        setFormError(e instanceof Error ? e.message : String(e));
      }
    } else {
      try {
        const res = await createRole({
          variables: {
            input: {
              roleName: form.roleName.trim(),
              roleNameKo: form.roleNameKo.trim() || null,
              roleNameEn: form.roleNameEn.trim() || null,
              scope: FIXED_SCOPE,
              description: form.description.trim() || null,
              descriptionKo: form.descriptionKo.trim() || null,
              descriptionEn: form.descriptionEn.trim() || null,
            },
          },
        });
        const error = res.data?.rbacCreateRole?.error;
        if (error) {
          setFormError(error.message ?? error.code);
          return;
        }
        toast.success(t('settings.rbac.toast.roleCreated'));
        closeModal();
        await onRefetch();
      } catch (e) {
        setFormError(e instanceof Error ? e.message : String(e));
      }
    }
  };

  /* ── Delete ── */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteRole({ variables: { roleId: deleteTarget.id } });
      const error = res.data?.rbacDeleteRole?.error;
      if (error) {
        toast.error(error.message ?? error.code);
        return;
      }
      toast.success(t('settings.rbac.toast.roleDeleted'));
      setDeleteTarget(null);
      await onRefetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    }
  };

  /* ── Render ── */

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder={t('settings.rbac.searchRoles')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search size={14} />}
          />
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal} startIcon={<Plus size={14} />}>
          {t('settings.rbac.createRole')}
        </Button>
      </div>

      {/* DataTable */}
      <DataTable<RbacRoleRow>
        columns={roleColumns}
        rows={filtered}
        rowKey={(r) => r.id}
        compact
        emptyState={searchQuery ? t('settings.rbac.noRolesMatch') : t('settings.rbac.noRoles')}
      />

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingRole ? t('settings.rbac.editRole') : t('settings.rbac.createRole')}
        width={520}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={busy}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" disabled={!canSubmit} loading={busy} onClick={() => void handleSubmit()}>
              {editingRole ? t('common.save') : t('common.create')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label={t('settings.rbac.form.roleName')}>
            <Input
              value={form.roleName}
              onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
              placeholder={t('settings.rbac.form.roleNamePlaceholder')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('settings.rbac.form.roleNameKo')}>
              <Input
                value={form.roleNameKo}
                onChange={(e) => setForm((f) => ({ ...f, roleNameKo: e.target.value }))}
              />
            </Field>
            <Field label={t('settings.rbac.form.roleNameEn')}>
              <Input
                value={form.roleNameEn}
                onChange={(e) => setForm((f) => ({ ...f, roleNameEn: e.target.value }))}
              />
            </Field>
          </div>

          <Field label={t('settings.rbac.form.description')}>
            <textarea
              className="w-full rounded-md border bg-surface-1 p-3 text-[13px] text-fg"
              style={{ borderColor: 'var(--border)', minHeight: 72, resize: 'vertical' }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t('settings.rbac.form.descriptionPlaceholder')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t('settings.rbac.form.descriptionKo')}>
              <textarea
                className="w-full rounded-md border bg-surface-1 p-3 text-[13px] text-fg"
                style={{ borderColor: 'var(--border)', minHeight: 72, resize: 'vertical' }}
                value={form.descriptionKo}
                onChange={(e) => setForm((f) => ({ ...f, descriptionKo: e.target.value }))}
              />
            </Field>
            <Field label={t('settings.rbac.form.descriptionEn')}>
              <textarea
                className="w-full rounded-md border bg-surface-1 p-3 text-[13px] text-fg"
                style={{ borderColor: 'var(--border)', minHeight: 72, resize: 'vertical' }}
                value={form.descriptionEn}
                onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              />
            </Field>
          </div>

          {formError && <div className="text-[12px] text-red-600">{formError}</div>}
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('settings.rbac.deleteRole')}
        width={440}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={() => void handleDelete()}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-fg-muted">
            {t('settings.rbac.deleteRoleConfirm')} <strong>{deleteTarget?.roleName ?? ''}</strong>?
          </p>
          <div
            className="flex items-center gap-2 rounded-lg p-3"
            style={{ backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <Shield size={14} className="text-fg-subtle" />
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-fg">{deleteTarget?.roleName}</span>
              <span className="text-[11px] font-mono text-fg-subtle">{deleteTarget?.roleCode}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/** label + children field wrapper. Uses <div> to avoid Select click propagation issues inside <label>. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-fg-muted">{label}</span>
      {children}
    </div>
  );
}
