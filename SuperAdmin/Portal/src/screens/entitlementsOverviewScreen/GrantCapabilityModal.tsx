'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { Modal, Button, Select, Input, Checkbox, DatePicker } from '@platform/shared-ui';
import { GRANT_CAPABILITY_MUTATION, type GrantBrandHqCapabilityInput } from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';

const CAPABILITY_OPTIONS = [
  { value: 'POS', label: 'POS' },
  { value: 'MEAL_TICKET', label: 'MEAL_TICKET' },
];

interface GrantCapabilityModalProps {
  open: boolean;
  brandHqId: string;
  onClose: () => void;
  onGranted: () => void;
}

export function GrantCapabilityModal({ open, brandHqId, onClose, onGranted }: GrantCapabilityModalProps) {
  const { t } = useI18n();
  const [capability, setCapability] = useState<string | null>(null);
  const [startAsTrial, setStartAsTrial] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [contractRef, setContractRef] = useState('');

  const [grantMut, { loading }] = useMutation(GRANT_CAPABILITY_MUTATION);

  const handleSubmit = async () => {
    if (!capability) return;
    const input: GrantBrandHqCapabilityInput = {
      brandHqId,
      capability,
      startAsTrial,
      expiresAt: expiresAt || null,
      contractRef: contractRef || null,
    };
    const res = await grantMut({ variables: { input } });
    if (res.data?.grantBrandHqCapability.success?.data) {
      toast.success(t('entitlement.toast.granted'));
      resetForm();
      onGranted();
    } else {
      const err = res.data?.grantBrandHqCapability.error;
      toast.error(err?.message ?? t('common.error'));
    }
  };

  const resetForm = () => {
    setCapability(null);
    setStartAsTrial(false);
    setExpiresAt('');
    setContractRef('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('entitlement.action.grant')}
      width={480}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            {t('action.cancel')}
          </Button>
          <Button variant="primary" size="sm" disabled={!capability || loading} loading={loading} onClick={() => void handleSubmit()}>
            {t('action.confirm')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ fontSize: 13 }}>
          {t('entitlement.form.capability')}
          <div style={{ marginTop: 4 }}>
            <Select
              value={capability}
              onChange={(v) => setCapability(v)}
              options={CAPABILITY_OPTIONS}
              placeholder={t('entitlement.form.capability')}
            />
          </div>
        </label>

        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Checkbox checked={startAsTrial} onChange={setStartAsTrial} />
          {t('entitlement.form.startAsTrial')}
        </label>

        <label style={{ fontSize: 13 }}>
          {t('entitlement.form.expiresAt')}
          <div style={{ marginTop: 4 }}>
            <DatePicker value={expiresAt || null} onChange={(v) => setExpiresAt(v ?? '')} minWidth="100%" />
          </div>
        </label>

        <label style={{ fontSize: 13 }}>
          {t('entitlement.form.contractRef')}
          <div style={{ marginTop: 4 }}>
            <Input value={contractRef} onChange={(e) => setContractRef(e.target.value)} placeholder={t('entitlement.form.contractRef')} />
          </div>
        </label>
      </div>
    </Modal>
  );
}
