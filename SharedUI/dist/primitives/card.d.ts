import type { CSSProperties, ReactNode } from 'react';
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
export declare function Card({ title, description, actions, footer, tone, padding, children, style, }: CardProps): import("react/jsx-runtime").JSX.Element;
