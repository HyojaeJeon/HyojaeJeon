'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useLayoutEffect, useCallback, } from 'react';
import { createPortal } from 'react-dom';
import { sharedUiTokens as T } from '../foundation/tokens';
/* ─────────────────────── Debounce ─────────────────────── */
function useDebouncedCallback(fn, delay) {
    const timerRef = useRef(null);
    const fnRef = useRef(fn);
    fnRef.current = fn;
    useEffect(() => {
        return () => {
            if (timerRef.current)
                clearTimeout(timerRef.current);
        };
    }, []);
    return useCallback((q) => {
        if (timerRef.current)
            clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => fnRef.current(q), delay);
    }, [delay]);
}
/* ─────────────────────── Component ─────────────────────── */
export function AsyncSearchSelect({ value, onChange, onSearch, pageSize = 10, debounceMs = 500, placeholder = '— select —', emptyLabel, noResultsLabel = 'No results', loadingLabel = 'Loading…', searchPlaceholder = 'Search…', disabled, invalid, style, minWidth = 180, renderOption, }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const rootRef = useRef(null);
    const panelRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);
    const offsetRef = useRef(0);
    const queryRef = useRef('');
    const [panelPos, setPanelPos] = useState(null);
    /* ── position ── */
    const updatePos = useCallback(() => {
        if (!rootRef.current)
            return;
        const rect = rootRef.current.getBoundingClientRect();
        const PANEL_H = 360;
        const margin = 4;
        const spaceBelow = window.innerHeight - rect.bottom - margin;
        const spaceAbove = rect.top - margin;
        const top = spaceBelow >= PANEL_H || spaceBelow >= spaceAbove
            ? rect.bottom + margin
            : Math.max(8, rect.top - PANEL_H - margin);
        setPanelPos({ top, left: rect.left, width: Math.max(rect.width, 280) });
    }, []);
    useLayoutEffect(() => {
        if (open)
            updatePos();
    }, [open, updatePos]);
    /* ── outside click / scroll ── */
    useEffect(() => {
        if (!open)
            return;
        const onDocClick = (e) => {
            const target = e.target;
            if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        window.addEventListener('scroll', updatePos, true);
        window.addEventListener('resize', updatePos);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos);
        };
    }, [open, updatePos]);
    /* ── initial fetch ── */
    const doSearch = useCallback(async (q, append = false) => {
        const offset = append ? offsetRef.current : 0;
        if (!append) {
            setLoading(true);
            offsetRef.current = 0;
            queryRef.current = q;
        }
        else {
            setLoadingMore(true);
        }
        try {
            const page = await onSearch(q, offset);
            if (append) {
                setOptions((prev) => [...prev, ...page.items]);
            }
            else {
                setOptions(page.items);
            }
            setHasMore(page.hasMore);
            offsetRef.current = offset + page.items.length;
            if (!append)
                setActiveIdx(0);
        }
        catch {
            if (!append)
                setOptions([]);
            setHasMore(false);
        }
        finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [onSearch]);
    const debouncedSearch = useDebouncedCallback((q) => {
        void doSearch(q);
    }, debounceMs);
    /* ── infinite scroll ── */
    useEffect(() => {
        if (!open || !listRef.current)
            return;
        const el = listRef.current;
        const handleScroll = () => {
            if (loadingMore || !hasMore)
                return;
            const threshold = 40;
            if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
                void doSearch(queryRef.current, true);
            }
        };
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [open, loadingMore, hasMore, doSearch]);
    /* ── open handler ── */
    const handleOpen = useCallback(() => {
        if (disabled)
            return;
        setOpen(true);
        setQuery('');
        void doSearch('');
        setTimeout(() => searchRef.current?.focus(), 30);
    }, [disabled, doSearch]);
    /* ── search input change ── */
    const handleSearchChange = (val) => {
        setQuery(val);
        debouncedSearch(val);
    };
    /* ── keyboard ── */
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => Math.min(options.length - 1, i + 1));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => Math.max(0, i - 1));
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            const o = options[activeIdx];
            if (o) {
                onChange(o.value, o);
                setSelectedOption(o);
                setOpen(false);
            }
        }
        else if (e.key === 'Escape') {
            setOpen(false);
        }
    };
    /* ── display label ── */
    const displayLabel = selectedOption?.label ?? emptyLabel ?? value ?? null;
    /* ── styles ── */
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
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
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
        maxHeight: 360,
        display: 'flex',
        flexDirection: 'column',
    };
    const searchBox = {
        position: 'sticky',
        top: 0,
        padding: 8,
        borderBottom: `1px solid ${T.colors.border}`,
        background: T.colors.surface,
        zIndex: 1,
    };
    const searchInput = {
        width: '100%',
        height: 32,
        paddingInline: 10,
        borderRadius: T.radius.xs,
        border: 'none',
        boxShadow: T.shadow.sm,
        background: T.colors.surfaceMuted,
        color: T.colors.text,
        fontFamily: T.typography.fontFamily,
        fontSize: 12.5,
        outline: 'none',
    };
    return (_jsxs("div", { ref: rootRef, style: { position: 'relative', display: 'inline-flex', width: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }, children: [_jsxs("button", { type: "button", disabled: disabled, onClick: () => (open ? setOpen(false) : handleOpen()), "aria-haspopup": "listbox", "aria-expanded": open, style: trigger, children: [_jsx("span", { style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }, children: displayLabel ? (_jsx("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: displayLabel })) : (_jsx("span", { style: { color: T.colors.textSubtle }, children: placeholder })) }), _jsx("span", { "aria-hidden": true, style: {
                            color: T.colors.textSubtle,
                            transition: 'transform 160ms ease',
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            fontSize: 10,
                            flexShrink: 0,
                        }, children: "\u25BC" })] }), open && !disabled && typeof document !== 'undefined' &&
                createPortal(_jsxs("div", { ref: panelRef, role: "listbox", style: panel, children: [_jsx("div", { style: searchBox, children: _jsx("input", { ref: searchRef, type: "text", value: query, onChange: (e) => handleSearchChange(e.target.value), onKeyDown: handleKeyDown, placeholder: searchPlaceholder, style: searchInput, autoComplete: "off" }) }), _jsx("div", { ref: listRef, style: { overflowY: 'auto', flex: 1, padding: 4 }, children: loading ? (_jsx("div", { style: { padding: 16, color: T.colors.textSubtle, fontSize: 12.5, textAlign: 'center' }, children: loadingLabel })) : options.length === 0 ? (_jsx("div", { style: { padding: 16, color: T.colors.textSubtle, fontSize: 12.5, textAlign: 'center' }, children: noResultsLabel })) : (_jsxs(_Fragment, { children: [options.map((o, idx) => {
                                        const isActive = idx === activeIdx;
                                        const isSelected = o.value === value;
                                        const itemStyle = {
                                            padding: '8px 10px',
                                            borderRadius: T.radius.sm,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                            fontSize: 13,
                                            color: T.colors.text,
                                            background: isSelected
                                                ? T.colors.brandSoft
                                                : isActive
                                                    ? T.colors.surfaceMuted
                                                    : 'transparent',
                                            fontWeight: isSelected ? 600 : 500,
                                        };
                                        return (_jsx("div", { role: "option", "aria-selected": isSelected, onMouseEnter: () => setActiveIdx(idx), onClick: () => {
                                                onChange(o.value, o);
                                                setSelectedOption(o);
                                                setOpen(false);
                                            }, style: itemStyle, children: renderOption ? (renderOption(o, isSelected)) : (_jsxs(_Fragment, { children: [_jsx("span", { children: o.label }), o.description && (_jsx("span", { style: { fontSize: 11, color: T.colors.textSubtle, fontWeight: 400 }, children: o.description }))] })) }, o.value));
                                    }), loadingMore && (_jsx("div", { style: { padding: 8, color: T.colors.textSubtle, fontSize: 11.5, textAlign: 'center' }, children: loadingLabel }))] })) })] }), document.body)] }));
}
