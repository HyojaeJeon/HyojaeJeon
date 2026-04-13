'use client';

import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

interface PaymentSummaryProps {
  totalVnd: number;
  companyShareVnd: number;
  employeeShareVnd: number;
  gpsVerified: boolean;
}

export function PaymentSummary({
  totalVnd,
  companyShareVnd,
  employeeShareVnd,
  gpsVerified,
}: PaymentSummaryProps) {
  const { t } = useVmealT();
  const companyPercent = totalVnd > 0 ? Math.round((companyShareVnd / totalVnd) * 100) : 0;

  return (
    <div className="rounded-t-3xl border-t border-gray-100 bg-white px-5 pb-6 pt-4 shadow-lg">
      <p className="text-[15px] font-semibold text-gray-900">{t('order.paymentDetails')}</p>

      <div className="mt-3 space-y-2">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-gray-600">{t('common.total')}</span>
          <span className="text-[14px] font-semibold text-gray-900">{formatVnd(totalVnd)}</span>
        </div>

        {/* Company share */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-gray-600">{t('order.companyPay')}</span>
          <span className="text-[14px] font-medium text-[#3B82F6]">
            {formatVnd(companyShareVnd)}{' '}
            <span className="text-[12px]">({companyPercent}%)</span>
          </span>
        </div>

        {/* Employee share */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-gray-600">{t('order.personalPay')}</span>
          <span className="text-[14px] text-gray-400">{formatVnd(employeeShareVnd)}</span>
        </div>
      </div>

      {/* GPS status */}
      {gpsVerified && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#10B981]" />
          <span className="text-[12px] text-[#10B981]">{t('order.gpsVerified')}</span>
        </div>
      )}

      {/* CTA */}
      <button className="mt-4 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
        {t('order.orderBtn')} · {formatVnd(totalVnd)}
      </button>
    </div>
  );
}
