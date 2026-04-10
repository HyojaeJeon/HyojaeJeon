import type { ReactNode } from 'react';
export interface TabItem {
    key: string;
    label: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
}
export interface TabsProps {
    items: TabItem[];
    value: string;
    onChange: (key: string) => void;
    variant?: 'underline' | 'segment' | 'pill';
}
export declare function Tabs({ items, value, onChange, variant }: TabsProps): import("react/jsx-runtime").JSX.Element;
