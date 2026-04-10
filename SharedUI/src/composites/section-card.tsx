import type { ReactNode } from 'react';
import { Card, type CardProps } from '../primitives/card';

export interface SectionCardProps extends Omit<CardProps, 'children'> {
  children: ReactNode;
}

export function SectionCard(props: SectionCardProps) {
  return <Card {...props}>{props.children}</Card>;
}
