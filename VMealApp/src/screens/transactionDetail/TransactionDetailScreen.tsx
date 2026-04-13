import { View, Text, ScrollView, Pressable } from 'react-native';
import { Download, Share2 } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { MOCK_TRANSACTIONS } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { ReceiptCard } from './ReceiptCard';

export default function TransactionDetailScreen() {
  const { t } = useTranslation();
  const transaction = MOCK_TRANSACTIONS[0]; // Pho 24 payment

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <AppHeader title={t('transaction.detail.title')} />

      <ScrollView className="flex-1 px-5 pt-4 pb-6">
        <View className="gap-5">
          {/* Receipt card */}
          <ReceiptCard
            transaction={transaction}
            merchantAddress="123 Nguyễn Huệ, Q.1, TP.HCM"
          />

          {/* Action buttons */}
          <View className="flex-row gap-3">
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 h-[44px] rounded-xl border border-gray-200 bg-white">
              <Download size={16} color="#6B7280" />
              <Text className="text-sm font-medium text-gray-700">
                {t('transaction.detail.saveImage')}
              </Text>
            </Pressable>
            <Pressable className="flex-1 flex-row items-center justify-center gap-2 h-[44px] rounded-xl border border-gray-200 bg-white">
              <Share2 size={16} color="#6B7280" />
              <Text className="text-sm font-medium text-gray-700">
                {t('common.share')}
              </Text>
            </Pressable>
          </View>

          {/* Report issue */}
          <Pressable className="w-full items-center">
            <Text className="text-sm text-[#EF4444] font-medium">
              {t('transaction.detail.reportIssue')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
