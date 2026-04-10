'use client';

import type { InputHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  invalid?: boolean;
}

export function Input({ startIcon, endIcon, invalid, style, ...props }: InputProps) {
  const wrap: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingInline: 12,
    borderRadius: T.radius.md,
    border: 'none',
    boxShadow: invalid
      ? `inset 0 0 0 1.5px ${T.colors.danger}`
      : T.shadow.sm,
    background: T.colors.surface,
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    fontSize: 13,
    minWidth: 200,
    transition: 'border-color 140ms ease, box-shadow 140ms ease',
  };
  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    ...style,
  };
  return (
    <label style={wrap}>
      {startIcon && <span style={{ color: T.colors.textSubtle, display: 'inline-flex' }}>{startIcon}</span>}
      <input {...props} style={inputStyle} />
      {endIcon && <span style={{ color: T.colors.textSubtle, display: 'inline-flex' }}>{endIcon}</span>}
    </label>
  );
}
