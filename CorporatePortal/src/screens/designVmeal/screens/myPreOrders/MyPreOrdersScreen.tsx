'use client';

import { Check } from 'lucide-react';
import { AppHeader } from '../../shared/AppHeader';
import { useVmealT } from '../../i18n/useVmealT';
import { PreOrderCard } from './PreOrderCard';
import type { PreOrderData } from './PreOrderCard';

const MOCK_PRE_ORDERS: PreOrderData[] = [
  {
    id: 'po-001',
    merchantName: 'Canteen TechCorp',
    merchantInitial: 'C',
    merchantColor: '#3B82F6',
    items: 'Bún bò Huế đặc biệt + Chả giò',
    amount: 60_000,
    dateLabel: 'Ngày mai, 13/04 · 12:00',
    status: 'CONFIRMED',
  },
  {
    id: 'po-002',
    merchantName: 'Phở 24 - Nguyễn Huệ',
    merchantInitial: 'P',
    merchantColor: '#F59E0B',
    items: 'Phở Đặc Biệt + Nước Chanh Muối',
    amount: 110_000,
    dateLabel: '14/04 · 12:00',
    status: 'PENDING',
  },
  {
    id: 'po-003',
    merchantName: 'Canteen TechCorp',
    merchantInitial: 'C',
    merchantColor: '#3B82F6',
    items: 'Cơm sườn nướng',
    amount: 40_000,
    dateLabel: '10/04 · 12:00',
    status: 'COMPLETED',
    muted: true,
  },
];

export default function MyPreOrdersScreen() {
  const { t } = useVmealT();

  const TABS = [
    { label: t('myPreOrders.upcoming'), active: true },
    { label: t('myPreOrders.completed'), active: false },
    { label: t('myPreOrders.cancelled'), active: false },
  ];

  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-full">
      <AppHeader title={t('myPreOrders.title')} onBack={() => {}} />

      <div className="flex-1 px-5 pt-4 pb-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                tab.active
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {tab.active && <Check size={14} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pre-order cards */}
        {MOCK_PRE_ORDERS.map((order) => (
          <PreOrderCard key={order.id} order={order} />
        ))}

        {/* Empty state (hidden, for reference only) */}
        {/*
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar size={32} className="text-gray-300" />
          </div>
          <p className="text-[15px] font-semibold text-gray-900 mt-4">Chưa có đơn đặt trước</p>
          <p className="text-sm text-gray-400 mt-1">Đặt trước bữa ăn để không phải chờ đợi</p>
          <button className="mt-4 bg-[#3B82F6] text-white rounded-xl h-[44px] px-8 text-[15px] font-semibold">
            Đặt ngay
          </button>
        </div>
        */}
      </div>
    </div>
  );
}
