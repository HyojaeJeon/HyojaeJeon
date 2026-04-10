'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
export function Input({ startIcon, endIcon, invalid, style, ...props }) {
    const wrap = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        paddingInline: 12,
        borderRadius: T.radius.md,
        border: 'none',
        boxShadow: invalid
            ? `inset 0 0 0 1.5px ${T.colors.danger}`
            : T.shadow.sm,
        background: T.colors.surface,
        color: T.colors.text,
        fontFamily: T.typography.fontFamily,
        fontSize: 13,
        minWidth: 200,
        transition: 'border-color 140ms ease, box-shadow 140ms ease',
    };
    const inputStyle = {
        flex: 1,
        minWidth: 0,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        ...style,
    };
    return (_jsxs("label", { style: wrap, children: [startIcon && _jsx("span", { style: { color: T.colors.textSubtle, display: 'inline-flex' }, children: startIcon }), _jsx("input", { ...props, style: inputStyle }), endIcon && _jsx("span", { style: { color: T.colors.textSubtle, display: 'inline-flex' }, children: endIcon })] }));
}
