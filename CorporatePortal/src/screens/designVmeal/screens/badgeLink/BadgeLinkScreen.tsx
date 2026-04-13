'use client';

import { CheckCircle, Eye, Info } from 'lucide-react';
import { AppHeader } from '../../shared/AppHeader';
import { useVmealT } from '../../i18n/useVmealT';

export default function BadgeLinkScreen() {
  const { t } = useVmealT();

  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-full">
      <AppHeader title={t('badge.title')} onBack={() => {}} />

      <div className="flex-1 px-5 pt-4 pb-6 space-y-4">
        {/* Status card */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 p-5">
          <CheckCircle size={28} className="shrink-0 text-[#10B981]" />
          <div>
            <p className="font-semibold text-[#10B981]">{t('badge.linked')}</p>
            <p className="text-sm text-[#10B981]/80 mt-0.5">{t('badge.active')}</p>
          </div>
        </div>

        {/* Badge info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Row: Badge ID */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-400">{t('badge.badgeId')}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">RFID-****7890</span>
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50">
                <Eye size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="border-t border-gray-100 mx-5" />

          {/* Row: Status */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-400">{t('badge.status')}</span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              {t('badge.statusActive')}
            </span>
          </div>
          <div className="border-t border-gray-100 mx-5" />

          {/* Row: Linked date */}
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-gray-400">{t('badge.linkedDate')}</span>
            <span className="text-sm font-medium text-gray-900">15/01/2026</span>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <p className="text-[15px] font-semibold text-gray-900">{t('badge.howToUse')}</p>
          <div className="space-y-3">
            {[
              t('badge.step1'),
              t('badge.step2'),
              t('badge.step3'),
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-xs font-bold text-white">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600 pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info banner */}
        <div className="flex gap-3 rounded-xl border border-[#3B82F6]/10 bg-[#3B82F6]/5 p-4">
          <Info size={18} className="shrink-0 text-[#3B82F6] mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            {t('badge.adminInfo')}
          </p>
        </div>

        {/* Bottom action */}
        <div className="space-y-2 pt-2">
          <button className="flex w-full items-center justify-center rounded-xl bg-[#EF4444] h-[52px] text-[15px] font-semibold text-white">
            {t('badge.reportLost')}
          </button>
          <p className="text-xs text-gray-400 text-center">{t('badge.lostWarning')}</p>
        </div>
      </div>
    </div>
  );
}
