import type { ReactNode } from 'react';
import { sharedUiTokens } from '../foundation/tokens';
import type { SharedUiTone } from '../types';

export interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: SharedUiTone;
  children: ReactNode;
}

const toneStyles: Record<SharedUiTone, string> = {
  neutral: sharedUiTokens.colors.border,
  brand: sharedUiTokens.colors.brand,
  success: sharedUiTokens.colors.success,
  warning: sharedUiTokens.colors.warning,
  danger: sharedUiTokens.colors.danger,
};

export function Card({ title, description, actions, footer, tone = 'neutral', children }: CardProps) {
  return (
    <section
      style={{
        border: `1px solid ${toneStyles[tone]}`,
        borderRadius: sharedUiTokens.radius.lg,
        background: sharedUiTokens.colors.surface,
        boxShadow: sharedUiTokens.shadow.sm,
        overflow: 'hidden',
      }}
    >
      {(title || description || actions) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: sharedUiTokens.spacing.lg,
            padding: sharedUiTokens.spacing.xl,
            borderBottom: `1px solid ${sharedUiTokens.colors.border}`,
          }}
        >
          <div>
            {title && <div style={{ fontSize: 16, fontWeight: 700, color: sharedUiTokens.colors.text }}>{title}</div>}
            {description && <div style={{ marginTop: 4, color: sharedUiTokens.colors.textMuted, fontSize: 14 }}>{description}</div>}
          </div>
          {actions}
        </header>
      )}

      <div style={{ padding: sharedUiTokens.spacing.xl }}>{children}</div>

      {footer && (
        <footer
          style={{
            padding: sharedUiTokens.spacing.xl,
            borderTop: `1px solid ${sharedUiTokens.colors.border}`,
            color: sharedUiTokens.colors.textMuted,
            fontSize: 13,
          }}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}

