'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { Modal, Button, Input } from '@platform/shared-ui';
import { REVOKE_CAPABILITY_MUTATION } from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';

interface RevokeModalProps {
  open: boolean;
  entitlementId: string;
  capability: string;
  onClose: () => void;
  onDone: () => void;
}

export function RevokeModal({ open, entitlementId, capability, onClose, onDone }: RevokeModalProps) {
  const { t } = useI18n();
  const [reason, setReason] = useState('');
  const [revokeMut, { loading }] = useMutation(REVOKE_CAPABILITY_MUTATION);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    const res = await revokeMut({ variables: { entitlementId, reason: reason.trim() } });
    if (res.data?.revokeBrandHqCapability.success?.data) {
      toast.success(t('entitlement.toast.revoked'));
      setReason('');
      onDone();
    } else {
      const err = res.data?.revokeBrandHqCapability.error;
      toast.error(err?.message ?? t('common.error'));
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`${t('entitlement.action.revoke')} — ${capability}`}
      width={440}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            {t('action.cancel')}
          </Button>
          <Button variant="danger" size="sm" disabled={!reason.trim() || loading} loading={loading} onClick={() => void handleSubmit()}>
            {t('action.confirm')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--danger, #dc2626)', lineHeight: 1.5 }}>
          {t('entitlement.confirm.revoke')}
        </p>
        <label style={{ fontSize: 13 }}>
          {t('entitlement.form.reason')}
          <div style={{ marginTop: 4 }}>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('entitlement.form.reason')} />
          </div>
        </label>
      </div>
    </Modal>
  );
}
