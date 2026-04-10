import type { ReactNode } from 'react';
import type { SharedUiTone } from '../types';
export interface BadgeProps {
    tone?: SharedUiTone;
    variant?: 'soft' | 'solid' | 'outline';
    size?: 'sm' | 'md';
    children: ReactNode;
    startDot?: boolean;
}
export declare function Badge({ tone, variant, size, children, startDot, }: BadgeProps): import("react/jsx-runtime").JSX.Element;
