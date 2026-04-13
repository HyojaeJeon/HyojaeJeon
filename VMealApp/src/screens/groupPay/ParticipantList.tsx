import { View, Text, Pressable } from 'react-native';
import { Check, Clock, Plus } from 'lucide-react-native';
import { formatVnd } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[15px] font-semibold text-gray-900">
          {t('groupPay.members')} ({participants.length})
        </Text>
        <Pressable className="flex-row items-center gap-1">
          <Plus size={14} color="#3B82F6" />
          <Text className="text-[13px] font-medium text-[#3B82F6]">
            {t('groupPay.add')}
          </Text>
        </Pressable>
      </View>

      {/* Participant cards */}
      <View className="gap-2">
        {participants.map((p) => (
          <View
            key={p.name}
            className="flex-row items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            {/* Avatar */}
            <View className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#3B82F6]/10">
              <Text className="text-[14px] font-semibold text-[#3B82F6]">{p.initials}</Text>
            </View>

            {/* Name + amount */}
            <View className="flex-1 min-w-0">
              <Text className="text-[14px] font-medium text-gray-900" numberOfLines={1}>
                {p.name}
                {p.isSelf && (
                  <Text className="text-[12px] text-gray-400"> ({t('groupPay.you')})</Text>
                )}
              </Text>
              <Text className="text-[13px] text-gray-600">{formatVnd(p.amountVnd)}</Text>
            </View>

            {/* Status */}
            {p.status === 'PAID' ? (
              <View className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#10B981]/10">
                <Check size={16} color="#10B981" />
              </View>
            ) : (
              <View className="flex-row items-center gap-1 rounded-full bg-[#F59E0B]/10 px-2.5 py-1">
                <Clock size={12} color="#F59E0B" />
                <Text className="text-[11px] font-medium text-[#F59E0B]">{t('groupPay.waiting')}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
