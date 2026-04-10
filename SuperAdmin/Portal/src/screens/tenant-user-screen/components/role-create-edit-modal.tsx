'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import type { RoleRow, CreateRoleInput, UpdateRoleInput } from '@graphql/queries/governance';

interface Props {
  open: boolean;
  onClose: () => void;
  scope: string;
  initial?: RoleRow | null; // null = create mode
  onSubmit: (payload: CreateRoleInput | UpdateRoleInput) => Promise<void>;
}

export function RoleCreateEditModal({ open, onClose, scope, initial, onSubmit }: Props) {
  const { t } = useI18n();
  const editing = !!initial;
  const [roleCode, setRoleCode] = useState(initial?.roleCode ?? '');
  const [roleName, setRoleName] = useState(initial?.roleName ?? '');
  const [nameKo, setNameKo] = useState(initial?.nameKo ?? '');
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [descriptionKo, setDescriptionKo] = useState(initial?.descriptionKo ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn ?? '');
  const [hierarchyLevel, setHierarchyLevel] = useState(String(initial?.hierarchyLevel ?? 50));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit =
    (editing || roleCode.trim().length > 0) && roleName.trim().length > 0 && !busy;

  const handleSubmit = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (editing && initial) {
        await onSubmit({
          roleId: initial.id,
          roleName: roleName || null,
          nameKo: nameKo || null,
          nameEn: nameEn || null,
          hierarchyLevel: Number(hierarchyLevel) || null,
          description: description || null,
          descriptionKo: descriptionKo || null,
          descriptionEn: descriptionEn || null,
        });
      } else {
        await onSubmit({
          roleCode: roleCode.trim(),
          roleName: roleName.trim(),
          scope,
          nameKo: nameKo || null,
          nameEn: nameEn || null,
          hierarchyLevel: Number(hierarchyLevel) || null,
          description: description || null,
          descriptionKo: descriptionKo || null,
          descriptionEn: descriptionEn || null,
        });
      }
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('tenantUser.roles.action.edit') : t('tenantUser.roles.action.create')}
      width={560}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="primary" size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={t('tenantUser.roles.form.roleCode')}>
          <Input value={roleCode} onChange={(e) => setRoleCode(e.target.value)} disabled={editing} />
        </Field>
        <Field label={t('tenantUser.roles.form.scope')}>
          <Input value={scope} disabled />
        </Field>
        <Field label={t('tenantUser.roles.form.name')}>
          <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.roles.form.nameKo')}>
          <Input value={nameKo} onChange={(e) => setNameKo(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.roles.form.nameEn')}>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.roles.form.hierarchyLevel')}>
          <Input
            type="number"
            value={hierarchyLevel}
            onChange={(e) => setHierarchyLevel(e.target.value)}
          />
        </Field>
        <Field label={t('tenantUser.roles.form.description')}>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.roles.form.descriptionKo')}>
          <Input value={descriptionKo} onChange={(e) => setDescriptionKo(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.roles.form.descriptionEn')}>
          <Input value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} />
        </Field>
        {err && <div className="text-[12px] text-red-600">{err}</div>}
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
