'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import NumPad from '@shared/ui/molecules/NumPad';

/**
 * NumpadSettingsDialog (SET-NUMPAD / NUMPAD)
 *
 * 공용 모달형 숫자 입력기. 여러 설정 화면에서 재사용.
 *
 * Legacy: IDD_NUMPAD
 */

interface NumpadSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  initialValue?: number;
  min?: number;
  max?: number;
  onConfirm: (value: number) => void;
}

export default function NumpadSettingsDialog({
  open,
  onClose,
  title = '숫자 입력',
  initialValue = 0,
  min,
  max,
  onConfirm,
}: NumpadSettingsDialogProps) {
  const [displayValue, setDisplayValue] = useState<string>(
    initialValue > 0 ? String(initialValue) : ''
  );

  const handleInput = useCallback(
    (key: string) => {
      setDisplayValue((prev) => {
        const next = prev + key;
        if (max !== undefined && Number(next) > max) return prev;
        return next;
      });
    },
    [max]
  );

  const handleBackspace = useCallback(() => {
    setDisplayValue((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setDisplayValue('');
  }, []);

  const handleConfirm = useCallback(() => {
    const numValue = Number(displayValue) || 0;
    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;
    onConfirm(numValue);
    onClose();
  }, [displayValue, min, max, onConfirm, onClose]);

  const numericValue = Number(displayValue) || 0;

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>선택</Button>
        </>
      }
    >
      <div className="flex h-full flex-col gap-3">
        {/* 입력값 표시 */}
        <div className="rounded-xl bg-pos-bg px-4 py-3 text-right text-2xl font-bold text-pos-text shadow-pos-card">
          {numericValue.toLocaleString() || '0'}
        </div>

        {/* 숫자 키패드 */}
        <NumPad
          onInput={handleInput}
          onConfirm={handleConfirm}
          onClear={handleClear}
          onBackspace={handleBackspace}
        />
      </div>
    </FullScreenPanel>
  );
}
