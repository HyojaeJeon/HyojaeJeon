import type { SharedUiStat } from '../types';
export interface SummaryStripProps {
    items: SharedUiStat[];
    columns?: number;
}
export declare function SummaryStrip({ items, columns }: SummaryStripProps): import("react/jsx-runtime").JSX.Element;
