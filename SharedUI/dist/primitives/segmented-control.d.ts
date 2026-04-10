/**
 * 한국어: SegmentedControl — 플랫폼/모드 전환용 2~5 세그먼트 토글.
 *   Tabs 의 'segment' variant 와 유사하지만, 탭이 아닌 "값 선택 컨트롤" 이다.
 *   role="radiogroup" 시맨틱을 가지며 각 항목이 radio 로 노출된다.
 * Tiếng Việt: Bộ điều khiển phân đoạn (chọn giá trị, không phải tab).
 */
import type { ReactNode } from 'react';
export interface SegmentedControlItem<V extends string> {
    value: V;
    label: ReactNode;
    disabled?: boolean;
}
export interface SegmentedControlProps<V extends string> {
    items: SegmentedControlItem<V>[];
    value: V;
    onChange: (value: V) => void;
    ariaLabel?: string;
    size?: 'sm' | 'md';
}
export declare function SegmentedControl<V extends string>({ items, value, onChange, ariaLabel, size, }: SegmentedControlProps<V>): import("react/jsx-runtime").JSX.Element;
