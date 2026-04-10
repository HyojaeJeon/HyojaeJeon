/**
 * Modal — 공용 다이얼로그 primitive.
 * - overlay + centered panel (portal)
 * - ESC / overlay click 닫힘
 * - title / body / footer slot
 */
import { type ReactNode } from 'react';
export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    width?: number | string;
    closeOnOverlayClick?: boolean;
}
export declare function Modal({ open, onClose, title, description, footer, children, width, closeOnOverlayClick, }: ModalProps): import("react").ReactPortal | null;
