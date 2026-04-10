import { type CSSProperties } from 'react';
export interface DatePickerProps {
    /** ISO yyyy-mm-dd or null */
    value: string | null;
    onChange: (value: string | null) => void;
    locale?: string;
    placeholder?: string;
    minDate?: string;
    maxDate?: string;
    invalid?: boolean;
    disabled?: boolean;
    style?: CSSProperties;
    minWidth?: number | string;
}
/**
 * Custom date picker with inline month calendar + year/month dropdowns.
 * - native `<input type="date">` 를 쓰지 않음 (브라우저 스타일 편차 방지)
 * - locale 기반 month/weekday 라벨
 * - keyboard 지원은 단순화 (Esc 닫기)
 */
export declare function DatePicker({ value, onChange, locale, placeholder, minDate, maxDate, invalid, disabled, style, minWidth, }: DatePickerProps): import("react/jsx-runtime").JSX.Element;
