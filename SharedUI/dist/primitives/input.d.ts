import type { InputHTMLAttributes, ReactNode } from 'react';
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    invalid?: boolean;
}
export declare function Input({ startIcon, endIcon, invalid, style, ...props }: InputProps): import("react/jsx-runtime").JSX.Element;
