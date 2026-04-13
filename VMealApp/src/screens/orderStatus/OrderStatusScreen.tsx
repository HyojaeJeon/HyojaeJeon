import { View, Text, ScrollView, Pressable } from 'react-native';
import { CheckCircle, Clock, MapPin, Share2, Home } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MOCK_ORDERS, formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { StatusTimeline } from './StatusTimeline';

const order = MOCK_ORDERS[0];

export default function OrderStatusScreen() {
  const { t } = useTranslation();

  const TIMELINE_STEPS = [
    { label: t('orderStatus.paid'), time: '11:45', status: 'COMPLETED' as const },
    { label: t('orderStatus.accepted'), time: '11:46', status: 'COMPLETED' as const },
    { label: t('orderStatus.preparing'), time: 'Bây giờ', status: 'ACTIVE' as const },
    { label: t('orderStatus.ready'), time: null, status: 'PENDING' as const },
    { label: t('orderStatus.completed'), time: null, status: 'PENDING' as const },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Success banner */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="items-center px-5 pb-8 pt-12"
      >
        <CheckCircle size={56} color="#FFFFFF" strokeWidth={1.5} />
        <Text className="mt-3 text-xl font-bold text-white">{t('orderStatus.success')}</Text>
        <Text className="mt-1 text-[14px] text-white/80">{order.merchantName}</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-6 gap-4">
        {/* Timeline card */}
        <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <StatusTimeline steps={TIMELINE_STEPS} />
        </View>

        {/* Order details card */}
        <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm gap-3">
          {/* Items */}
          <View className="gap-2">
            {order.items.map((item) => (
              <View key={item.id} className="flex-row items-center justify-between">
                <Text className="text-[14px] text-gray-900">
                  {item.quantity}x {item.nameVi}
                </Text>
                <Text className="text-[14px] text-gray-600">
                  {formatVnd(item.unitPriceVnd * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View className="border-t border-gray-100" />

          {/* Total */}
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] font-semibold text-gray-900">{t('common.total')}</Text>
            <Text className="text-[14px] font-bold text-gray-900">
              {formatVnd(order.totalAmountVnd)}
            </Text>
          </View>

          {/* Company share */}
          <Text className="text-[13px] text-[#3B82F6]">
            Cong ty: {formatVnd(order.companyShareVnd)} (
            {Math.round((order.companyShareVnd / order.totalAmountVnd) * 100)}%)
          </Text>
        </View>

        {/* Info row */}
        <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm gap-2">
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <MapPin size={14} color="#9CA3AF" />
              <Text className="text-[13px] text-gray-600">Ban {order.tableNo}</Text>
            </View>
            <Text className="text-gray-300">·</Text>
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color="#9CA3AF" />
              <Text className="text-[13px] text-gray-600">Hen 12:00</Text>
            </View>
          </View>
          <Text className="text-xs text-gray-400">{t('orderStatus.orderCode')} #{order.id}</Text>
        </View>

        {/* Action buttons */}
        <View className="gap-2 pt-2">
          <Pressable className="flex-row h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6]">
            <Home size={18} color="#FFFFFF" />
            <Text className="text-[15px] font-semibold text-white">{t('orderStatus.goHome')}</Text>
          </Pressable>
          <Pressable className="flex-row h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white">
            <Share2 size={16} color="#374151" />
            <Text className="text-[14px] font-medium text-gray-700">{t('orderStatus.shareReceipt')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
