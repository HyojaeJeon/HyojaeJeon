'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import {
  Modal,
  Button,
  Select,
  DatePicker,
  NumberInput,
} from '@platform/shared-ui';
import {
  CREATE_LICENSE_MUTATION,
  type CreateLicenseInput,
} from '@graphql/queries/governance';
import { useI18n } from '@i18n/I18nProvider';

interface Props {
  open: boolean;
  onClose: () => void;
  scopeType: string;
  scopeId: string;
  onCreated: () => void;
}

export function IssueLicenseModal({ open, onClose, scopeType, scopeId, onCreated }: Props) {
  const { t } = useI18n();
  const [createLicense, { loading }] = useMutation(CREATE_LICENSE_MUTATION);

  const [licenseType, setLicenseType] = useState('SUBSCRIPTION');
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState('');
  const [maxBranch, setMaxBranch] = useState('0');
  const [maxTerminal, setMaxTerminal] = useState('0');

  const setDuration = (years: number) => {
    const from = new Date(effectiveFrom || Date.now());
    const to = new Date(from);
    to.setFullYear(to.getFullYear() + years);
    setEffectiveTo(to.toISOString().slice(0, 10));
  };

  const handleSubmit = async () => {
    const input: CreateLicenseInput = {
      scopeType,
      scopeId,
      licenseType,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      maxBranchCount: Number(maxBranch) || 0,
      maxTerminalCount: Number(maxTerminal) || 0,
    };
    try {
      const res = await createLicense({ variables: { input } });
      if (res.data?.createLicense?.success?.data) {
        toast.success(t('license.toast.created'));
        onCreated();
        onClose();
      } else {
        toast.error(res.data?.createLicense?.error?.message ?? t('common.error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('license.action.issue')}
      width={520}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} disabled={!effectiveFrom} onClick={handleSubmit}>
            {t('license.action.issue')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11.5px] font-medium text-fg-muted">{t('license.form.type')}</span>
          <Select
            value={licenseType}
            onChange={setLicenseType}
            options={['SUBSCRIPTION', 'PERPETUAL', 'TRIAL'].map((v) => ({ value: v, label: t(`license.licenseType.${v}`) }))}
            minWidth="100%"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('license.form.effectiveFrom')} *</span>
            <DatePicker value={effectiveFrom} onChange={(v) => setEffectiveFrom(v ?? '')} minWidth="100%" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('license.form.effectiveTo')}</span>
            <DatePicker value={effectiveTo || null} onChange={(v) => setEffectiveTo(v ?? '')} minDate={effectiveFrom} minWidth="100%" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 5].map((y) => (
            <button
              key={y}
              type="button"
              className="rounded-full border px-3 py-0.5 text-[11px] text-fg-muted hover:border-primary hover:text-primary"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => setDuration(y)}
            >
              {y}Y
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('license.form.maxBranch')}</span>
            <NumberInput value={maxBranch} onValueChange={({ raw }) => setMaxBranch(raw)} min={0} style={{ width: '100%' }} placeholder="0 = unlimited" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium text-fg-muted">{t('license.form.maxTerminal')}</span>
            <NumberInput value={maxTerminal} onValueChange={({ raw }) => setMaxTerminal(raw)} min={0} style={{ width: '100%' }} placeholder="0 = unlimited" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
