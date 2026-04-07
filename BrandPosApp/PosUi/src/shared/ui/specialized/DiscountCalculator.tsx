'use client';

import { useState } from 'react';
import NumPad from '../molecules/NumPad';

type DiscountMode = 'amount' | 'percent';

interface DiscountCalculatorProps {
  originalAmount: number;
  onApply: (discountedAmount: number) => void;
  currency?: string;
}

/**
 * DiscountCalculator -- 할인 계산기
 *
 * 금액 할인 / 비율 할인 토글. NumPad로 입력. 할인 적용 후 금액 실시간 미리보기.
 */
export default function DiscountCalculator({
  originalAmount,
  onApply,
  currency = '₫',
}: DiscountCalculatorProps) {
  const [mode, setMode] = useState<DiscountMode>('amount');
  const [inputValue, setInputValue] = useState('');

  const numericValue = inputValue === '' ? 0 : parseInt(inputValue, 10);
  const discountAmount = mode === 'amount'
    ? Math.min(numericValue, originalAmount)
    : Math.min(Math.floor(originalAmount * numericValue / 100), originalAmount);
  const discountedTotal = originalAmount - discountAmount;

  const fmt = (v: number) => v.toLocaleString('ko-KR');

  const handleInput = (key: string) => {
    setInputValue((prev) => prev + key);
  };

  const handleClear = () => {
    setInputValue('');
  };

  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    onApply(discountedTotal);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 모드 토글 */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => { setMode('amount'); setInputValue(''); }}
          className={`
            flex-1 h-touch rounded-pos-btn text-sm font-semibold
            transition-transform duration-fast cursor-pointer select-none
            active:scale-[0.97]
            ${mode === 'amount'
              ? 'bg-primary-500 text-pos-text-inverse'
              : 'bg-pos-surface text-pos-text-secondary'}
          `}
        >
          금액 할인
        </button>
        <button
          type="button"
          onClick={() => { setMode('percent'); setInputValue(''); }}
          className={`
            flex-1 h-touch rounded-pos-btn text-sm font-semibold
            transition-transform duration-fast cursor-pointer select-none
            active:scale-[0.97]
            ${mode === 'percent'
              ? 'bg-primary-500 text-pos-text-inverse'
              : 'bg-pos-surface text-pos-text-secondary'}
          `}
        >
          비율 할인
        </button>
      </div>

      {/* 입력 표시 */}
      <div className="h-touch-lg px-4 flex items-center justify-end bg-pos-surface rounded-pos-input border border-pos-border">
        <span className="font-mono tabular-nums font-bold text-2xl text-pos-text select-none">
          {inputValue || '0'}
          <span className="text-md text-pos-text-muted ml-1">
            {mode === 'amount' ? currency : '%'}
          </span>
        </span>
      </div>

      {/* 실시간 미리보기 */}
      <div className="flex flex-col gap-1 p-3 bg-pos-surface rounded-pos-sm">
        <div className="flex justify-between text-xs text-pos-text-secondary">
          <span>원래 금액</span>
          <span className="tabular-nums">{fmt(originalAmount)}{currency}</span>
        </div>
        <div className="flex justify-between text-xs text-pos-error">
          <span>할인 금액</span>
          <span className="tabular-nums">-{fmt(discountAmount)}{currency}</span>
        </div>
        <div className="border-t border-pos-border my-1" />
        <div className="flex justify-between text-md font-bold text-primary-500">
          <span>결제 금액</span>
          <span className="tabular-nums">{fmt(discountedTotal)}{currency}</span>
        </div>
      </div>

      {/* 키패드 */}
      <NumPad
        onInput={handleInput}
        onConfirm={handleConfirm}
        onClear={handleClear}
        onBackspace={handleBackspace}
      />
    </div>
  );
}
