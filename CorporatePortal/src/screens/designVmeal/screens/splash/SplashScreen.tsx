'use client';

import { UtensilsCrossed } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';

export default function SplashScreen() {
  const { t } = useVmealT();
  return (
    <div className="flex h-full min-h-[700px] flex-col items-center justify-between bg-gradient-to-br from-[#3B82F6] to-[#6366F1] py-16">
      {/* Top spacer */}
      <div />

      {/* Center logo + text */}
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="relative flex h-[100px] w-[100px] items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-white/10" />
          {/* Inner icon area */}
          <div className="relative flex items-center justify-center">
            <span className="text-[52px] font-extrabold leading-none text-white tracking-tight">
              V
            </span>
            <UtensilsCrossed
              size={22}
              className="absolute -right-2 -top-1 text-white/80"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold text-white tracking-tight">VMeal</h1>

        {/* Subtitle */}
        <p className="text-sm text-white/70">{t('splash.tagline')}</p>
      </div>

      {/* Bottom loading section */}
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />

        {/* Loading text */}
        <p className="text-xs text-white/50">{t('splash.loading')}</p>
      </div>
    </div>
  );
}
