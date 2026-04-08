import type { ReactNode } from 'react';

export type SharedUiTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export type SharedUiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type SharedUiButtonSize = 'sm' | 'md' | 'lg';

export interface SharedUiBreadcrumb {
  label: ReactNode;
  href?: string;
}

export interface SharedUiStat {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: SharedUiTone;
}

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyState?: ReactNode;
  caption?: ReactNode;
}

