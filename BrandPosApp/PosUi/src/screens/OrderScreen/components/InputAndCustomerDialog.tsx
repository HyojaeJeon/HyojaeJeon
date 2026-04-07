'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// ─── Types ────────────────────────────────────────────
type InputMode = 'itemCode' | 'customerNumber' | 'customerSearch';

interface InputAndCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onItemCodeSubmit?: (code: string) => void;
  onCustomerNumberSubmit?: (number: string) => void;
  onCustomerSearch?: () => void;
  onCustomerUnlink?: () => void;
  onCustomerRegister?: () => void;
}

// ─── Numpad keys ──────────────────────────────────────
const NUMPAD_KEYS = [
  ['7', '8', '9', 'BS'],
  ['4', '5', '6', 'CLR'],
  ['1', '2', '3', '0'],
];

const BOTTOM_KEYS = ['만', '천', '확인'];

// ─── InputAndCustomerDialog ───────────────────────────
export default function InputAndCustomerDialog({
  open,
  onClose,
  onItemCodeSubmit,
  onCustomerNumberSubmit,
  onCustomerSearch,
  onCustomerUnlink,
  onCustomerRegister,
}: InputAndCustomerDialogProps) {
  const [mode, setMode] = useState<InputMode>('itemCode');
  const [inputValue, setInputValue] = useState('');

  const handleNumpadPress = useCallback((key: string) => {
    switch (key) {
      case 'BS':
        setInputValue((prev) => prev.slice(0, -1));
        break;
      case 'CLR':
        setInputValue('');
        break;
      case '만':
        setInputValue((prev) => String(Number(prev || '0') * 10000));
        break;
      case '천':
        setInputValue((prev) => String(Number(prev || '0') * 1000));
        break;
      case '확인':
        handleConfirm();
        break;
      default:
        setInputValue((prev) => prev + key);
        break;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (!inputValue) return;

    if (mode === 'itemCode') {
      // TODO: look up item by code via ItemMgr, add to order
      onItemCodeSubmit?.(inputValue);
    } else if (mode === 'customerNumber') {
      // TODO: CUSTOMER:SEARCH bridge call with customer number
      onCustomerNumberSubmit?.(inputValue);
    }

    setInputValue('');
  }, [mode, inputValue, onItemCodeSubmit, onCustomerNumberSubmit]);

  const handleModeChange = useCallback((newMode: InputMode) => {
    setMode(newMode);
    setInputValue('');
  }, []);

  const handleCustomerSearch = useCallback(() => {
    // TODO: open CustomerSearchModal
    onCustomerSearch?.();
  }, [onCustomerSearch]);

  const handleCustomerUnlink = useCallback(() => {
    // TODO: unlink customer from current order (UI local)
    onCustomerUnlink?.();
  }, [onCustomerUnlink]);

  const handleCustomerRegister = useCallback(() => {
    // TODO: open CustomerRegisterModal (CUSTOMER:REGISTER)
    onCustomerRegister?.();
  }, [onCustomerRegister]);

  return (
    <Modal open={open} onClose={onClose} title="빠른 입력" size="md">
      <div className="flex gap-4">
        {/* Left: mode switch buttons */}
        <div className="flex flex-col gap-2 shrink-0 w-32">
          <Button
            variant={mode === 'itemCode' ? 'primary' : 'secondary'}
            size="md"
            fullWidth
            onClick={() => handleModeChange('itemCode')}
          >
            상품코드입력
          </Button>
          <Button
            variant={mode === 'customerNumber' ? 'primary' : 'secondary'}
            size="md"
            fullWidth
            onClick={() => handleModeChange('customerNumber')}
          >
            고객번호입력
          </Button>
          <Button
            variant={mode === 'customerSearch' ? 'primary' : 'secondary'}
            size="md"
            fullWidth
            onClick={handleCustomerSearch}
          >
            고객찾기
          </Button>

          <div className="mt-auto flex flex-col gap-2">
            <Button variant="ghost" size="sm" fullWidth onClick={handleCustomerUnlink}>
              고객등록해제
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={handleCustomerRegister}>
              고객등록
            </Button>
          </div>
        </div>

        {/* Right: input + numpad */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Input display */}
          <div className="bg-pos-surface border border-pos-border rounded-pos-sm px-3 py-2.5 text-right text-md font-bold text-pos-text tabular-nums min-h-[2.75rem]">
            {inputValue || '0'}
          </div>

          {/* Numpad grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {NUMPAD_KEYS.flat().map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleNumpadPress(key)}
                className={`
                  h-touch-xl flex items-center justify-center
                  rounded-pos-btn font-semibold text-lg
                  transition-transform duration-fast select-none cursor-pointer
                  active:scale-[0.95]
                  ${key === 'BS' || key === 'CLR'
                    ? 'bg-warn-300 text-pos-text active:bg-warn-500'
                    : 'bg-pos-surface text-pos-text active:bg-gray-300'}
                `}
              >
                {key === 'BS' ? '←' : key}
              </button>
            ))}
          </div>

          {/* Bottom row: 만, 천, 확인 */}
          <div className="grid grid-cols-3 gap-1.5">
            {BOTTOM_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleNumpadPress(key)}
                className={`
                  h-touch-xl flex items-center justify-center
                  rounded-pos-btn font-semibold text-lg
                  transition-transform duration-fast select-none cursor-pointer
                  active:scale-[0.95]
                  ${key === '확인'
                    ? 'bg-primary-500 text-pos-text-inverse active:bg-primary-700'
                    : 'bg-pos-surface text-pos-text active:bg-gray-300'}
                `}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
