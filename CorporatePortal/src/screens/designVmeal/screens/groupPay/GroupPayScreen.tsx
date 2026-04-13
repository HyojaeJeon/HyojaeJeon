'use client';

import { MapPin, Clock, Check } from 'lucide-react';
import { AppHeader } from '../../shared/AppHeader';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { ParticipantList } from './ParticipantList';

const TOTAL_AMOUNT = 350_000;
const PER_PERSON = Math.ceil(TOTAL_AMOUNT / 3);
const LAST_PERSON = TOTAL_AMOUNT - PER_PERSON * 2;

const PARTICIPANTS = [
  { initials: 'NT', name: 'Nguyễn Minh Tuấn', amountVnd: PER_PERSON, status: 'PAID' as const, isSelf: true },
  { initials: 'TM', name: 'Trần Thị Mai', amountVnd: PER_PERSON, status: 'PENDING' as const, isSelf: false },
  { initials: 'LH', name: 'Lê Văn Hùng', amountVnd: LAST_PERSON, status: 'PENDING' as const, isSelf: false },
];

export default function GroupPayScreen() {
  const { t } = useVmealT();

  return (
    <div className="flex h-full min-h-[700px] flex-col bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title={t('groupPay.title')} onBack={() => {}} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-[160px] space-y-4">
        {/* Restaurant selection card */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-[#3B82F6]/10">
            <MapPin size={20} className="text-[#3B82F6]" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-gray-900">Phở 24 - Nguyễn Huệ</p>
            <div className="mt-0.5 flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              <span className="text-[12px] text-gray-400">{t('groupPay.todayAt')} 12:00</span>
            </div>
          </div>
        </div>

        {/* Total amount */}
        <div className="flex flex-col items-center py-4">
          <p className="text-[13px] text-gray-400">{t('groupPay.totalBill')}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatVnd(TOTAL_AMOUNT)}</p>
          <div className="mt-1 h-[2px] w-[120px] rounded-full bg-[#3B82F6]/30" />
        </div>

        {/* Split method */}
        <div className="space-y-3">
          <p className="text-[15px] font-semibold text-gray-900">{t('groupPay.splitMethod')}</p>
          <div className="space-y-2">
            {/* Option 1: Equal split - selected */}
            <button className="flex w-full items-center gap-3 rounded-xl border-2 border-[#3B82F6] bg-[#3B82F6]/5 p-4 text-left">
              <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-[#3B82F6]">
                <div className="h-[10px] w-[10px] rounded-full bg-[#3B82F6]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-medium text-gray-900">{t('groupPay.equalSplit')}</p>
                  <Check size={14} className="text-[#3B82F6]" />
                </div>
                <p className="text-[12px] text-gray-400">{t('groupPay.equalDesc')}</p>
              </div>
            </button>

            {/* Option 2: Custom */}
            <button className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left">
              <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-gray-300">
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-gray-900">{t('groupPay.custom')}</p>
                <p className="text-[12px] text-gray-400">{t('groupPay.customDesc')}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Participant list */}
        <ParticipantList participants={PARTICIPANTS} />
      </div>

      {/* Sticky bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pb-6 pt-4 space-y-2">
        <p className="text-center text-[13px] text-gray-400">
          {t('groupPay.yourShare')}: {formatVnd(PER_PERSON)}
        </p>
        <button className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
          {t('groupPay.startPayment')}
        </button>
        <button className="flex h-[40px] w-full items-center justify-center text-[14px] font-medium text-gray-400">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
