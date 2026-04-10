'use client';

/**
 * 한국어: SegmentedControl — 플랫폼/모드 전환용 2~5 세그먼트 토글.
 *   Tabs 의 'segment' variant 와 유사하지만, 탭이 아닌 "값 선택 컨트롤" 이다.
 *   role="radiogroup" 시맨틱을 가지며 각 항목이 radio 로 노출된다.
 * Tiếng Việt: Bộ điều khiển phân đoạn (chọn giá trị, không phải tab).
 */

import type { CSSProperties, ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';

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

export function SegmentedControl<V extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  size = 'md',
}: SegmentedControlProps<V>) {
  const wrap: CSSProperties = {
    display: 'inline-flex',
    gap: 4,
    padding: 4,
    borderRadius: T.radius.md,
    background: T.colors.surfaceMuted,
    border: `1px solid ${T.colors.border}`,
  };
  const pad = size === 'sm' ? '4px 10px' : '6px 14px';

  return (
    <div role="radiogroup" aria-label={ariaLabel} style={wrap}>
      {items.map((item) => {
        const active = item.value === value;
        const style: CSSProperties = {
          padding: pad,
          fontSize: size === 'sm' ? 12 : 13,
          fontWeight: active ? 650 : 500,
          color: active ? T.colors.text : T.colors.textMuted,
          background: active ? T.colors.surface : 'transparent',
          border: 'none',
          borderRadius: T.radius.sm,
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          fontFamily: T.typography.fontFamily,
          boxShadow: active ? T.shadow.sm : 'none',
          transition: 'color 140ms ease, background 140ms ease',
          opacity: item.disabled ? 0.5 : 1,
        };
        return (
          <button
            key={item.value}
            role="radio"
            aria-checked={active}
            disabled={item.disabled}
            type="button"
            onClick={() => onChange(item.value)}
            style={style}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
