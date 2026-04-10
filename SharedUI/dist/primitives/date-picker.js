'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { sharedUiTokens as T } from '../foundation/tokens';
/**
 * Custom date picker with inline month calendar + year/month dropdowns.
 * - native `<input type="date">` 를 쓰지 않음 (브라우저 스타일 편차 방지)
 * - locale 기반 month/weekday 라벨
 * - keyboard 지원은 단순화 (Esc 닫기)
 */
export function DatePicker({ value, onChange, locale = 'ko-KR', placeholder = 'yyyy-mm-dd', minDate, maxDate, invalid, disabled, style, minWidth = 180, }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const panelRef = useRef(null);
    const [panelPos, setPanelPos] = useState(null);
    const parsed = value ? new Date(value + 'T00:00:00') : null;
    const today = new Date();
    const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
    // Trigger 위치 기반 panel 좌표 계산 (portal 사용)
    // 우선순위: 아래 시도 → 부족하면 위/아래 중 공간 큰 쪽 선택
    useLayoutEffect(() => {
        if (!open || !rootRef.current)
            return;
        const rect = rootRef.current.getBoundingClientRect();
        const PANEL_W = 288;
        const PANEL_H = 360;
        const margin = 6;
        let left = rect.left;
        if (left + PANEL_W > window.innerWidth - 8)
            left = Math.max(8, window.innerWidth - PANEL_W - 8);
        const spaceBelow = window.innerHeight - rect.bottom - margin;
        const spaceAbove = rect.top - margin;
        const top = spaceBelow >= PANEL_H || spaceBelow >= spaceAbove
            ? rect.bottom + margin
            : Math.max(8, rect.top - PANEL_H - margin);
        setPanelPos({ top, left });
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const onDoc = (e) => {
            const target = e.target;
            const insideTrigger = rootRef.current?.contains(target);
            const insidePanel = panelRef.current?.contains(target);
            if (!insideTrigger && !insidePanel)
                setOpen(false);
        };
        const onEsc = (e) => {
            if (e.key === 'Escape')
                setOpen(false);
        };
        const onScroll = () => {
            if (!rootRef.current)
                return;
            const rect = rootRef.current.getBoundingClientRect();
            const PANEL_W = 288;
            const PANEL_H = 360;
            const margin = 6;
            let left = rect.left;
            if (left + PANEL_W > window.innerWidth - 8)
                left = Math.max(8, window.innerWidth - PANEL_W - 8);
            const spaceBelow = window.innerHeight - rect.bottom - margin;
            const spaceAbove = rect.top - margin;
            const top = spaceBelow >= PANEL_H || spaceBelow >= spaceAbove
                ? rect.bottom + margin
                : Math.max(8, rect.top - PANEL_H - margin);
            setPanelPos({ top, left });
        };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onEsc);
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onEsc);
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
        };
    }, [open]);
    useEffect(() => {
        if (parsed) {
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
        }
    }, [value]);
    const trigger = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        ...style,
    };
    const panel = {
        position: 'fixed',
        top: panelPos?.top ?? -9999,
        left: panelPos?.left ?? -9999,
        zIndex: 9999,
        background: T.colors.surface,
        borderRadius: T.radius.lg,
        boxShadow: T.shadow.lg,
        padding: 12,
        width: 288,
    };
    const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const monthFmt = new Intl.DateTimeFormat(locale, { month: 'long' });
    const displayFmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
    const weekdays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(2024, 0, i);
        weekdays.push(weekdayFmt.format(d));
    }
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = lastOfMonth.getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++)
        cells.push(null);
    for (let d = 1; d <= daysInMonth; d++)
        cells.push({ date: d, year: viewYear, month: viewMonth, inMonth: true });
    while (cells.length % 7 !== 0)
        cells.push(null);
    const months = [];
    for (let m = 0; m < 12; m++)
        months.push(monthFmt.format(new Date(2024, m, 1)));
    const years = [];
    for (let y = today.getFullYear() - 20; y <= today.getFullYear() + 10; y++)
        years.push(y);
    const isSelectedDay = (y, m, d) => parsed && parsed.getFullYear() === y && parsed.getMonth() === m && parsed.getDate() === d;
    const isTodayDay = (y, m, d) => today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
    const selectDate = (y, m, d) => {
        const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (minDate && iso < minDate)
            return;
        if (maxDate && iso > maxDate)
            return;
        onChange(iso);
        setOpen(false);
    };
    return (_jsxs("div", { ref: rootRef, style: { position: 'relative', display: 'inline-flex', width: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }, children: [_jsxs("button", { type: "button", disabled: disabled, onClick: () => setOpen((v) => !v), "aria-haspopup": "dialog", "aria-expanded": open, style: trigger, children: [_jsx("span", { style: { flex: 1, textAlign: 'left', color: parsed ? T.colors.text : T.colors.textSubtle }, children: parsed ? displayFmt.format(parsed) : placeholder }), _jsx("span", { "aria-hidden": true, style: { color: T.colors.textSubtle, fontSize: 12 }, children: "\uD83D\uDCC5" })] }), open && !disabled && typeof document !== 'undefined' && createPortal(_jsxs("div", { ref: panelRef, role: "dialog", style: panel, children: [_jsxs("div", { style: { display: 'flex', gap: 6, marginBottom: 10 }, children: [_jsx("button", { type: "button", onClick: () => {
                                    if (viewMonth === 0) {
                                        setViewMonth(11);
                                        setViewYear((y) => y - 1);
                                    }
                                    else
                                        setViewMonth((m) => m - 1);
                                }, style: {
                                    width: 28,
                                    height: 28,
                                    borderRadius: T.radius.sm,
                                    border: `1px solid ${T.colors.border}`,
                                    background: T.colors.surface,
                                    color: T.colors.text,
                                    cursor: 'pointer',
                                }, children: "\u2039" }), _jsx("select", { value: viewYear, onChange: (e) => setViewYear(Number(e.target.value)), style: {
                                    flex: 1,
                                    height: 28,
                                    borderRadius: T.radius.sm,
                                    border: `1px solid ${T.colors.border}`,
                                    background: T.colors.surface,
                                    color: T.colors.text,
                                    fontFamily: T.typography.fontFamily,
                                    fontSize: 12,
                                    paddingInline: 6,
                                }, children: years.map((y) => (_jsx("option", { value: y, children: y }, y))) }), _jsx("select", { value: viewMonth, onChange: (e) => setViewMonth(Number(e.target.value)), style: {
                                    flex: 1,
                                    height: 28,
                                    borderRadius: T.radius.sm,
                                    border: `1px solid ${T.colors.border}`,
                                    background: T.colors.surface,
                                    color: T.colors.text,
                                    fontFamily: T.typography.fontFamily,
                                    fontSize: 12,
                                    paddingInline: 6,
                                }, children: months.map((m, i) => (_jsx("option", { value: i, children: m }, i))) }), _jsx("button", { type: "button", onClick: () => {
                                    if (viewMonth === 11) {
                                        setViewMonth(0);
                                        setViewYear((y) => y + 1);
                                    }
                                    else
                                        setViewMonth((m) => m + 1);
                                }, style: {
                                    width: 28,
                                    height: 28,
                                    borderRadius: T.radius.sm,
                                    border: `1px solid ${T.colors.border}`,
                                    background: T.colors.surface,
                                    color: T.colors.text,
                                    cursor: 'pointer',
                                }, children: "\u203A" })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }, children: weekdays.map((w, i) => (_jsx("div", { style: {
                                textAlign: 'center',
                                fontSize: 10,
                                fontWeight: 600,
                                color: T.colors.textSubtle,
                                textTransform: 'uppercase',
                                padding: '4px 0',
                            }, children: w }, i))) }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }, children: cells.map((c, i) => {
                            if (!c)
                                return _jsx("div", {}, i);
                            const selected = isSelectedDay(c.year, c.month, c.date);
                            const isToday = isTodayDay(c.year, c.month, c.date);
                            return (_jsx("button", { type: "button", onClick: () => selectDate(c.year, c.month, c.date), style: {
                                    height: 32,
                                    borderRadius: T.radius.sm,
                                    border: `1px solid ${selected ? T.colors.brand : 'transparent'}`,
                                    background: selected
                                        ? T.colors.brandSoft
                                        : isToday
                                            ? T.colors.surfaceMuted
                                            : 'transparent',
                                    color: selected ? T.colors.brand : T.colors.text,
                                    fontFamily: T.typography.fontMono,
                                    fontSize: 12,
                                    fontWeight: selected ? 700 : 500,
                                    cursor: 'pointer',
                                }, children: c.date }, i));
                        }) }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11 }, children: [_jsx("button", { type: "button", onClick: () => {
                                    const t = new Date();
                                    selectDate(t.getFullYear(), t.getMonth(), t.getDate());
                                }, style: {
                                    padding: '4px 8px',
                                    borderRadius: T.radius.sm,
                                    border: `1px solid ${T.colors.border}`,
                                    background: T.colors.surface,
                                    color: T.colors.text,
                                    cursor: 'pointer',
                                }, children: "Today" }), _jsx("button", { type: "button", onClick: () => {
                                    onChange(null);
                                    setOpen(false);
                                }, style: {
                                    padding: '4px 8px',
                                    borderRadius: T.radius.sm,
                                    border: 'none',
                                    background: 'transparent',
                                    color: T.colors.textMuted,
                                    cursor: 'pointer',
                                }, children: "Clear" })] })] }), document.body)] }));
}
