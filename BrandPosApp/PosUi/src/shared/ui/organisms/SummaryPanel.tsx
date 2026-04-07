'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

interface SummaryPanelProps {
  subtotal: number;
  discount?: number;
  tax?: number;
  serviceCharge?: number;
  total: number;
  currency?: string;
}

/**
 * SummaryPanel -- 주문 합계 요약 패널
 *
 * 소계, 할인, 세금, 봉사료, 구분선, 총합계를 수직으로 나열한다.
 * 총합계는 bold, text-xl, primary-500으로 강조한다.
 */
export default function SummaryPanel({
  subtotal,
  discount = 0,
  tax = 0,
  serviceCharge = 0,
  total,
  currency = '₫',
}: SummaryPanelProps) {
  const { t } = usePosI18n();
  const fmt = (v: number) => v.toLocaleString('ko-KR');

  return (
    <div className="flex flex-col gap-2 p-4 bg-pos-bg rounded-pos-card">
      {/* 소계 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-pos-text-secondary">{t('common.subtotal')}</span>
        <span className="text-sm font-semibold text-pos-text tabular-nums">
          {fmt(subtotal)}{currency}
        </span>
      </div>

      {/* 할인 */}
      {discount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-pos-text-secondary">{t('common.discount')}</span>
          <span className="text-sm font-semibold text-pos-error tabular-nums">
            -{fmt(discount)}{currency}
          </span>
        </div>
      )}

      {/* 세금 */}
      {tax > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-pos-text-secondary">{t('common.tax')}</span>
          <span className="text-sm font-semibold text-pos-text tabular-nums">
            {fmt(tax)}{currency}
          </span>
        </div>
      )}

      {/* 봉사료 */}
      {serviceCharge > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-pos-text-secondary">{t('payment.serviceCharge')}</span>
          <span className="text-sm font-semibold text-pos-text tabular-nums">
            {fmt(serviceCharge)}{currency}
          </span>
        </div>
      )}

      {/* 구분선 */}
      <div className="border-t border-pos-border my-1" />

      {/* 총합계 */}
      <div className="flex justify-between items-center">
        <span className="text-md font-bold text-pos-text">{t('common.total')}</span>
        <span className="text-xl font-bold text-primary-500 tabular-nums">
          {fmt(total)}{currency}
        </span>
      </div>
    </div>
  );
}
