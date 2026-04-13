'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Modal — 공용 다이얼로그 primitive.
 * - overlay + centered panel (portal)
 * - ESC / overlay click 닫힘
 * - title / body / footer slot
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sharedUiTokens as T } from '../foundation/tokens';
export function Modal({ open, onClose, title, description, footer, children, width = 520, closeOnOverlayClick = true, }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    if (!open || typeof document === 'undefined')
        return null;
    const overlay = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 16, 26, 0.52)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        padding: 16,
    };
    const panel = {
        width: typeof width === 'number' ? `${width}px` : width,
        maxWidth: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        background: T.colors.surface,
        borderRadius: T.radius.md,
        boxShadow: T.shadow.lg,
        color: T.colors.text,
        fontFamily: T.typography.fontFamily,
        display: 'flex',
        flexDirection: 'column',
    };
    const header = {
        padding: '18px 20px 8px',
        borderBottom: `1px solid ${T.colors.border}`,
        flexShrink: 0,
    };
    const body = {
        padding: '16px 20px',
        flex: 1,
        overflowY: 'auto',
    };
    const foot = {
        padding: '12px 20px 16px',
        borderTop: `1px solid ${T.colors.border}`,
        display: 'flex',
        gap: 8,
        justifyContent: 'flex-end',
        flexShrink: 0,
    };
    return createPortal(_jsx("div", { style: overlay, onMouseDown: (e) => {
            if (closeOnOverlayClick && e.target === e.currentTarget)
                onClose();
        }, role: "presentation", children: _jsxs("div", { role: "dialog", "aria-modal": "true", style: panel, children: [(title || description) && (_jsxs("div", { style: header, children: [title && (_jsx("div", { style: { fontSize: 15, fontWeight: 600, color: T.colors.text }, children: title })), description && (_jsx("div", { style: { fontSize: 12.5, color: T.colors.textSubtle, marginTop: 4 }, children: description }))] })), _jsx("div", { style: body, children: children }), footer && _jsx("div", { style: foot, children: footer })] }) }), document.body);
}
