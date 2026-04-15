'use client';

import { type CSSProperties } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, disabled, label, size = 'md' }: ToggleProps) {
  const w = size === 'sm' ? 36 : 44;
  const h = size === 'sm' ? 20 : 24;
  const knob = size === 'sm' ? 16 : 20;
  const travel = w - knob - 4;

  const track: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: w,
    height: h,
    borderRadius: 999,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background 160ms ease, box-shadow 160ms ease',
    background: checked ? T.colors.brand : T.colors.surfaceMuted,
    boxShadow: checked ? 'none' : `inset 0 0 0 1.5px ${T.colors.borderStrong}`,
    flexShrink: 0,
  };

  const thumb: CSSProperties = {
    position: 'absolute',
    top: 2,
    left: 2,
    width: knob,
    height: knob,
    borderRadius: 999,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    transition: 'transform 160ms ease',
    transform: checked ? `translateX(${travel}px)` : 'translateX(0)',
  };

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={track}
      >
        <span style={thumb} />
      </button>
      {label && (
        <span style={{ fontSize: 13, fontWeight: 600, color: T.colors.text, fontFamily: T.typography.fontFamily }}>
          {label}
        </span>
      )}
    </label>
  );
}
