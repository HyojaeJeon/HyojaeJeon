import type { CSSProperties, ReactNode } from 'react';
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
/**
 * EmptyState — placeholder UI when no data is available.
 * Supports 3 size variants (sm/md/lg) and 4 tones (neutral/info/warning/error).
 * Pure presentational — no domain logic or i18n.
 */
export declare function EmptyState({ icon, title, description, action, secondaryAction, tone, size, illustration, style, }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
