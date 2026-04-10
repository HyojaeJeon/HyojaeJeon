import { type InputHTMLAttributes, type ReactNode } from 'react';
export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'defaultValue'> {
    /** raw numeric value (or null / '') */
    value: number | string | null | undefined;
    onValueChange: (next: {
        value: number | null;
        raw: string;
    }) => void;
    /** BCP-47 locale for Intl formatter. ex) 'ko-KR' / 'vi-VN' / 'en-US' */
    locale?: string;
    /** 소수 허용 여부 (기본 false = 정수만) */
    allowDecimal?: boolean;
    min?: number;
    max?: number;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    invalid?: boolean;
    /** 자리수 기호를 끌 수 있도록 */
    groupSeparator?: boolean;
}
/**
 * Locale 기반 천단위 기호 자동 포맷 number input.
 * - 네이티브 `<input type="number">` 의 spinner 제거 (type=text 사용)
 * - 포커스 시에는 raw 숫자, blur 시 포맷 적용
 * - locale 에 맞는 group separator (ko-KR: ',' / vi-VN: '.' / en-US: ',')
 */
export declare function NumberInput({ value, onValueChange, locale, allowDecimal, min, max, startIcon, endIcon, invalid, groupSeparator, style, onFocus, onBlur, ...props }: NumberInputProps): import("react/jsx-runtime").JSX.Element;
