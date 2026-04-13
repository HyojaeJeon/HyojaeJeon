import type { ReactNode } from 'react';
export type SharedUiTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export type SharedUiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
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
    icon?: ReactNode;
    trend?: {
        direction: 'up' | 'down' | 'flat';
        label: ReactNode;
    };
}
export interface DataTableColumn<T> {
    key: string;
    header: ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render: (row: T, index: number) => ReactNode;
}
export interface PaginationProps {
    skip: number;
    take: number;
    total: number;
    onPageChange: (skip: number) => void;
    pageSizeOptions?: number[];
    onPageSizeChange?: (take: number) => void;
}
export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    rows: T[];
    rowKey: (row: T, index: number) => string;
    emptyState?: ReactNode;
    caption?: ReactNode;
    compact?: boolean;
    onRowClick?: (row: T, index: number) => void;
    /** Key of the currently expanded row (matched against rowKey output) */
    expandedRowKey?: string | null;
    /** Render expanded content below the matching row, spanning all columns */
    renderExpandedRow?: (row: T, index: number) => ReactNode;
}
