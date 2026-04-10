import type { CSSProperties, ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
import type { SharedUiTone } from '../types';

export interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tone?: SharedUiTone;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
  style?: CSSProperties;
}

const toneBorder: Record<SharedUiTone, string> = {
  neutral: T.colors.border,
  brand: T.colors.brand,
  success: T.colors.success,
  warning: T.colors.warning,
  danger: T.colors.danger,
  info: T.colors.info,
};

const paddingMap = {
  none: '0',
  sm: T.spacing.lg,
  md: T.spacing.xl,
  lg: T.spacing['2xl'],
};

export function Card({
  title,
  description,
  actions,
  footer,
  tone = 'neutral',
  padding = 'md',
  children,
  style,
}: CardProps) {
  // PosUi shadow-pos-card 100% 복제 — border 금지
  // tone 은 기본 shadow 유지 (색조 halo 는 overlay 층으로 구현하지 않음 — 순수 PosUi 와 동일)
  const toneShadow: Record<SharedUiTone, string> = {
    neutral: T.shadow.sm,
    brand: T.shadow.sm,
    success: T.shadow.sm,
    warning: T.shadow.sm,
    danger: T.shadow.sm,
    info: T.shadow.sm,
  };
  void toneBorder; // deprecated — border 정책상 미사용

  return (
    <section
      style={{
        borderRadius: T.radius.xl,
        background: T.colors.surface,
        boxShadow: toneShadow[tone],
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {(title || description || actions) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: T.spacing.md,
            padding: `${T.spacing.lg} ${T.spacing.xl}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontSize: 15,
                  fontWeight: T.typography.headlineWeight,
                  color: T.colors.text,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </div>
            )}
            {description && (
              <div
                style={{
                  marginTop: 4,
                  color: T.colors.textMuted,
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
              >
                {description}
              </div>
            )}
          </div>
          {actions}
        </header>
      )}

      {children !== undefined && (
        <div style={{ padding: paddingMap[padding], flex: 1 }}>{children}</div>
      )}

      {footer && (
        <footer
          style={{
            padding: `${T.spacing.md} ${T.spacing.xl}`,
            color: T.colors.textMuted,
            fontSize: 12.5,
            background: T.colors.surfaceMuted,
          }}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}
