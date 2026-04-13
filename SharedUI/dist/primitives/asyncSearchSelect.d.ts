import { type CSSProperties, type ReactNode } from 'react';
export interface AsyncSearchSelectOption {
    value: string;
    label: string;
    description?: string;
}
export interface AsyncSearchSelectPage {
    items: AsyncSearchSelectOption[];
    hasMore: boolean;
}
export interface AsyncSearchSelectProps {
    /** Selected value (option.value) */
    value: string | null;
    /** Called when user picks an option */
    onChange: (value: string, option: AsyncSearchSelectOption) => void;
    /**
     * Async loader: returns a page of options for the given search query and page offset.
     * `offset` is 0 on initial load, incremented by pageSize on each scroll-to-bottom.
     */
    onSearch: (query: string, offset: number) => Promise<AsyncSearchSelectPage>;
    /** Items per page (default 10) */
    pageSize?: number;
    /** Debounce delay in ms (default 500) */
    debounceMs?: number;
    placeholder?: string;
    /** Label shown when nothing is selected */
    emptyLabel?: string;
    /** Label shown when no results */
    noResultsLabel?: string;
    /** Label shown when loading */
    loadingLabel?: string;
    /** Search input placeholder */
    searchPlaceholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    style?: CSSProperties;
    minWidth?: number | string;
    /** Render custom option content */
    renderOption?: (option: AsyncSearchSelectOption, isSelected: boolean) => ReactNode;
}
export declare function AsyncSearchSelect({ value, onChange, onSearch, pageSize, debounceMs, placeholder, emptyLabel, noResultsLabel, loadingLabel, searchPlaceholder, disabled, invalid, style, minWidth, renderOption, }: AsyncSearchSelectProps): import("react/jsx-runtime").JSX.Element;
