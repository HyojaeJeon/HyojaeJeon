'use client';

import { UtensilsCrossed, Coffee, Salad, QrCode } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';

export default function OnboardingScreen() {
  const { t } = useVmealT();
  return (
    <div className="flex h-full min-h-[700px] flex-col bg-[#F8FAFC] px-5 pt-2">
      {/* Top section: Logo + heading */}
      <div className="flex flex-col items-center pt-8">
        {/* Small logo */}
        <div className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#6366F1]">
          <span className="text-[28px] font-extrabold leading-none text-white">V</span>
        </div>

        <h1 className="mt-4 text-[22px] font-bold text-gray-900">
          {t('onboarding.welcome')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('splash.tagline')}
        </p>
      </div>

      {/* Illustration area */}
      <div className="mx-auto mt-8 flex h-[180px] w-full max-w-[280px] items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <UtensilsCrossed size={28} className="text-orange-500" />
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <Coffee size={28} className="text-amber-600" />
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <Salad size={28} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Company code input */}
      <div className="mt-8 space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {t('onboarding.enterCode')}
        </label>
        <div className="flex h-[52px] items-center rounded-xl border border-gray-200 bg-white px-4">
          <span className="text-[15px] text-gray-400">{t('onboarding.codePlaceholder')}</span>
        </div>
        <p className="text-xs text-gray-400">
          {t('onboarding.codeHelper')}
        </p>
      </div>

      {/* QR code link */}
      <button className="mx-auto mt-4 flex items-center gap-2 text-sm font-medium text-[#3B82F6]">
        <QrCode size={16} />
        <span>{t('onboarding.orScanQR')}</span>
      </button>

      {/* Spacer to push button down */}
      <div className="flex-1" />

      {/* CTA button */}
      <button className="mb-4 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
        {t('common.continue')}
      </button>

      {/* Footer version */}
      <p className="mb-6 text-center text-[11px] text-gray-300">
        {t('onboarding.version')} 1.0.0
      </p>
    </div>
  );
}
