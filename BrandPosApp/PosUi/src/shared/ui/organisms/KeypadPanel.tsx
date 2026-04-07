'use client';

import NumPad from '../molecules/NumPad';

interface KeypadPanelProps {
  onInput: (key: string) => void;
  onConfirm: () => void;
  onClear: () => void;
  onBackspace: () => void;
  display: string;
  disabled?: boolean;
}

/**
 * KeypadPanel -- 결제 금액 입력 키패드
 *
 * 상단에 AmountInput 형태의 금액 표시, 하단에 NumPad를 결합한다.
 */
export default function KeypadPanel({
  onInput,
  onConfirm,
  onClear,
  onBackspace,
  display,
  disabled = false,
}: KeypadPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 금액 표시 영역 */}
      <div
        className={`
          h-touch-lg px-4
          flex items-center justify-end
          bg-pos-surface rounded-pos-input
          border border-pos-border
          ${disabled ? 'opacity-[var(--opacity-disabled)]' : ''}
        `}
      >
        <span className="font-mono tabular-nums font-bold text-2xl text-pos-text select-none">
          {display || '0'}
        </span>
      </div>

      {/* 숫자 키패드 */}
      <NumPad
        onInput={onInput}
        onConfirm={onConfirm}
        onClear={onClear}
        onBackspace={onBackspace}
        disabled={disabled}
      />
    </div>
  );
}
