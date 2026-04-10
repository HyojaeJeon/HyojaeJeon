import type { ReactNode } from 'react';
import { type PageHeaderProps } from '../composites/page-header';
import type { SharedUiStat } from '../types';
export interface DashboardPageTemplateProps {
    header: PageHeaderProps;
    metrics?: SharedUiStat[];
    primary: ReactNode;
    secondary?: ReactNode;
}
export declare function DashboardPageTemplate({ header, metrics, primary, secondary, }: DashboardPageTemplateProps): import("react/jsx-runtime").JSX.Element;
