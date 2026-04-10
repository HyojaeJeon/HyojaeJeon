'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 한국어: Checkbox primitive — 공용 체크박스 UI.
 *   - 네이티브 `<input type="checkbox">` 는 `sr-only` 로 숨기고 custom box 를 렌더한다.
 *   - disabled / indeterminate / size(sm|md) 지원.
 *   - 클릭 영역은 호출자가 감싸는 label/td 로 확장 가능하다 (pointer-events 통과).
 * Tiếng Việt: Checkbox dùng chung, ẩn input gốc và vẽ ô tick tuỳ biến.
 */
import { useEffect, useRef } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
export function Checkbox({ checked, onChange, disabled = false, indeterminate = false, size = 'md', ariaLabel, }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current)
            ref.current.indeterminate = indeterminate;
    }, [indeterminate]);
    const dim = size === 'sm' ? 16 : 18;
    const radius = size === 'sm' ? 4 : 5;
    const wrap = {
        position: 'relative',
        display: 'inline-flex',
        width: dim,
        height: dim,
        verticalAlign: 'middle',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
    };
    const input = {
        position: 'absolute',
        inset: 0,
        opacity: 0,
        margin: 0,
        cursor: 'inherit',
    };
    const active = checked || indeterminate;
    const box = {
        width: dim,
        height: dim,
        borderRadius: radius,
        border: `1.5px solid ${active ? T.colors.brand : T.colors.border}`,
        background: active ? T.colors.brand : T.colors.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
        boxShadow: active ? `0 0 0 3px ${T.colors.brandSoft}` : 'none',
    };
    const tickSize = size === 'sm' ? 9 : 11;
    return (_jsxs("span", { style: wrap, children: [_jsx("input", { ref: ref, type: "checkbox", checked: checked, disabled: disabled, onChange: (e) => onChange?.(e.target.checked), "aria-label": ariaLabel, style: input }), _jsx("span", { style: box, "aria-hidden": true, children: indeterminate ? (_jsx("span", { style: {
                        display: 'block',
                        width: tickSize,
                        height: 2,
                        background: T.colors.brandFg,
                        borderRadius: 1,
                    } })) : checked ? (_jsx("svg", { width: tickSize, height: tickSize, viewBox: "0 0 12 12", fill: "none", stroke: T.colors.brandFg, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M2 6.5 L5 9.5 L10 3.5" }) })) : null })] }));
}
