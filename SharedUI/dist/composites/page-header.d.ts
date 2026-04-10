import type { ReactNode } from 'react';
import type { SharedUiBreadcrumb } from '../types';
export interface PageHeaderProps {
    breadcrumbs?: SharedUiBreadcrumb[];
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    meta?: ReactNode;
}
export declare function PageHeader({ breadcrumbs, title, description, actions, meta }: PageHeaderProps): import("react/jsx-runtime").JSX.Element;
