'use client';

import { Check, Clock, Plus } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

interface Participant {
  initials: string;
  name: string;
  amountVnd: number;
  status: 'PAID' | 'PENDING';
  isSelf: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const { t } = useVmealT();

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-gray-900">
          {t('groupPay.members')} ({participants.length})
        </p>
        <button className="flex items-center gap-1 text-[13px] font-medium text-[#3B82F6]">
          <Plus size={14} />
          {t('groupPay.add')}
        </button>
      </div>

      {/* Participant cards */}
      <div className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            {/* Avatar */}
            <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10">
              <span className="text-[14px] font-semibold text-[#3B82F6]">{p.initials}</span>
            </div>

            {/* Name + amount */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-gray-900 truncate">
                {p.name}
                {p.isSelf && (
                  <span className="ml-1 text-[12px] text-gray-400">({t('groupPay.you')})</span>
                )}
              </p>
              <p className="text-[13px] text-gray-600">{formatVnd(p.amountVnd)}</p>
            </div>

            {/* Status */}
            {p.status === 'PAID' ? (
              <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#10B981]/10">
                <Check size={16} className="text-[#10B981]" />
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full bg-[#F59E0B]/10 px-2.5 py-1">
                <Clock size={12} className="text-[#F59E0B]" />
                <span className="text-[11px] font-medium text-[#F59E0B]">{t('groupPay.waiting')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
