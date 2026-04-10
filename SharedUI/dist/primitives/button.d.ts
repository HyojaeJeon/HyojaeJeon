import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { SharedUiButtonSize, SharedUiButtonVariant } from '../types';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: SharedUiButtonVariant;
    size?: SharedUiButtonSize;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}
export declare function Button({ variant, size, startIcon, endIcon, loading, fullWidth, disabled, children, style, type, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
