'use client';

// -------------------------------------------------------------------
// PaymentSummary -- 금액 요약 영역
// 총금액/할인/순금액/부가세/봉사료/받을금액/받은금액/거스름돈
// -------------------------------------------------------------------

interface PaymentSummaryProps {
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  tax?: number;
  serviceCharge?: number;
  receivedAmount: number;
  changeAmount: number;
  currency?: string;
}

export default function PaymentSummary({
  totalAmount,
  discountAmount,
  netAmount,
  tax = 0,
  serviceCharge = 0,
  receivedAmount,
  changeAmount,
  currency = '원',
}: PaymentSummaryProps) {
  const fmt = (v: number) => v.toLocaleString('ko-KR');

  return (
    <div className="flex flex-col gap-1 p-3 bg-pos-bg border-t border-pos-border shrink-0">
      <div className="flex justify-between text-sm">
        <span className="text-pos-text-secondary">총매출액</span>
        <span className="font-semibold text-pos-text tabular-nums">{fmt(totalAmount)}{currency}</span>
      </div>

      {discountAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-pos-text-secondary">할인금액</span>
          <span className="font-semibold text-pos-error tabular-nums">-{fmt(discountAmount)}{currency}</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-pos-text-secondary">주문금액</span>
        <span className="font-semibold text-pos-text tabular-nums">{fmt(netAmount)}{currency}</span>
      </div>

      {tax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-pos-text-secondary">부가세</span>
          <span className="font-semibold text-pos-text tabular-nums">{fmt(tax)}{currency}</span>
        </div>
      )}

      {serviceCharge > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-pos-text-secondary">봉사료</span>
          <span className="font-semibold text-pos-text tabular-nums">{fmt(serviceCharge)}{currency}</span>
        </div>
      )}

      <div className="border-t border-pos-border my-1" />

      <div className="flex justify-between text-sm">
        <span className="font-bold text-pos-text">받을금액</span>
        <span className="font-bold text-primary-500 tabular-nums text-md">{fmt(netAmount)}{currency}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-pos-text-secondary">받은금액</span>
        <span className="font-semibold text-pos-text tabular-nums">{fmt(receivedAmount)}{currency}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="font-bold text-pos-text">거스름돈</span>
        <span className={`font-bold tabular-nums text-md ${changeAmount >= 0 ? 'text-primary-500' : 'text-pos-error'}`}>
          {changeAmount >= 0 ? fmt(changeAmount) : `-${fmt(Math.abs(changeAmount))}`}{currency}
        </span>
      </div>
    </div>
  );
}
