import type { ReactNode } from 'react';
import { type PageHeaderProps } from '../composites/page-header';
import type { SharedUiStat } from '../types';
export interface DetailPageTemplateProps {
    header: PageHeaderProps;
    summaryItems?: SharedUiStat[];
    tabs?: ReactNode;
    sidebar?: ReactNode;
    children: ReactNode;
}
export declare function DetailPageTemplate({ header, summaryItems, tabs, sidebar, children, }: DetailPageTemplateProps): import("react/jsx-runtime").JSX.Element;
