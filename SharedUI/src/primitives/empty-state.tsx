'use client';

import type { CSSProperties, ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';

/* ─── Types ─── */

export type EmptyStateTone = 'neutral' | 'info' | 'warning' | 'error';
export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateProps {
  /** Main icon or illustration. ReactNode for flexibility (SVG, Lucide icon, custom illustration). */
  icon?: ReactNode;
  /** Primary heading text */
  title: ReactNode;
  /** Supporting description */
  description?: ReactNode;
  /** Primary action — rendered below description */
  action?: ReactNode;
  /** Secondary actions — rendered next to primary action */
  secondaryAction?: ReactNode;
  /** Visual tone */
  tone?: EmptyStateTone;
  /** Size variant: sm (inline), md (card-level), lg (full-page center) */
  size?: EmptyStateSize;
  /** Optional custom illustration area replacing the icon circle */
  illustration?: ReactNode;
  /** Override container style */
  style?: CSSProperties;
}

/* ─── Tone → Color mapping ─── */

const TONE_MAP: Record<EmptyStateTone, { icon: string; iconBg: string; border: string }> = {
  neutral: { icon: T.colors.textSubtle, iconBg: T.colors.surfaceMuted, border: T.colors.border },
  info:    { icon: T.colors.info,       iconBg: T.colors.infoSoft,     border: T.colors.info },
  warning: { icon: T.colors.warning,    iconBg: T.colors.warningSoft,  border: T.colors.warning },
  error:   { icon: T.colors.danger,     iconBg: T.colors.dangerSoft,   border: T.colors.danger },
};

/* ─── Size → Dimensions mapping ─── */

const SIZE_MAP: Record<EmptyStateSize, {
  minHeight: string;
  iconSize: number;
  iconPad: string;
  titleSize: string;
  descSize: string;
  gap: string;
  padding: string;
}> = {
  sm: {
    minHeight: '120px',
    iconSize: 20,
    iconPad: '10px',
    titleSize: '13px',
    descSize: '12px',
    gap: T.spacing.sm,
    padding: T.spacing.lg,
  },
  md: {
    minHeight: '220px',
    iconSize: 28,
    iconPad: '14px',
    titleSize: '14px',
    descSize: '12.5px',
    gap: T.spacing.md,
    padding: T.spacing.xl,
  },
  lg: {
    minHeight: '400px',
    iconSize: 36,
    iconPad: '18px',
    titleSize: '16px',
    descSize: '13.5px',
    gap: T.spacing.lg,
    padding: T.spacing['2xl'],
  },
};

/**
 * EmptyState — placeholder UI when no data is available.
 * Supports 3 size variants (sm/md/lg) and 4 tones (neutral/info/warning/error).
 * Pure presentational — no domain logic or i18n.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'neutral',
  size = 'md',
  illustration,
  style,
}: EmptyStateProps) {
  const t = TONE_MAP[tone];
  const s = SIZE_MAP[size];

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: s.minHeight,
    padding: s.padding,
    gap: s.gap,
    fontFamily: T.typography.fontFamily,
    ...style,
  };

  const iconCircle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: s.iconSize + parseInt(s.iconPad) * 2,
    height: s.iconSize + parseInt(s.iconPad) * 2,
    borderRadius: T.radius.full,
    background: t.iconBg,
    color: t.icon,
    flexShrink: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: s.titleSize,
    fontWeight: T.typography.emphasisWeight,
    color: T.colors.text,
    lineHeight: 1.4,
    margin: 0,
  };

  const descStyle: CSSProperties = {
    fontSize: s.descSize,
    fontWeight: T.typography.bodyWeight,
    color: T.colors.textMuted,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '360px',
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: T.spacing.sm,
    marginTop: T.spacing.xs,
  };

  return (
    <div style={container}>
      {illustration ?? (icon && <div style={iconCircle}>{icon}</div>)}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: T.spacing.xs }}>
        <p style={titleStyle}>{title}</p>
        {description && <p style={descStyle}>{description}</p>}
      </div>

      {(action || secondaryAction) && (
        <div style={actionsStyle}>
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
