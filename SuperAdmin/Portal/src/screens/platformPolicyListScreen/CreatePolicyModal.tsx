'use client';

import { useState, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Modal, Button, Input, Select, type SelectOption } from '@platform/shared-ui';
import { toast } from 'sonner';
import {
  CREATE_PLATFORM_POLICY_MUTATION,
  type CreatePlatformPolicyInput,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';

const SCOPE_OPTIONS: SelectOption[] = [
  { value: 'GLOBAL', label: 'GLOBAL' },
  { value: 'REGIONAL_DISTRIBUTOR', label: 'REGIONAL_DISTRIBUTOR' },
  { value: 'BRAND_HQ', label: 'BRAND_HQ' },
  { value: 'BRANCH', label: 'BRANCH' },
  { value: 'EDGE_POS', label: 'EDGE_POS' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultPolicyKey?: string;
  defaultScopeType?: string;
  defaultScopeId?: string | null;
}

export function CreatePolicyModal({
  open,
  onClose,
  onCreated,
  defaultPolicyKey,
  defaultScopeType,
  defaultScopeId,
}: Props) {
  const { t } = useI18n();
  const [policyKey, setPolicyKey] = useState(defaultPolicyKey ?? '');
  const [scopeType, setScopeType] = useState(defaultScopeType ?? 'GLOBAL');
  const [scopeId, setScopeId] = useState(defaultScopeId ?? '');
  const [policyValueJson, setPolicyValueJson] = useState('{}');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [createPolicy] = useMutation(CREATE_PLATFORM_POLICY_MUTATION);

  /* reset form when defaults change (e.g. opening from detail page) */
  const resetKey = `${defaultPolicyKey}-${defaultScopeType}-${defaultScopeId}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPolicyKey(defaultPolicyKey ?? '');
    setScopeType(defaultScopeType ?? 'GLOBAL');
    setScopeId(defaultScopeId ?? '');
    setPolicyValueJson('{}');
    setErr(null);
  }

  const canSubmit = policyKey.trim().length > 0 && scopeType.length > 0 && !busy;

  const handleSubmit = async () => {
    setBusy(true);
    setErr(null);
    try {
      JSON.parse(policyValueJson);
    } catch {
      setErr('Invalid JSON');
      setBusy(false);
      return;
    }
    try {
      const input: CreatePlatformPolicyInput = {
        policyKey: policyKey.trim(),
        scopeType,
        scopeId: scopeId.trim() || null,
        policyValueJson: JSON.parse(policyValueJson),
      };
      const { data } = await createPolicy({ variables: { input } });
      const error = data?.createPlatformPolicy?.error;
      if (error) {
        setErr(error.message ?? error.code);
        return;
      }
      toast.success(t('policy.toast.created'));
      onCreated();
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
      title={t('policy.action.create')}
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
        <Field label={t('policy.form.policyKey')}>
          <Input value={policyKey} onChange={(e) => setPolicyKey(e.target.value)} />
        </Field>
        <Field label={t('policy.form.scopeType')}>
          <Select
            value={scopeType}
            onChange={(v) => setScopeType(v)}
            options={SCOPE_OPTIONS}
          />
        </Field>
        <Field label={t('policy.form.scopeId')}>
          <Input value={scopeId} onChange={(e) => setScopeId(e.target.value)} />
        </Field>
        <Field label={t('policy.form.policyValue')}>
          <textarea
            className="w-full rounded-md border bg-surface-1 p-3 font-mono text-[12px] text-fg"
            style={{ borderColor: 'var(--border)', minHeight: 120, resize: 'vertical' }}
            value={policyValueJson}
            onChange={(e) => setPolicyValueJson(e.target.value)}
          />
        </Field>
        {err && <div className="text-[12px] text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  );
}
