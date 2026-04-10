'use client';

/**
 * Modal — 공용 다이얼로그 primitive.
 * - overlay + centered panel (portal)
 * - ESC / overlay click 닫힘
 * - title / body / footer slot
 */
import { useEffect, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { sharedUiTokens as T } from '../foundation/tokens';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  width?: number | string;
  closeOnOverlayClick?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  width = 520,
  closeOnOverlayClick = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 16, 26, 0.52)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9000,
    padding: 16,
  };
  const panel: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    maxWidth: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    background: T.colors.surface,
    borderRadius: T.radius.md,
    boxShadow: T.shadow.lg,
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    display: 'flex',
    flexDirection: 'column',
  };
  const header: CSSProperties = {
    padding: '18px 20px 8px',
    borderBottom: `1px solid ${T.colors.border}`,
  };
  const body: CSSProperties = {
    padding: '16px 20px',
    flex: 1,
  };
  const foot: CSSProperties = {
    padding: '12px 20px 16px',
    borderTop: `1px solid ${T.colors.border}`,
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  };

  return createPortal(
    <div
      style={overlay}
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div role="dialog" aria-modal="true" style={panel}>
        {(title || description) && (
          <div style={header}>
            {title && (
              <div style={{ fontSize: 15, fontWeight: 600, color: T.colors.text }}>{title}</div>
            )}
            {description && (
              <div style={{ fontSize: 12.5, color: T.colors.textSubtle, marginTop: 4 }}>
                {description}
              </div>
            )}
          </div>
        )}
        <div style={body}>{children}</div>
        {footer && <div style={foot}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
