/**
 * ConfirmModal — 공용 확인 다이얼로그 primitive.
 * Modal + Button 재사용. ESC 닫힘, Enter 확인.
 * 도메인 로직/번역 없음 — 문자열은 호출부에서 i18n 후 주입.
 */
import { type ReactNode } from 'react';
export interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: ReactNode;
    message: ReactNode;
    confirmLabel: string;
    cancelLabel: string;
    variant?: 'default' | 'danger';
    busy?: boolean;
}
export declare function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, cancelLabel, variant, busy, }: ConfirmModalProps): import("react/jsx-runtime").JSX.Element;
