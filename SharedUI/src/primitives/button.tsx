import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { sharedUiTokens } from '../foundation/tokens';
import type { SharedUiButtonSize, SharedUiButtonVariant } from '../types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SharedUiButtonVariant;
  size?: SharedUiButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const sizeStyles: Record<SharedUiButtonSize, { height: string; paddingInline: string; fontSize: string }> = {
  sm: { height: '34px', paddingInline: '12px', fontSize: '13px' },
  md: { height: '40px', paddingInline: '16px', fontSize: '14px' },
  lg: { height: '46px', paddingInline: '20px', fontSize: '15px' },
};

const variantStyles: Record<SharedUiButtonVariant, { background: string; color: string; border: string }> = {
  primary: {
    background: sharedUiTokens.colors.brand,
    color: '#ffffff',
    border: `1px solid ${sharedUiTokens.colors.brand}`,
  },
  secondary: {
    background: sharedUiTokens.colors.surface,
    color: sharedUiTokens.colors.text,
    border: `1px solid ${sharedUiTokens.colors.border}`,
  },
  ghost: {
    background: 'transparent',
    color: sharedUiTokens.colors.text,
    border: '1px solid transparent',
  },
  danger: {
    background: sharedUiTokens.colors.danger,
    color: '#ffffff',
    border: `1px solid ${sharedUiTokens.colors.danger}`,
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  loading = false,
  fullWidth = false,
  disabled,
  children,
  style,
  type = 'button',
  ...props
}: ButtonProps) {
  const merged: CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    borderRadius: sharedUiTokens.radius.md,
    fontFamily: sharedUiTokens.typography.fontFamily,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease',
    boxShadow: variant === 'primary' ? sharedUiTokens.shadow.sm : 'none',
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={merged}
      {...props}
    >
      {startIcon}
      <span>{loading ? 'Loading…' : children}</span>
      {endIcon}
    </button>
  );
}
