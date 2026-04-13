'use client';

import { useState, useRef, useEffect, type CSSProperties, type ChangeEvent } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';

const COUNTRIES = [
  { code: 'VN', flag: '🇻🇳', dialCode: '+84', placeholder: '795 050 727', maxDigits: 10 },
  { code: 'KR', flag: '🇰🇷', dialCode: '+82', placeholder: '10 1234 5678', maxDigits: 11 },
] as const;

type CountryCode = (typeof COUNTRIES)[number]['code'];

export interface PhoneInputProps {
  value: string;
  onChange: (e164: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

function parseE164(raw: string): { countryCode: CountryCode; localNumber: string } {
  for (const c of COUNTRIES) {
    if (raw.startsWith(c.dialCode)) {
      return { countryCode: c.code, localNumber: raw.slice(c.dialCode.length) };
    }
  }
  return { countryCode: 'VN', localNumber: raw.replace(/^\+?\d{0,3}/, '') };
}

function stripLeadingZero(num: string): string {
  return num.replace(/^0+/, '');
}

export function PhoneInput({ value, onChange, disabled, invalid }: PhoneInputProps) {
  const parsed = parseE164(value);
  const [country, setCountry] = useState<CountryCode>(parsed.countryCode);
  const [localNum, setLocalNum] = useState(parsed.localNumber);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countryDef = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const emitChange = (cc: CountryCode, num: string) => {
    const def = COUNTRIES.find((c) => c.code === cc) ?? COUNTRIES[0];
    const cleaned = stripLeadingZero(num.replace(/[^\d]/g, ''));
    const trimmed = cleaned.slice(0, def.maxDigits);
    onChange(trimmed ? `${def.dialCode}${trimmed}` : '');
  };

  const selectCountry = (cc: CountryCode) => {
    setCountry(cc);
    setDropdownOpen(false);
    emitChange(cc, localNum);
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = stripLeadingZero(e.target.value.replace(/[^\d]/g, ''));
    setLocalNum(cleaned);
    emitChange(country, cleaned);
  };

  const wrap: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    height: 36,
    borderRadius: T.radius.md,
    border: 'none',
    boxShadow: invalid ? `inset 0 0 0 1.5px ${T.colors.danger}` : T.shadow.sm,
    background: T.colors.surface,
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    fontSize: 13,
    minWidth: 200,
    overflow: 'visible',
    position: 'relative',
  };

  const triggerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: T.colors.surfaceMuted,
    color: T.colors.text,
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    paddingInline: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRight: `1px solid ${T.colors.border}`,
    borderRadius: `${T.radius.md} 0 0 ${T.radius.md}`,
    whiteSpace: 'nowrap',
  };

  const menuStyle: CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    background: T.colors.surface,
    border: `1px solid ${T.colors.border}`,
    borderRadius: T.radius.md,
    boxShadow: T.shadow.md,
    zIndex: 50,
    minWidth: 120,
    overflow: 'hidden',
  };

  const optionStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    padding: '7px 12px',
    border: 'none',
    background: isActive ? T.colors.surfaceMuted : 'transparent',
    color: T.colors.text,
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: isActive ? 600 : 400,
    cursor: 'pointer',
    textAlign: 'left' as const,
  });

  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    paddingInline: 10,
  };

  return (
    <div style={wrap} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setDropdownOpen((v) => !v)}
        style={triggerStyle}
        disabled={disabled}
      >
        <span>{countryDef.flag}</span>
        <span>{countryDef.dialCode}</span>
        <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
      </button>

      {dropdownOpen && (
        <div style={menuStyle}>
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => selectCountry(c.code)}
              style={optionStyle(c.code === country)}
            >
              <span>{c.flag}</span>
              <span style={{ fontWeight: 600 }}>{c.dialCode}</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="tel"
        value={localNum}
        onChange={handleNumberChange}
        placeholder={countryDef.placeholder}
        disabled={disabled}
        style={inputStyle}
        inputMode="numeric"
      />
    </div>
  );
}
