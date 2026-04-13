'use client';

import { Calendar } from 'lucide-react';
import { formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

type PreOrderStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface PreOrderData {
  id: string;
  merchantName: string;
  merchantInitial: string;
  merchantColor: string;
  items: string;
  amount: number;
  dateLabel: string;
  status: PreOrderStatus;
  muted?: boolean;
}

interface PreOrderCardProps {
  order: PreOrderData;
}

const STATUS_STYLE: Record<PreOrderStatus, { bg: string; text: string }> = {
  CONFIRMED: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  PENDING: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-500' },
  CANCELLED: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]' },
};

const STATUS_LABEL_KEY: Record<PreOrderStatus, string> = {
  CONFIRMED: 'myPreOrders.confirmed',
  PENDING: 'myPreOrders.pending',
  COMPLETED: 'myPreOrders.completed',
  CANCELLED: 'myPreOrders.cancelled',
};

export type { PreOrderData, PreOrderStatus };

export function PreOrderCard({ order }: PreOrderCardProps) {
  const { t } = useVmealT();
  const statusStyle = STATUS_STYLE[order.status];

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${order.muted ? 'opacity-70' : ''}`}>
      {/* Top row: merchant + status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: order.merchantColor }}
          >
            {order.merchantInitial}
          </div>
          <p className="text-sm font-medium text-gray-900">{order.merchantName}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {t(STATUS_LABEL_KEY[order.status])}
        </span>
      </div>

      {/* Items summary */}
      <p className="text-sm text-gray-600 mt-3">{order.items}</p>

      {/* Amount */}
      <p className="text-[16px] font-bold text-gray-900 mt-1">{formatVnd(order.amount)}</p>

      {/* Date */}
      <div className="flex items-center gap-1.5 mt-2">
        <Calendar size={14} className="text-gray-400" />
        <span className="text-xs text-gray-400">{order.dateLabel}</span>
      </div>

      {/* Cancel action (only for upcoming) */}
      {(order.status === 'CONFIRMED' || order.status === 'PENDING') && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button className="text-xs font-medium text-[#EF4444]">{t('myPreOrders.cancelOrder')}</button>
        </div>
      )}
    </div>
  );
}
