import { View, Text, ScrollView, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const TABS = [
    { label: t('myPreOrders.upcoming'), active: true },
    { label: t('myPreOrders.completed'), active: false },
    { label: t('myPreOrders.cancelled'), active: false },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <AppHeader title={t('myPreOrders.title')} />

      <ScrollView className="flex-1 px-5 pt-4 pb-6">
        <View className="gap-4">
          {/* Filter tabs */}
          <View className="flex-row gap-2">
            {TABS.map((tab) => (
              <Pressable
                key={tab.label}
                className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                  tab.active
                    ? 'bg-[#3B82F6]'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {tab.active && <Check size={14} color="#FFFFFF" />}
                <Text
                  className={`text-[13px] font-medium ${
                    tab.active ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Pre-order cards */}
          {MOCK_PRE_ORDERS.map((order) => (
            <PreOrderCard key={order.id} order={order} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
