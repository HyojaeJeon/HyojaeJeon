import { View, Text, ScrollView, Pressable } from 'react-native';
import { MapPin, Clock, Check } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { ParticipantList } from './ParticipantList';

const TOTAL_AMOUNT = 350_000;
const PER_PERSON = Math.ceil(TOTAL_AMOUNT / 3);
const LAST_PERSON = TOTAL_AMOUNT - PER_PERSON * 2;

const PARTICIPANTS = [
  { initials: 'NT', name: 'Nguyen Minh Tuan', amountVnd: PER_PERSON, status: 'PAID' as const, isSelf: true },
  { initials: 'TM', name: 'Tran Thi Mai', amountVnd: PER_PERSON, status: 'PENDING' as const, isSelf: false },
  { initials: 'LH', name: 'Le Van Hung', amountVnd: LAST_PERSON, status: 'PENDING' as const, isSelf: false },
];

export default function GroupPayScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <AppHeader title={t('groupPay.title')} onBack={() => {}} />

      {/* Scrollable content */}
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-2 pb-[160px] gap-4">
        {/* Restaurant selection card */}
        <View className="flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <View className="flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-[#3B82F6]/10">
            <MapPin size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-medium text-gray-900">Pho 24 - Nguyen Hue</Text>
            <View className="mt-0.5 flex-row items-center gap-1">
              <Clock size={12} color="#9CA3AF" />
              <Text className="text-[12px] text-gray-400">{t('groupPay.todayAt')} 12:00</Text>
            </View>
          </View>
        </View>

        {/* Total amount */}
        <View className="items-center py-4">
          <Text className="text-[13px] text-gray-400">{t('groupPay.totalBill')}</Text>
          <Text className="mt-2 text-3xl font-bold text-gray-900">{formatVnd(TOTAL_AMOUNT)}</Text>
          <View className="mt-1 h-[2px] w-[120px] rounded-full bg-[#3B82F6]/30" />
        </View>

        {/* Split method */}
        <View className="gap-3">
          <Text className="text-[15px] font-semibold text-gray-900">{t('groupPay.splitMethod')}</Text>
          <View className="gap-2">
            {/* Option 1: Equal split - selected */}
            <Pressable className="flex-row w-full items-center gap-3 rounded-xl border-2 border-[#3B82F6] bg-[#3B82F6]/5 p-4">
              <View className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-[#3B82F6]">
                <View className="h-[10px] w-[10px] rounded-full bg-[#3B82F6]" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[14px] font-medium text-gray-900">{t('groupPay.equalSplit')}</Text>
                  <Check size={14} color="#3B82F6" />
                </View>
                <Text className="text-[12px] text-gray-400">{t('groupPay.equalDesc')}</Text>
              </View>
            </Pressable>

            {/* Option 2: Custom */}
            <Pressable className="flex-row w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <View className="flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-gray-300" />
              <View className="flex-1">
                <Text className="text-[14px] font-medium text-gray-900">{t('groupPay.custom')}</Text>
                <Text className="text-[12px] text-gray-400">{t('groupPay.customDesc')}</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Participant list */}
        <ParticipantList participants={PARTICIPANTS} />
      </ScrollView>

      {/* Sticky bottom */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pb-6 pt-4 gap-2">
        <Text className="text-center text-[13px] text-gray-400">
          {t('groupPay.yourShare')}: {formatVnd(PER_PERSON)}
        </Text>
        <Pressable className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]">
          <Text className="text-[15px] font-semibold text-white">
            {t('groupPay.startPayment')}
          </Text>
        </Pressable>
        <Pressable className="flex h-[40px] w-full items-center justify-center">
          <Text className="text-[14px] font-medium text-gray-400">
            {t('common.cancel')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
