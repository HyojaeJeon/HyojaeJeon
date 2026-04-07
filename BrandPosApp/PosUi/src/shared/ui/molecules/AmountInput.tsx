'use client';

type CurrencySymbol = '₫' | '₩' | '$';
type AmountSize = 'md' | 'lg' | 'xl';

interface AmountInputProps {
  value: number;
  currency: CurrencySymbol;
  size?: AmountSize;
  onChange?: (value: number) => void;
}

const sizeStyles: Record<AmountSize, string> = {
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

/**
 * AmountInput -- 통화 금액 표시
 *
 * 천 단위 구분기호 자동 적용. tabular-nums 고정폭 숫자.
 */
export default function AmountInput({
  value,
  currency,
  size = 'md',
  onChange,
}: AmountInputProps) {
  const formatted = value.toLocaleString('ko-KR');

  return (
    <div
      className={`
        inline-flex items-baseline gap-1
        font-mono tabular-nums font-bold
        text-pos-text select-none
        ${sizeStyles[size]}
      `}
    >
      {onChange ? (
        <input
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            const parsed = raw === '' ? 0 : parseInt(raw, 10);
            onChange(parsed);
          }}
          className={`
            bg-transparent border-none outline-none
            text-right font-mono tabular-nums font-bold
            text-pos-text w-full
            ${sizeStyles[size]}
          `}
        />
      ) : (
        <span>{formatted}</span>
      )}
      <span className="text-pos-text-secondary font-semibold">{currency}</span>
    </div>
  );
}
