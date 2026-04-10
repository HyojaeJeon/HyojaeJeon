import type { ReactNode } from 'react';
import { type PageHeaderProps } from '../composites/page-header';
import type { SharedUiStat } from '../types';
export interface ListPageTemplateProps {
    header: PageHeaderProps;
    summaryItems?: SharedUiStat[];
    filters?: ReactNode;
    children: ReactNode;
    aside?: ReactNode;
}
export declare function ListPageTemplate({ header, summaryItems, filters, children, aside, }: ListPageTemplateProps): import("react/jsx-runtime").JSX.Element;
