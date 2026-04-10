'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ConfirmModal — 공용 확인 다이얼로그 primitive.
 * Modal + Button 재사용. ESC 닫힘, Enter 확인.
 * 도메인 로직/번역 없음 — 문자열은 호출부에서 i18n 후 주입.
 */
import { useEffect } from 'react';
import { Modal } from './modal';
import { Button } from './button';
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, cancelLabel, variant = 'default', busy = false, }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => {
            if (e.key === 'Enter' && !busy) {
                e.preventDefault();
                void onConfirm();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, busy, onConfirm]);
    return (_jsx(Modal, { open: open, onClose: onClose, title: title, width: 440, footer: _jsxs(_Fragment, { children: [_jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: onClose, disabled: busy, children: cancelLabel }), _jsx(Button, { type: "button", variant: variant === 'danger' ? 'danger' : 'primary', size: "sm", disabled: busy, onClick: () => void onConfirm(), children: confirmLabel })] }), children: _jsx("div", { style: { fontSize: 13, lineHeight: 1.55 }, children: message }) }));
}
