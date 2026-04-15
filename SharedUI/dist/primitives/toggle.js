'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
export function Toggle({ checked, onChange, disabled, label, size = 'md' }) {
    const w = size === 'sm' ? 36 : 44;
    const h = size === 'sm' ? 20 : 24;
    const knob = size === 'sm' ? 16 : 20;
    const travel = w - knob - 4;
    const track = {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: w,
        height: h,
        borderRadius: 999,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 160ms ease, box-shadow 160ms ease',
        background: checked ? T.colors.brand : T.colors.surfaceMuted,
        boxShadow: checked ? 'none' : `inset 0 0 0 1.5px ${T.colors.borderStrong}`,
        flexShrink: 0,
    };
    const thumb = {
        position: 'absolute',
        top: 2,
        left: 2,
        width: knob,
        height: knob,
        borderRadius: 999,
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'transform 160ms ease',
        transform: checked ? `translateX(${travel}px)` : 'translateX(0)',
    };
    return (_jsxs("label", { style: { display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer' }, children: [_jsx("button", { type: "button", role: "switch", "aria-checked": checked, disabled: disabled, onClick: () => !disabled && onChange(!checked), style: track, children: _jsx("span", { style: thumb }) }), label && (_jsx("span", { style: { fontSize: 13, fontWeight: 600, color: T.colors.text, fontFamily: T.typography.fontFamily }, children: label }))] }));
}
