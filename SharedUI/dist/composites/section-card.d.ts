import type { ReactNode } from 'react';
import { type CardProps } from '../primitives/card';
export interface SectionCardProps extends Omit<CardProps, 'children'> {
    children: ReactNode;
}
export declare function SectionCard(props: SectionCardProps): import("react/jsx-runtime").JSX.Element;
