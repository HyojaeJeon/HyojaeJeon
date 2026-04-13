/**
 * DatePicker — 공용 날짜 선택기 primitive.
 * - 커스텀 달력 드롭다운 (브라우저 기본 <input type="date"> 미사용)
 * - 연/월 커스텀 드롭다운 (브라우저 <select> 미사용)
 * - locale 기반 월/요일 라벨 + Today/Clear 버튼 i18n
 * - @floating-ui/react-dom 으로 포지셔닝 (모달 내부에서도 정확히 동작)
 */
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
export declare function DatePicker({ value, onChange, locale, placeholder, minDate, maxDate, invalid, disabled, style, minWidth, }: DatePickerProps): import("react/jsx-runtime").JSX.Element;
