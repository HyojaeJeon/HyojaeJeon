'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
/**
 * Locale 기반 천단위 기호 자동 포맷 number input.
 * - 네이티브 `<input type="number">` 의 spinner 제거 (type=text 사용)
 * - 포커스 시에는 raw 숫자, blur 시 포맷 적용
 * - locale 에 맞는 group separator (ko-KR: ',' / vi-VN: '.' / en-US: ',')
 */
export function NumberInput({ value, onValueChange, locale = 'ko-KR', allowDecimal = false, min, max, startIcon, endIcon, invalid, groupSeparator = true, style, onFocus, onBlur, ...props }) {
    const [focused, setFocused] = useState(false);
    const [draft, setDraft] = useState('');
    const lastValueRef = useRef(value);
    // sync external value → draft when not focused
    useEffect(() => {
        if (!focused) {
            const raw = toRaw(value);
            setDraft(raw === null ? '' : formatNumber(raw, locale, groupSeparator, allowDecimal));
            lastValueRef.current = value;
        }
    }, [value, focused, locale, groupSeparator, allowDecimal]);
    const wrap = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        paddingInline: 12,
        borderRadius: T.radius.md,
        border: 'none',
        boxShadow: invalid ? `inset 0 0 0 1.5px ${T.colors.danger}` : T.shadow.sm,
        background: T.colors.surface,
        color: T.colors.text,
        fontFamily: T.typography.fontFamily,
        fontSize: 13,
        minWidth: 140,
        transition: 'border-color 140ms ease, box-shadow 140ms ease',
        ...style,
    };
    const inputStyle = {
        flex: 1,
        minWidth: 0,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: 'inherit',
        fontFamily: T.typography.fontMono,
        fontSize: 'inherit',
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'right',
        // webkit spinner removal just in case someone sets type=number externally
        WebkitAppearance: 'none',
        MozAppearance: 'textfield',
    };
    return (_jsxs("label", { style: wrap, children: [startIcon && _jsx("span", { style: { color: T.colors.textSubtle, display: 'inline-flex' }, children: startIcon }), _jsx("input", { ...props, type: "text", inputMode: allowDecimal ? 'decimal' : 'numeric', value: focused ? draft : draft, onFocus: (e) => {
                    setFocused(true);
                    const raw = toRaw(value);
                    setDraft(raw === null ? '' : String(raw));
                    onFocus?.(e);
                    // select all for easy editing
                    requestAnimationFrame(() => e.target.select());
                }, onChange: (e) => {
                    const next = cleanInput(e.target.value, allowDecimal);
                    setDraft(next);
                    const parsed = next === '' || next === '-' ? null : Number(next);
                    if (parsed === null || Number.isNaN(parsed)) {
                        onValueChange({ value: null, raw: next });
                    }
                    else {
                        let clamped = parsed;
                        if (min !== undefined && clamped < min)
                            clamped = min;
                        if (max !== undefined && clamped > max)
                            clamped = max;
                        onValueChange({ value: clamped, raw: next });
                    }
                }, onBlur: (e) => {
                    setFocused(false);
                    const raw = toRaw(value);
                    setDraft(raw === null ? '' : formatNumber(raw, locale, groupSeparator, allowDecimal));
                    onBlur?.(e);
                }, style: inputStyle }), endIcon && _jsx("span", { style: { color: T.colors.textSubtle, display: 'inline-flex' }, children: endIcon })] }));
}
function toRaw(v) {
    if (v === null || v === undefined || v === '')
        return null;
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) ? n : null;
}
function cleanInput(s, allowDecimal) {
    // strip group separators, keep one minus at start, keep one decimal point if allowed
    let out = s.replace(/[^\d.\-]/g, '');
    const hasMinus = out.startsWith('-');
    out = out.replace(/-/g, '');
    if (hasMinus)
        out = '-' + out;
    if (!allowDecimal) {
        out = out.replace(/\./g, '');
    }
    else {
        const idx = out.indexOf('.');
        if (idx !== -1) {
            out = out.slice(0, idx + 1) + out.slice(idx + 1).replace(/\./g, '');
        }
    }
    return out;
}
function formatNumber(n, locale, group, allowDecimal) {
    return new Intl.NumberFormat(locale, {
        useGrouping: group,
        maximumFractionDigits: allowDecimal ? 4 : 0,
        minimumFractionDigits: 0,
    }).format(n);
}
