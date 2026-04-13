'use client';

import { MOCK_EMPLOYEE } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

/** Mask phone: +84795050727 -> +84 795 *** 727 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // +84 795 *** 727
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} *** ${digits.slice(-3)}`;
}

const OTP_FILLED = ['4', '2', '8', '', '', ''];

export function PhoneVerifyStep() {
  const { t } = useVmealT();

  return (
    <div className="flex flex-col px-5 pt-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#3B82F6]">{t('auth.step', { current: 1, total: 4 })}</span>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-gray-200">
        <div className="h-1 w-1/4 rounded-full bg-[#3B82F6]" />
      </div>

      {/* Title */}
      <h2 className="mt-6 text-xl font-bold text-gray-900">
        {t('auth.phoneVerify.title')}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Mã xác thực đã được gửi đến số điện thoại của bạn
      </p>

      {/* Phone display */}
      <div className="mt-6 flex items-center justify-center rounded-xl bg-gray-50 py-4">
        <span className="text-lg font-semibold tracking-wider text-gray-900">
          {maskPhone(MOCK_EMPLOYEE.phone)}
        </span>
      </div>

      {/* OTP boxes */}
      <div className="mt-8 flex items-center justify-center gap-3">
        {OTP_FILLED.map((digit, i) => (
          <div
            key={i}
            className={`flex h-[56px] w-[46px] items-center justify-center rounded-xl border-2 text-xl font-bold ${
              digit
                ? 'border-[#3B82F6] bg-blue-50 text-gray-900'
                : 'border-gray-200 bg-white text-gray-300'
            }`}
          >
            {digit || '\u2022'}
          </div>
        ))}
      </div>

      {/* Timer */}
      <p className="mt-6 text-center text-sm text-gray-400">
        {t('auth.phoneVerify.resendAfter')}{' '}
        <span className="font-semibold text-[#3B82F6]">02:45</span>
      </p>

      {/* Confirm button — disabled since OTP incomplete */}
      <button
        disabled
        className="mt-8 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]/40 text-[15px] font-semibold text-white"
      >
        {t('common.confirm')}
      </button>
    </div>
  );
}
