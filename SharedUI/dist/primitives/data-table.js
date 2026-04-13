'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
export function DataTable({ columns, rows, rowKey, emptyState, caption, compact = false, onRowClick, expandedRowKey, renderExpandedRow, }) {
    if (rows.length === 0) {
        return (_jsx("div", { style: {
                display: 'flex',
                flex: 1,
                minHeight: 220,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: T.colors.textSubtle,
                fontSize: 13,
                fontFamily: T.typography.fontFamily,
                fontWeight: 500,
            }, children: emptyState ?? 'No data' }));
    }
    const cellPaddingY = compact ? '8px' : '12px';
    const cellPaddingX = '14px';
    return (_jsxs("div", { style: {
            overflowX: 'auto',
            borderRadius: T.radius.lg,
            background: T.colors.surface,
        }, children: [caption && (_jsx("div", { style: {
                    padding: `${T.spacing.sm} ${T.spacing.lg}`,
                    borderBottom: 'none',
                    color: T.colors.textMuted,
                    fontSize: 12,
                }, children: caption })), _jsxs("table", { style: {
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: T.typography.fontFamily,
                }, children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { style: {
                                    textAlign: column.align ?? 'left',
                                    padding: `10px ${cellPaddingX}`,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color: T.colors.textSubtle,
                                    background: T.colors.surfaceMuted,
                                    borderBottom: 'none',
                                    whiteSpace: 'nowrap',
                                    width: column.width,
                                    position: 'sticky',
                                    top: 0,
                                }, children: column.header }, column.key))) }) }), _jsx("tbody", { children: rows.map((row, index) => {
                            const key = rowKey(row, index);
                            const isExpanded = expandedRowKey != null && key === expandedRowKey;
                            return (_jsxs(React.Fragment, { children: [_jsx("tr", { onClick: onRowClick ? () => onRowClick(row, index) : undefined, style: {
                                            cursor: onRowClick ? 'pointer' : 'default',
                                            transition: 'background 120ms ease',
                                            background: isExpanded ? T.colors.surfaceMuted : undefined,
                                        }, onMouseEnter: (e) => {
                                            if (onRowClick && !isExpanded)
                                                e.currentTarget.style.background = T.colors.surfaceMuted;
                                        }, onMouseLeave: (e) => {
                                            if (onRowClick && !isExpanded)
                                                e.currentTarget.style.background = 'transparent';
                                        }, children: columns.map((column) => (_jsx("td", { style: {
                                                padding: `${cellPaddingY} ${cellPaddingX}`,
                                                borderTop: `1px solid rgb(0 0 0 / 0.04)`,
                                                textAlign: column.align ?? 'left',
                                                verticalAlign: 'middle',
                                                color: T.colors.text,
                                                fontSize: 13,
                                            }, children: column.render(row, index) }, column.key))) }), isExpanded && renderExpandedRow && (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, style: { padding: 0 }, children: renderExpandedRow(row, index) }) }))] }, key));
                        }) })] })] }));
}
