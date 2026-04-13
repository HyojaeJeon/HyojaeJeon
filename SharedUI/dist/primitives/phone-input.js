'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
const COUNTRIES = [
    { code: 'VN', flag: '🇻🇳', dialCode: '+84', placeholder: '795 050 727', maxDigits: 10 },
    { code: 'KR', flag: '🇰🇷', dialCode: '+82', placeholder: '10 1234 5678', maxDigits: 11 },
];
function parseE164(raw) {
    for (const c of COUNTRIES) {
        if (raw.startsWith(c.dialCode)) {
            return { countryCode: c.code, localNumber: raw.slice(c.dialCode.length) };
        }
    }
    return { countryCode: 'VN', localNumber: raw.replace(/^\+?\d{0,3}/, '') };
}
function stripLeadingZero(num) {
    return num.replace(/^0+/, '');
}
export function PhoneInput({ value, onChange, disabled, invalid }) {
    const parsed = parseE164(value);
    const [country, setCountry] = useState(parsed.countryCode);
    const [localNum, setLocalNum] = useState(parsed.localNumber);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const countryDef = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const emitChange = (cc, num) => {
        const def = COUNTRIES.find((c) => c.code === cc) ?? COUNTRIES[0];
        const cleaned = stripLeadingZero(num.replace(/[^\d]/g, ''));
        const trimmed = cleaned.slice(0, def.maxDigits);
        onChange(trimmed ? `${def.dialCode}${trimmed}` : '');
    };
    const selectCountry = (cc) => {
        setCountry(cc);
        setDropdownOpen(false);
        emitChange(cc, localNum);
    };
    const handleNumberChange = (e) => {
        const cleaned = stripLeadingZero(e.target.value.replace(/[^\d]/g, ''));
        setLocalNum(cleaned);
        emitChange(country, cleaned);
    };
    const wrap = {
        display: 'inline-flex',
        alignItems: 'center',
        height: 36,
        borderRadius: T.radius.md,
        border: 'none',
        boxShadow: invalid ? `inset 0 0 0 1.5px ${T.colors.danger}` : T.shadow.sm,
        background: T.colors.surface,
        color: T.colors.text,
        fontFamily: T.typography.fontFamily,
        fontSize: 13,
        minWidth: 200,
        overflow: 'visible',
        position: 'relative',
    };
    const triggerStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: '100%',
        border: 'none',
        outline: 'none',
        background: T.colors.surfaceMuted,
        color: T.colors.text,
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 600,
        paddingInline: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRight: `1px solid ${T.colors.border}`,
        borderRadius: `${T.radius.md} 0 0 ${T.radius.md}`,
        whiteSpace: 'nowrap',
    };
    const menuStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        background: T.colors.surface,
        border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.md,
        boxShadow: T.shadow.md,
        zIndex: 50,
        minWidth: 120,
        overflow: 'hidden',
    };
    const optionStyle = (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: '100%',
        padding: '7px 12px',
        border: 'none',
        background: isActive ? T.colors.surfaceMuted : 'transparent',
        color: T.colors.text,
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: isActive ? 600 : 400,
        cursor: 'pointer',
        textAlign: 'left',
    });
    const inputStyle = {
        flex: 1,
        minWidth: 0,
        height: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        paddingInline: 10,
    };
    return (_jsxs("div", { style: wrap, ref: dropdownRef, children: [_jsxs("button", { type: "button", onClick: () => !disabled && setDropdownOpen((v) => !v), style: triggerStyle, disabled: disabled, children: [_jsx("span", { children: countryDef.flag }), _jsx("span", { children: countryDef.dialCode }), _jsx("span", { style: { fontSize: 10, opacity: 0.5 }, children: "\u25BE" })] }), dropdownOpen && (_jsx("div", { style: menuStyle, children: COUNTRIES.map((c) => (_jsxs("button", { type: "button", onClick: () => selectCountry(c.code), style: optionStyle(c.code === country), children: [_jsx("span", { children: c.flag }), _jsx("span", { style: { fontWeight: 600 }, children: c.dialCode })] }, c.code))) })), _jsx("input", { type: "tel", value: localNum, onChange: handleNumberChange, placeholder: countryDef.placeholder, disabled: disabled, style: inputStyle, inputMode: "numeric" })] }));
}
