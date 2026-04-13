'use client';

import { Info } from 'lucide-react';
import { AppHeader } from '../../shared/AppHeader';
import { MOCK_WALLET, MOCK_PAYMENT_METHODS, formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { PresetAmounts } from './PresetAmounts';
import { PaymentMethodList } from './PaymentMethodList';

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000];
const SELECTED_AMOUNT = 200_000;

export default function TopUpScreen() {
  const { t } = useVmealT();

  return (
    <div className="flex h-full min-h-[700px] flex-col bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title={t('topUp.title')} onBack={() => {}} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-[100px] space-y-4">
        {/* Current balance card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-[13px] text-gray-400">{t('topUp.personalBalance')}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatVnd(MOCK_WALLET.personalTopUpVnd)}
          </p>
          <div className="mt-2 flex items-start gap-1.5">
            <Info size={14} className="mt-0.5 flex-shrink-0 text-gray-300" />
            <p className="text-xs text-gray-400">
              {t('topUp.personalInfo')}
            </p>
          </div>
        </div>

        {/* Preset amounts */}
        <PresetAmounts amounts={PRESET_AMOUNTS} selected={SELECTED_AMOUNT} />

        {/* Payment methods */}
        <PaymentMethodList methods={MOCK_PAYMENT_METHODS} selectedId="pm-001" />
      </div>

      {/* Sticky bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pb-6 pt-4">
        <button className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
          {t('topUp.topUpBtn', { amount: formatVnd(SELECTED_AMOUNT) })}
        </button>
      </div>
    </div>
  );
}
