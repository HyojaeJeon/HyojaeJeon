'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
const sizeStyles = {
    sm: { height: '34px', paddingInline: '12px', fontSize: '13px', borderRadius: T.radius.sm },
    md: { height: '40px', paddingInline: '16px', fontSize: '13.5px', borderRadius: T.radius.sm },
    lg: { height: '48px', paddingInline: '22px', fontSize: '14.5px', borderRadius: T.radius.md },
};
const variantStyles = {
    primary: {
        background: T.colors.brand,
        color: T.colors.brandFg,
        border: `1px solid ${T.colors.brand}`,
        boxShadow: T.shadow.sm,
    },
    secondary: {
        background: T.colors.surfaceMuted,
        color: T.colors.text,
        border: `1px solid ${T.colors.border}`,
    },
    outline: {
        background: T.colors.surface,
        color: T.colors.text,
        border: `1px solid ${T.colors.borderStrong}`,
    },
    ghost: {
        background: 'transparent',
        color: T.colors.text,
        border: '1px solid transparent',
    },
    danger: {
        background: T.colors.danger,
        color: '#ffffff',
        border: `1px solid ${T.colors.danger}`,
        boxShadow: T.shadow.sm,
    },
};
export function Button({ variant = 'primary', size = 'md', startIcon, endIcon, loading = false, fullWidth = false, disabled, children, style, type = 'button', ...props }) {
    const merged = {
        ...variantStyles[variant],
        ...sizeStyles[size],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: T.typography.fontFamily,
        fontWeight: 700,
        letterSpacing: '-0.015em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'background 160ms ease, border-color 160ms ease, transform 120ms ease, box-shadow 160ms ease',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
    };
    return (_jsxs("button", { type: type, disabled: disabled || loading, "aria-busy": loading || undefined, style: merged, ...props, children: [startIcon, _jsx("span", { children: loading ? '…' : children }), endIcon] }));
}
