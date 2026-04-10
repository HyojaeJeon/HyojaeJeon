import { type CSSProperties, type ReactNode } from 'react';
export interface SelectOption<V extends string | number = string> {
    value: V;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}
export interface SelectProps<V extends string | number = string> {
    value: V | null;
    onChange: (value: V) => void;
    options: SelectOption<V>[];
    placeholder?: string;
    startIcon?: ReactNode;
    invalid?: boolean;
    disabled?: boolean;
    style?: CSSProperties;
    minWidth?: number | string;
}
/**
 * 커스텀 드롭다운 Select.
 * - native `<select>` 대체 (브라우저 기본 스타일에 구애받지 않음)
 * - 키보드 탐색 (ArrowUp/Down/Enter/Escape)
 * - 바깥 클릭 시 닫힘
 * - option description 서브라벨 지원
 */
export declare function Select<V extends string | number = string>({ value, onChange, options, placeholder, startIcon, invalid, disabled, style, minWidth, }: SelectProps<V>): import("react/jsx-runtime").JSX.Element;
