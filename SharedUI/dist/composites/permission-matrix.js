'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 한국어: PermissionMatrix — Permission(행) × Role(열) 체크박스 그리드 composite.
 *   - 행(Y) = Permission (label + key 보조)
 *   - 열(X) = Role (label + code 보조)
 *   - 셀 전체 클릭 가능 (체크박스 자체 클릭도 동일 동작)
 *   - hover 시 해당 행/열에 연한 배경 highlight 로 교차 지점 표시
 *   - 비즈니스 로직/데이터 fetching 없음 (호출자가 상태 관리)
 * Tiếng Việt: Lưới ma trận Permission × Role với hover highlight hàng/cột.
 */
import { useState } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
import { Checkbox } from '../primitives/checkbox';
export function PermissionMatrix({ roles, permissions, assigned, editable = true, busyCell = null, onToggle, emptyLabel = 'No data', }) {
    const [hover, setHover] = useState(null);
    if (roles.length === 0 || permissions.length === 0) {
        return (_jsx("div", { style: {
                padding: 32,
                textAlign: 'center',
                color: T.colors.textMuted,
                fontSize: 13,
                fontFamily: T.typography.fontFamily,
                background: T.colors.surface,
                border: `1px solid ${T.colors.border}`,
                borderRadius: T.radius.md,
            }, children: emptyLabel }));
    }
    const wrap = {
        overflow: 'auto',
        border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.lg,
        background: T.colors.surface,
        fontFamily: T.typography.fontFamily,
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    };
    const table = {
        borderCollapse: 'separate',
        borderSpacing: 0,
        width: '100%',
        fontSize: 12,
    };
    const cornerTh = {
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 3,
        background: T.colors.surfaceMuted,
        borderBottom: `1px solid ${T.colors.border}`,
        borderRight: `1px solid ${T.colors.border}`,
        padding: '10px 14px',
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 600,
        color: T.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        whiteSpace: 'nowrap',
        minWidth: 260,
    };
    const roleTh = (colIdx) => {
        const isHover = hover?.col === colIdx;
        return {
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background: isHover ? T.colors.brandSoft : T.colors.surfaceMuted,
            borderBottom: `1px solid ${T.colors.border}`,
            borderRight: `1px solid ${T.colors.border}`,
            padding: '10px 12px',
            textAlign: 'center',
            fontWeight: 600,
            color: T.colors.text,
            whiteSpace: 'nowrap',
            transition: 'background 120ms ease',
            minWidth: 130,
        };
    };
    const permTh = (rowIdx) => {
        const isHover = hover?.row === rowIdx;
        return {
            position: 'sticky',
            left: 0,
            zIndex: 1,
            background: isHover ? T.colors.brandSoft : T.colors.surface,
            borderBottom: `1px solid ${T.colors.border}`,
            borderRight: `1px solid ${T.colors.border}`,
            padding: '10px 14px',
            textAlign: 'left',
            fontWeight: 500,
            color: T.colors.text,
            whiteSpace: 'nowrap',
            transition: 'background 120ms ease',
        };
    };
    const cellTd = (rowIdx, colIdx, disabled) => {
        const isRowHover = hover?.row === rowIdx;
        const isColHover = hover?.col === colIdx;
        const isExact = isRowHover && isColHover;
        let bg = T.colors.surface;
        if (isExact)
            bg = T.colors.brandSoft;
        else if (isRowHover || isColHover)
            bg = T.colors.surfaceMuted;
        return {
            padding: '10px 6px',
            borderBottom: `1px solid ${T.colors.border}`,
            borderRight: `1px solid ${T.colors.border}`,
            textAlign: 'center',
            background: bg,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 100ms ease',
            userSelect: 'none',
        };
    };
    return (_jsx("div", { style: wrap, children: _jsxs("table", { style: table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: cornerTh, children: "Permission \\ Role" }), roles.map((role, colIdx) => (_jsxs("th", { style: roleTh(colIdx), scope: "col", onMouseEnter: () => setHover((h) => ({ row: h?.row ?? -1, col: colIdx })), onMouseLeave: () => setHover((h) => (h?.col === colIdx ? { row: h.row, col: -1 } : h)), children: [_jsx("div", { style: { fontSize: 12, color: T.colors.text }, children: role.roleName }), _jsx("div", { style: {
                                            fontSize: 10,
                                            color: T.colors.textMuted,
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                            fontWeight: 400,
                                            marginTop: 2,
                                        }, children: role.roleCode })] }, role.id)))] }) }), _jsx("tbody", { children: permissions.map((p, rowIdx) => (_jsxs("tr", { children: [_jsxs("th", { style: permTh(rowIdx), scope: "row", onMouseEnter: () => setHover((h) => ({ row: rowIdx, col: h?.col ?? -1 })), onMouseLeave: () => setHover((h) => (h?.row === rowIdx ? { row: -1, col: h.col } : h)), children: [_jsx("div", { style: { fontSize: 12, fontWeight: 600, color: T.colors.text }, children: p.description ?? p.permissionKey }), _jsx("div", { style: {
                                            fontSize: 10,
                                            color: T.colors.textMuted,
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                            marginTop: 2,
                                        }, children: p.permissionKey })] }), roles.map((role, colIdx) => {
                                const cellKey = `${role.id}:${p.permissionKey}`;
                                const checked = assigned.has(cellKey);
                                const isBusy = busyCell === cellKey;
                                const disabled = !editable || isBusy;
                                const toggle = () => {
                                    if (disabled)
                                        return;
                                    onToggle?.(role.id, p.permissionKey, !checked);
                                };
                                return (_jsx("td", { style: cellTd(rowIdx, colIdx, disabled), onClick: toggle, onMouseEnter: () => setHover({ row: rowIdx, col: colIdx }), onMouseLeave: () => setHover((h) => h?.row === rowIdx && h?.col === colIdx ? null : h), "aria-label": `${role.roleCode} · ${p.permissionKey}`, children: _jsx(Checkbox, { checked: checked, disabled: disabled, onChange: () => toggle(), ariaLabel: `${role.roleCode} · ${p.permissionKey}` }) }, cellKey));
                            })] }, p.permissionKey))) })] }) }));
}
