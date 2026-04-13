import { View, Text, ScrollView, Pressable } from 'react-native';
import { CheckCircle, Eye, Info } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { useTranslation } from 'react-i18next';

export default function BadgeLinkScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <AppHeader title={t('badge.title')} />

      <ScrollView className="flex-1 px-5 pt-4 pb-6">
        <View className="gap-4">
          {/* Status card */}
          <View className="flex-row items-center gap-3 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 p-5">
            <CheckCircle size={28} color="#10B981" />
            <View>
              <Text className="font-semibold text-[#10B981]">{t('badge.linked')}</Text>
              <Text className="text-sm text-[#10B981]/80 mt-0.5">{t('badge.active')}</Text>
            </View>
          </View>

          {/* Badge info card */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Row: Badge ID */}
            <View className="flex-row items-center justify-between px-5 py-3.5">
              <Text className="text-sm text-gray-400">{t('badge.badgeId')}</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-medium text-gray-900">RFID-****7890</Text>
                <Pressable className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50">
                  <Eye size={14} color="#9CA3AF" />
                </Pressable>
              </View>
            </View>
            <View className="border-t border-gray-100 mx-5" />

            {/* Row: Status */}
            <View className="flex-row items-center justify-between px-5 py-3.5">
              <Text className="text-sm text-gray-400">{t('badge.status')}</Text>
              <View className="flex-row items-center gap-1.5">
                <View className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <Text className="text-sm font-medium text-[#10B981]">
                  {t('badge.statusActive')}
                </Text>
              </View>
            </View>
            <View className="border-t border-gray-100 mx-5" />

            {/* Row: Linked date */}
            <View className="flex-row items-center justify-between px-5 py-3.5">
              <Text className="text-sm text-gray-400">{t('badge.linkedDate')}</Text>
              <Text className="text-sm font-medium text-gray-900">15/01/2026</Text>
            </View>
          </View>

          {/* How it works */}
          <View className="gap-3">
            <Text className="text-[15px] font-semibold text-gray-900">{t('badge.howToUse')}</Text>
            <View className="gap-3">
              {[
                t('badge.step1'),
                t('badge.step2'),
                t('badge.step3'),
              ].map((text, i) => (
                <View key={i} className="flex-row items-start gap-3">
                  <View className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]">
                    <Text className="text-xs font-bold text-white">{i + 1}</Text>
                  </View>
                  <Text className="text-sm text-gray-600 pt-1 flex-1">{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Info banner */}
          <View className="flex-row gap-3 rounded-xl border border-[#3B82F6]/10 bg-[#3B82F6]/5 p-4">
            <Info size={18} color="#3B82F6" />
            <Text className="text-xs text-gray-600 leading-relaxed flex-1">
              {t('badge.adminInfo')}
            </Text>
          </View>

          {/* Bottom action */}
          <View className="gap-2 pt-2">
            <Pressable className="flex w-full items-center justify-center rounded-xl bg-[#EF4444] h-[52px]">
              <Text className="text-[15px] font-semibold text-white">
                {t('badge.reportLost')}
              </Text>
            </Pressable>
            <Text className="text-xs text-gray-400 text-center">{t('badge.lostWarning')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
