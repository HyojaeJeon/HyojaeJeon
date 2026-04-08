import type { ReactNode } from 'react';
import { Card } from '../primitives/card';

export interface SectionCardProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, description, actions, footer, children }: SectionCardProps) {
  return (
    <Card title={title} description={description} actions={actions} footer={footer}>
      {children}
    </Card>
  );
}

