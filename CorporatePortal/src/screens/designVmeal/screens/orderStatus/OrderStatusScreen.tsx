'use client';

import { CheckCircle, Clock, MapPin, Share2, Home } from 'lucide-react';
import { MOCK_ORDERS, formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { StatusTimeline } from './StatusTimeline';

const order = MOCK_ORDERS[0];

export default function OrderStatusScreen() {
  const { t } = useVmealT();

  const TIMELINE_STEPS = [
    { label: t('orderStatus.paid'), time: '11:45', status: 'COMPLETED' as const },
    { label: t('orderStatus.accepted'), time: '11:46', status: 'COMPLETED' as const },
    { label: t('orderStatus.preparing'), time: 'Bây giờ', status: 'ACTIVE' as const },
    { label: t('orderStatus.ready'), time: null, status: 'PENDING' as const },
    { label: t('orderStatus.completed'), time: null, status: 'PENDING' as const },
  ];
  return (
    <div className="flex h-full min-h-[700px] flex-col bg-[#F8FAFC]">
      {/* Success banner */}
      <div className="flex flex-col items-center bg-gradient-to-br from-[#10B981] to-[#059669] px-5 pb-8 pt-12">
        <CheckCircle size={56} className="text-white" strokeWidth={1.5} />
        <h1 className="mt-3 text-xl font-bold text-white">{t('orderStatus.success')}</h1>
        <p className="mt-1 text-[14px] text-white/80">{order.merchantName}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-4">
        {/* Timeline card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <StatusTimeline steps={TIMELINE_STEPS} />
        </div>

        {/* Order details card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-[14px] text-gray-900">
                  {item.quantity}x {item.nameVi}
                </span>
                <span className="text-[14px] text-gray-600">
                  {formatVnd(item.unitPriceVnd * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-gray-900">{t('common.total')}</span>
            <span className="text-[14px] font-bold text-gray-900">
              {formatVnd(order.totalAmountVnd)}
            </span>
          </div>

          {/* Company share */}
          <p className="text-[13px] text-[#3B82F6]">
            Công ty: {formatVnd(order.companyShareVnd)} (
            {Math.round((order.companyShareVnd / order.totalAmountVnd) * 100)}%)
          </p>
        </div>

        {/* Info row */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
              <MapPin size={14} className="text-gray-400" />
              <span>Bàn {order.tableNo}</span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
              <Clock size={14} className="text-gray-400" />
              <span>Hẹn 12:00</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">{t('orderStatus.orderCode')} #{order.id}</p>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <button className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
            <Home size={18} />
            {t('orderStatus.goHome')}
          </button>
          <button className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-[14px] font-medium text-gray-700">
            <Share2 size={16} />
            {t('orderStatus.shareReceipt')}
          </button>
        </div>
      </div>
    </div>
  );
}
