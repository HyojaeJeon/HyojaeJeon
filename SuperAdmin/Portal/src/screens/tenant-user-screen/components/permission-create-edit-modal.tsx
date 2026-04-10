'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import type {
  PermissionRow,
  CreatePermissionInput,
  UpdatePermissionInput,
} from '@graphql/queries/governance';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: PermissionRow | null;
  defaultDomain?: string;
  onSubmit: (payload: CreatePermissionInput | UpdatePermissionInput) => Promise<void>;
}

export function PermissionCreateEditModal({ open, onClose, initial, defaultDomain, onSubmit }: Props) {
  const { t } = useI18n();
  const editing = !!initial;
  const [permissionKey, setPermissionKey] = useState(initial?.permissionKey ?? '');
  const [domain, setDomain] = useState(initial?.domain ?? defaultDomain ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [nameKo, setNameKo] = useState(initial?.nameKo ?? '');
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [descriptionKo, setDescriptionKo] = useState(initial?.descriptionKo ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit =
    (editing || (permissionKey.trim().length > 0 && domain.trim().length > 0)) && !busy;

  const handleSubmit = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (editing && initial) {
        await onSubmit({
          permissionId: initial.id,
          domain: domain || null,
          name: name || null,
          nameKo: nameKo || null,
          nameEn: nameEn || null,
          description: description || null,
          descriptionKo: descriptionKo || null,
          descriptionEn: descriptionEn || null,
        });
      } else {
        await onSubmit({
          permissionKey: permissionKey.trim(),
          domain: domain.trim(),
          name: name || null,
          nameKo: nameKo || null,
          nameEn: nameEn || null,
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
      title={
        editing
          ? t('tenantUser.permissions.action.edit')
          : t('tenantUser.permissions.action.create')
      }
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
        <Field label={t('tenantUser.permissions.form.permissionKey')}>
          <Input
            value={permissionKey}
            onChange={(e) => setPermissionKey(e.target.value)}
            disabled={editing}
          />
        </Field>
        <Field label={t('tenantUser.permissions.form.domain')}>
          <Input value={domain ?? ''} onChange={(e) => setDomain(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.permissions.form.name')}>
          <Input value={name ?? ''} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.permissions.form.nameKo')}>
          <Input value={nameKo ?? ''} onChange={(e) => setNameKo(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.permissions.form.nameEn')}>
          <Input value={nameEn ?? ''} onChange={(e) => setNameEn(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.permissions.form.description')}>
          <Input value={description ?? ''} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.permissions.form.descriptionKo')}>
          <Input value={descriptionKo ?? ''} onChange={(e) => setDescriptionKo(e.target.value)} />
        </Field>
        <Field label={t('tenantUser.permissions.form.descriptionEn')}>
          <Input value={descriptionEn ?? ''} onChange={(e) => setDescriptionEn(e.target.value)} />
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
