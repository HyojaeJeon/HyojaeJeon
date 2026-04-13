'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
function getPageNumbers(current, total) {
    if (total <= 7)
        return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3)
        pages.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++)
        pages.push(i);
    if (current < total - 2)
        pages.push('ellipsis');
    if (total > 1)
        pages.push(total);
    return pages;
}
export function Pagination({ skip, take, total, onPageChange, pageSizeOptions, onPageSizeChange, }) {
    const currentPage = Math.floor(skip / take) + 1;
    const totalPages = Math.max(1, Math.ceil(total / take));
    const rangeStart = total === 0 ? 0 : skip + 1;
    const rangeEnd = Math.min(skip + take, total);
    const isFirst = currentPage <= 1;
    const isLast = currentPage >= totalPages;
    const root = {
        display: 'flex',
        alignItems: 'center',
        gap: T.spacing.md,
        fontFamily: T.typography.fontFamily,
        fontSize: 13,
        color: T.colors.text,
    };
    const btnBase = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
        height: 32,
        padding: `0 ${T.spacing.sm}`,
        borderRadius: T.radius.xs,
        border: 'none',
        background: 'transparent',
        color: T.colors.text,
        fontFamily: T.typography.fontFamily,
        fontSize: 13,
        fontWeight: T.typography.bodyWeight,
        cursor: 'pointer',
        transition: 'background 120ms ease, color 120ms ease',
    };
    const disabledBtn = {
        ...btnBase,
        color: T.colors.textSubtle,
        cursor: 'not-allowed',
        opacity: 0.5,
    };
    const activeBtn = {
        ...btnBase,
        background: T.colors.brand,
        color: T.colors.brandFg,
        fontWeight: T.typography.emphasisWeight,
    };
    const hoverStyle = (base) => ({
        ...base,
    });
    const selectStyle = {
        height: 32,
        paddingInline: T.spacing.sm,
        borderRadius: T.radius.xs,
        border: 'none',
        boxShadow: T.shadow.sm,
        background: T.colors.surface,
        color: T.colors.text,
        fontFamily: T.typography.fontFamily,
        fontSize: 13,
        cursor: 'pointer',
    };
    const pages = getPageNumbers(currentPage, totalPages);
    return (_jsxs("div", { style: root, children: [_jsxs("span", { style: { color: T.colors.textMuted, fontSize: 12.5, whiteSpace: 'nowrap' }, children: [rangeStart, "\u2013", rangeEnd, " of ", total] }), pageSizeOptions && onPageSizeChange && (_jsx("select", { value: take, onChange: (e) => onPageSizeChange(Number(e.target.value)), style: selectStyle, children: pageSizeOptions.map((size) => (_jsxs("option", { value: size, children: [size, " / page"] }, size))) })), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx("button", { type: "button", disabled: isFirst, onClick: () => onPageChange(skip - take), style: isFirst ? disabledBtn : btnBase, "aria-label": "Previous page", onMouseEnter: (e) => {
                            if (!isFirst)
                                e.currentTarget.style.background = T.colors.surfaceMuted;
                        }, onMouseLeave: (e) => {
                            if (!isFirst)
                                e.currentTarget.style.background = 'transparent';
                        }, children: "\u2039" }), pages.map((p, idx) => p === 'ellipsis' ? (_jsx("span", { style: { ...btnBase, cursor: 'default', color: T.colors.textSubtle }, children: "..." }, `ellipsis-${idx}`)) : (_jsx("button", { type: "button", onClick: () => onPageChange((p - 1) * take), style: p === currentPage ? activeBtn : hoverStyle(btnBase), onMouseEnter: (e) => {
                            if (p !== currentPage)
                                e.currentTarget.style.background = T.colors.surfaceMuted;
                        }, onMouseLeave: (e) => {
                            if (p !== currentPage)
                                e.currentTarget.style.background = 'transparent';
                        }, children: p }, p))), _jsx("button", { type: "button", disabled: isLast, onClick: () => onPageChange(skip + take), style: isLast ? disabledBtn : btnBase, "aria-label": "Next page", onMouseEnter: (e) => {
                            if (!isLast)
                                e.currentTarget.style.background = T.colors.surfaceMuted;
                        }, onMouseLeave: (e) => {
                            if (!isLast)
                                e.currentTarget.style.background = 'transparent';
                        }, children: "\u203A" })] })] }));
}
