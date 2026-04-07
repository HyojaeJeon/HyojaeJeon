'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';
import Modal from './Modal';
import Button from '../atoms/Button';

type ConfirmVariant = 'default' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'default',
}: ConfirmDialogProps) {
  const { t } = usePosI18n();
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm" footer={
      <>
        <Button variant="secondary" size="md" onClick={onCancel}>
          {cancelLabel || t('common.cancel')}
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="md" onClick={onConfirm}>
          {confirmLabel || t('common.confirm')}
        </Button>
      </>
    }>
      <p className="text-sm text-pos-text-secondary leading-relaxed">{message}</p>
    </Modal>
  );
}
