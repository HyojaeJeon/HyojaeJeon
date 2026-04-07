'use client';

interface ChangeCalculatorProps {
  totalAmount: number;
  receivedAmount: number;
  currency?: string;
}

/**
 * ChangeCalculator -- 거스름돈 계산기
 *
 * 받을 금액, 받은 금액, 거스름돈을 자동 계산하여 표시한다.
 */
export default function ChangeCalculator({
  totalAmount,
  receivedAmount,
  currency = '₫',
}: ChangeCalculatorProps) {
  const change = receivedAmount - totalAmount;
  const fmt = (v: number) => v.toLocaleString('ko-KR');

  return (
    <div className="flex flex-col gap-3 p-4 bg-pos-bg rounded-pos-card border border-pos-border">
      {/* 받을 금액 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-pos-text-secondary">받을 금액</span>
        <span className="text-md font-bold text-pos-text tabular-nums">
          {fmt(totalAmount)}{currency}
        </span>
      </div>

      {/* 받은 금액 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-pos-text-secondary">받은 금액</span>
        <span className="text-md font-bold text-pos-text tabular-nums">
          {fmt(receivedAmount)}{currency}
        </span>
      </div>

      {/* 구분선 */}
      <div className="border-t border-pos-border" />

      {/* 거스름돈 */}
      <div className="flex justify-between items-center">
        <span className="text-md font-bold text-pos-text">거스름돈</span>
        <span
          className={`text-xl font-bold tabular-nums ${
            change >= 0 ? 'text-primary-500' : 'text-pos-error'
          }`}
        >
          {change >= 0 ? fmt(change) : `-${fmt(Math.abs(change))}`}{currency}
        </span>
      </div>
    </div>
  );
}
