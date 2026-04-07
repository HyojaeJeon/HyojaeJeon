'use client';

import { useState, useCallback } from 'react';
import Button from '../atoms/Button';

// ─── Types ────────────────────────────────────────────
type PhoneNumPadSize = 'full' | 'compact';

interface PhoneNumPadProps {
  open: boolean;
  onClose: () => void;
  onSearch?: (phoneNumber: string) => void;
  size?: PhoneNumPadSize;
  title?: string;
}

// ─── Constants ────────────────────────────────────────
const NUMPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

// ─── PhoneNumPad ──────────────────────────────────────
/**
 * PhoneNumPad - 고객 전화번호 입력용 넘패드 모달
 *
 * 레거시 IDD_PHONE_NUMPAD(full: 512x386)와 IDD_PHONE_NUMPAD2(compact: 400x300)를
 * 단일 컴포넌트에서 `size` prop으로 분기한다.
 * 고객 대면 화면이므로 한국어/베트남어 안내를 동시에 표시한다.
 */
export default function PhoneNumPad({
  open,
  onClose,
  onSearch,
  size = 'full',
  title = 'Hyojung POS',
}: PhoneNumPadProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDigit = useCallback((digit: string) => {
    setPhoneNumber((prev) => {
      if (prev.length >= 11) return prev; // max phone number length
      return prev + digit;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  }, []);

  const handleRefresh = useCallback(() => {
    setPhoneNumber('');
  }, []);

  const handleSearch = useCallback(() => {
    if (phoneNumber.length < 4) return; // minimum search length
    // TODO: onSearch callback - caller handles CustMgr.SearchByPhone()
    onSearch?.(phoneNumber);
  }, [phoneNumber, onSearch]);

  const handleCancel = useCallback(() => {
    // TODO: hidden cancel (legacy compat)
    setPhoneNumber('');
    onClose();
  }, [onClose]);

  if (!open) return null;

  const isCompact = size === 'compact';
  const buttonSize = isCompact ? 'h-12 text-lg' : 'h-16 text-xl';
  const containerWidth = isCompact ? 'w-[400px]' : 'w-[512px]';

  // Format phone number for display (010-1234-5678)
  const formattedPhone = phoneNumber.replace(
    /(\d{3})(\d{0,4})(\d{0,4})/,
    (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join('-'),
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: 'var(--opacity-overlay)' }}
        onClick={handleCancel}
      />

      {/* Numpad container */}
      <div
        className={`
          relative bg-pos-bg rounded-pos-2xl shadow-pos-modal
          flex flex-col animate-pos-slide-up
          ${containerWidth}
        `}
      >
        {/* Title */}
        <div className="text-center pt-5 pb-2">
          <h2 className={`font-bold text-pos-text ${isCompact ? 'text-lg' : 'text-xl'}`}>
            {title}
          </h2>
        </div>

        {/* Bilingual guide messages (ko + vi simultaneous display) */}
        <div className="text-center px-6 pb-3 space-y-0.5">
          <p className={`text-pos-text-secondary ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {/* i18n msgKey: customer.phone_guide_ko */}
            전화번호를 입력해 주세요
          </p>
          <p className={`text-pos-text-muted ${isCompact ? 'text-2xs' : 'text-xs'}`}>
            {/* i18n msgKey: customer.phone_guide_vi */}
            Vui long nhap so dien thoai
          </p>
        </div>

        {/* Phone number display */}
        <div className="mx-6 mb-4">
          <div className={`
            bg-pos-surface border border-pos-border rounded-pos-lg
            text-center font-bold text-pos-text tabular-nums
            ${isCompact ? 'px-4 py-3 text-xl' : 'px-6 py-4 text-2xl'}
          `}>
            {formattedPhone || '-'}
          </div>
        </div>

        {/* Numpad grid */}
        <div className="px-6 space-y-2">
          {NUMPAD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-3 gap-2">
              {row.map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className={`
                    ${buttonSize} flex items-center justify-center
                    rounded-pos-btn font-bold
                    bg-pos-surface text-pos-text
                    active:bg-gray-300 active:scale-[0.95]
                    transition-transform duration-fast
                    select-none cursor-pointer
                  `}
                >
                  {digit}
                </button>
              ))}
            </div>
          ))}

          {/* Bottom row: refresh, 0, backspace */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className={`
                ${buttonSize} flex items-center justify-center
                rounded-pos-btn font-bold
                bg-warn-300 text-pos-text
                active:bg-warn-500 active:scale-[0.95]
                transition-transform duration-fast
                select-none cursor-pointer text-sm
              `}
            >
              재입력
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className={`
                ${buttonSize} flex items-center justify-center
                rounded-pos-btn font-bold
                bg-pos-surface text-pos-text
                active:bg-gray-300 active:scale-[0.95]
                transition-transform duration-fast
                select-none cursor-pointer
              `}
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className={`
                ${buttonSize} flex items-center justify-center
                rounded-pos-btn font-bold
                bg-pos-surface text-pos-text
                active:bg-gray-300 active:scale-[0.95]
                transition-transform duration-fast
                select-none cursor-pointer
              `}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l4-4M5 12l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action buttons: close + search */}
        <div className="flex gap-3 px-6 pt-4 pb-6">
          <Button variant="secondary" size="lg" onClick={onClose} className="flex-1">
            닫기
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSearch}
            disabled={phoneNumber.length < 4}
            className="flex-[2]"
          >
            조회
          </Button>
        </div>
      </div>
    </div>
  );
}
