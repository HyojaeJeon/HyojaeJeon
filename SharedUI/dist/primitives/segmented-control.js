'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
export function SegmentedControl({ items, value, onChange, ariaLabel, size = 'md', }) {
    const wrap = {
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        borderRadius: T.radius.md,
        background: T.colors.surfaceMuted,
        border: `1px solid ${T.colors.border}`,
    };
    const pad = size === 'sm' ? '4px 10px' : '6px 14px';
    return (_jsx("div", { role: "radiogroup", "aria-label": ariaLabel, style: wrap, children: items.map((item) => {
            const active = item.value === value;
            const style = {
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
            return (_jsx("button", { role: "radio", "aria-checked": active, disabled: item.disabled, type: "button", onClick: () => onChange(item.value), style: style, children: item.label }, item.value));
        }) }));
}
