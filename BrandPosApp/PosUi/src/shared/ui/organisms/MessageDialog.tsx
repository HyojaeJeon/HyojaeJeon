'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePosI18n } from '@i18n/PosI18nProvider';
import Button from '../atoms/Button';

// ─── Types ────────────────────────────────────────────
type MessageDialogMode = 'alert' | 'confirm' | 'timed';

interface MessageDialogProps {
  open: boolean;
  mode?: MessageDialogMode;
  /** i18n msgKey for title line */
  title?: string;
  /** i18n msgKey for description line */
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Auto-close seconds (only for mode='timed') */
  autoCloseSeconds?: number;
}

// ─── MessageDialog ────────────────────────────────────
export default function MessageDialog({
  open,
  mode = 'alert',
  title,
  description,
  onConfirm,
  onCancel,
  autoCloseSeconds = 5,
}: MessageDialogProps) {
  const { t } = usePosI18n();
  const [countdown, setCountdown] = useState(autoCloseSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Auto-close timer for timed mode ---
  useEffect(() => {
    if (!open || mode !== 'timed') return;

    setCountdown(autoCloseSeconds);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onConfirm?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open, mode, autoCloseSeconds, onConfirm]);

  const handleConfirm = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onConfirm?.();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onCancel?.();
  }, [onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: 'var(--opacity-overlay)' }}
      />

      {/* Dialog */}
      <div className="relative bg-pos-bg rounded-pos-2xl shadow-pos-modal w-80 animate-pos-slide-up">
        <div className="px-6 pt-6 pb-4 text-center">
          {title && (
            <h3 className="text-md font-bold text-pos-text leading-tight mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-pos-text-secondary leading-relaxed">{description}</p>
          )}
        </div>

        <div className="px-6 pb-5 flex items-center justify-center gap-3">
          {mode === 'alert' && (
            <Button variant="primary" size="md" onClick={handleConfirm} fullWidth>
              {t('common.confirm')}
            </Button>
          )}

          {mode === 'confirm' && (
            <>
              <Button variant="primary" size="md" onClick={handleConfirm} className="flex-1">
                {t('common.yes')}
              </Button>
              <Button variant="secondary" size="md" onClick={handleCancel} className="flex-1">
                {t('common.no')}
              </Button>
            </>
          )}

          {mode === 'timed' && (
            <div className="flex items-center gap-3 w-full">
              <Button variant="primary" size="md" onClick={handleConfirm} className="flex-1">
                {t('common.confirm')}
              </Button>
              <span className="text-xs font-bold text-pos-text-muted tabular-nums shrink-0">
                {countdown}s
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
