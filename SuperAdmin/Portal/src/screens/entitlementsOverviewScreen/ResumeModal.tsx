'use client';

import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { ConfirmModal } from '@platform/shared-ui';
import { RESUME_CAPABILITY_MUTATION } from '@graphql/queries/brand';
import { useI18n } from '@i18n/I18nProvider';

interface ResumeModalProps {
  open: boolean;
  entitlementId: string;
  capability: string;
  onClose: () => void;
  onDone: () => void;
}

export function ResumeModal({ open, entitlementId, capability, onClose, onDone }: ResumeModalProps) {
  const { t } = useI18n();
  const [resumeMut, { loading }] = useMutation(RESUME_CAPABILITY_MUTATION);

  const handleConfirm = async () => {
    const res = await resumeMut({ variables: { entitlementId } });
    if (res.data?.resumeBrandHqCapability.success?.data) {
      toast.success(t('entitlement.toast.resumed'));
      onDone();
    } else {
      const err = res.data?.resumeBrandHqCapability.error;
      toast.error(err?.message ?? t('common.error'));
    }
  };

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={`${t('entitlement.action.resume')} — ${capability}`}
      message={t('entitlement.confirm.resume')}
      confirmLabel={t('action.confirm')}
      cancelLabel={t('action.cancel')}
      busy={loading}
    />
  );
}
