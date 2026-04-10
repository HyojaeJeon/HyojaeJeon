'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
export function Tabs({ items, value, onChange, variant = 'underline' }) {
    const isSegment = variant === 'segment';
    const isPill = variant === 'pill';
    const wrap = isSegment
        ? {
            display: 'inline-flex',
            gap: 4,
            padding: 4,
            borderRadius: T.radius.md,
            background: T.colors.surfaceMuted,
        }
        : isPill
            ? {
                display: 'inline-flex',
                gap: 8,
            }
            : {
                display: 'flex',
                gap: T.spacing.lg,
            };
    return (_jsx("div", { role: "tablist", style: wrap, children: items.map((item) => {
            const active = item.key === value;
            const base = isPill
                ? {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: active ? 650 : 500,
                    color: active ? '#fff' : T.colors.textMuted,
                    background: active ? T.colors.brand : T.colors.surfaceMuted,
                    border: 'none',
                    borderRadius: 999,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    fontFamily: T.typography.fontFamily,
                    boxShadow: active ? T.shadow.sm : 'none',
                    transition: 'color 140ms ease, background 140ms ease',
                    opacity: item.disabled ? 0.5 : 1,
                }
                : {
                    padding: isSegment ? '6px 12px' : '10px 2px',
                    fontSize: 13,
                    fontWeight: active ? 650 : 500,
                    color: active ? T.colors.text : T.colors.textMuted,
                    background: isSegment && active ? T.colors.surface : 'transparent',
                    border: 'none',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    fontFamily: T.typography.fontFamily,
                    borderRadius: isSegment ? T.radius.sm : 0,
                    boxShadow: isSegment && active ? T.shadow.sm : 'none',
                    borderBottom: !isSegment && active ? `2px solid ${T.colors.brand}` : !isSegment ? '2px solid transparent' : undefined,
                    marginBottom: !isSegment ? -1 : 0,
                    transition: 'color 140ms ease, background 140ms ease',
                    opacity: item.disabled ? 0.5 : 1,
                };
            return (_jsxs("button", { role: "tab", "aria-selected": active, disabled: item.disabled, type: "button", onClick: () => onChange(item.key), style: base, children: [item.icon ? _jsx("span", { "aria-hidden": true, children: item.icon }) : null, item.label] }, item.key));
        }) }));
}
