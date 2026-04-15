'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useLayoutEffect, } from 'react';
import { createPortal } from 'react-dom';
import { sharedUiTokens as T } from '../foundation/tokens';
/**
 * 커스텀 드롭다운 Select.
 * - native `<select>` 대체 (브라우저 기본 스타일에 구애받지 않음)
 * - 키보드 탐색 (ArrowUp/Down/Enter/Escape)
 * - 바깥 클릭 시 닫힘
 * - option description 서브라벨 지원
 */
export function Select({ value, onChange, options, placeholder = '— select —', startIcon, invalid, disabled, style, minWidth = 180, }) {
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
    const rootRef = useRef(null);
    const panelRef = useRef(null);
    const [panelPos, setPanelPos] = useState(null);
    const reposition = () => {
        if (!rootRef.current)
            return;
        const rect = rootRef.current.getBoundingClientRect();
        const panelH = panelRef.current?.offsetHeight ?? 280;
        const margin = 4;
        const spaceBelow = window.innerHeight - rect.bottom - margin;
        const spaceAbove = rect.top - margin;
        const top = spaceBelow >= panelH || spaceBelow >= spaceAbove
            ? rect.bottom + margin
            : Math.max(8, rect.top - panelH - margin);
        setPanelPos({ top, left: rect.left, width: rect.width });
    };
    useLayoutEffect(() => {
        if (!open)
            return;
        reposition();
        // re-measure after panel renders and gets its real height
        const raf = requestAnimationFrame(reposition);
        return () => cancelAnimationFrame(raf);
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const onDocClick = (e) => {
            const target = e.target;
            const insideTrigger = rootRef.current?.contains(target);
            const insidePanel = panelRef.current?.contains(target);
            if (!insideTrigger && !insidePanel)
                setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [open]);
    const selected = options.find((o) => o.value === value);
    const trigger = {
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
        minWidth,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color 140ms ease',
        justifyContent: 'space-between',
        ...style,
    };
    const panel = {
        position: 'fixed',
        top: panelPos?.top ?? -9999,
        left: panelPos?.left ?? -9999,
        width: panelPos?.width ?? 'auto',
        zIndex: 9999,
        background: T.colors.surface,
        borderRadius: T.radius.md,
        boxShadow: T.shadow.lg,
        maxHeight: 280,
        overflowY: 'auto',
        padding: 4,
    };
    const handleKey = (e) => {
        if (disabled)
            return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!open)
                setOpen(true);
            else {
                const o = options[activeIdx];
                if (o && !o.disabled) {
                    onChange(o.value);
                    setOpen(false);
                }
            }
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open)
                setOpen(true);
            else
                setActiveIdx((i) => Math.min(options.length - 1, i + 1));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open)
                setOpen(true);
            else
                setActiveIdx((i) => Math.max(0, i - 1));
        }
        else if (e.key === 'Escape') {
            setOpen(false);
        }
    };
    return (_jsxs("div", { ref: rootRef, style: { position: 'relative', display: 'inline-flex', width: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }, children: [_jsxs("button", { type: "button", disabled: disabled, onClick: () => setOpen((v) => !v), onKeyDown: handleKey, "aria-haspopup": "listbox", "aria-expanded": open, style: trigger, children: [_jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: [startIcon, selected ? selected.label : _jsx("span", { style: { color: T.colors.textSubtle }, children: placeholder })] }), _jsx("span", { "aria-hidden": true, style: {
                            color: T.colors.textSubtle,
                            transition: 'transform 160ms ease',
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            fontSize: 10,
                        }, children: "\u25BC" })] }), open && !disabled && typeof document !== 'undefined' && createPortal(_jsxs("div", { ref: panelRef, role: "listbox", style: panel, children: [options.length === 0 && (_jsx("div", { style: { padding: 12, color: T.colors.textSubtle, fontSize: 12.5, textAlign: 'center' }, children: "No options" })), options.map((o, idx) => {
                        const isActive = idx === activeIdx;
                        const isSelected = o.value === value;
                        const itemStyle = {
                            padding: '8px 10px',
                            borderRadius: T.radius.sm,
                            cursor: o.disabled ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            fontSize: 13,
                            color: o.disabled ? T.colors.textSubtle : T.colors.text,
                            background: isSelected
                                ? T.colors.brandSoft
                                : isActive
                                    ? T.colors.surfaceMuted
                                    : 'transparent',
                            fontWeight: isSelected ? 600 : 500,
                        };
                        return (_jsxs("div", { role: "option", "aria-selected": isSelected, onMouseEnter: () => setActiveIdx(idx), onClick: () => {
                                if (o.disabled)
                                    return;
                                onChange(o.value);
                                setOpen(false);
                            }, style: itemStyle, children: [_jsx("span", { children: o.label }), o.description && (_jsx("span", { style: { fontSize: 11, color: T.colors.textSubtle, fontWeight: 400 }, children: o.description }))] }, String(o.value)));
                    })] }), document.body)] }));
}
