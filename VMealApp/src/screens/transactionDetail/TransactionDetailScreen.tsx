import { View, Text, ScrollView, Pressable } from 'react-native';
import { Download, Share2 } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { PrimaryButton, useModal } from '@shared/ui';
import { colors, typography, spacing } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { useTransactionDetailData } from './useTransactionDetailData';
import { ReceiptCard } from './ReceiptCard';

export default function TransactionDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RootStackParamList, 'TransactionDetailScreen'>>();
  const transactionId = route.params?.transactionId ?? 'txn-001';
  const { transaction } = useTransactionDetailData(transactionId);
  const modal = useModal();

  const handleSaveImage = () => {
    modal.show({
      title: t('common.comingSoon'),
      message: t('transaction.detail.saveImageComingSoon'),
      confirmText: 'OK',
    });
  };

  const handleShare = () => {
    modal.show({
      title: t('common.comingSoon'),
      message: t('transaction.detail.shareComingSoon'),
      confirmText: 'OK',
    });
  };

  const handleReportIssue = () => {
    modal.show({
      title: t('transaction.detail.reportIssue'),
      message: t('transaction.detail.reportIssueConfirm'),
      confirmText: t('transaction.detail.reportIssue'),
      cancelText: t('common.cancel'),
      variant: 'danger',
      onConfirm: () => {
        // TODO: call report issue mutation
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('transaction.detail.title')} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ gap: spacing.cardPadding }}>
          {/* Receipt card */}
          {transaction && (
            <ReceiptCard
              transaction={transaction}
              merchantAddress=""
            />
          )}

          {/* Action buttons */}
          <View className="flex-row" style={{ gap: spacing.elementGap }}>
            <PrimaryButton
              title={t('transaction.detail.saveImage')}
              variant="outline"
              onPress={handleSaveImage}
              icon={<Download size={16} color={colors.textSecondary} />}
              className="flex-1"
            />
            <PrimaryButton
              title={t('common.share')}
              variant="outline"
              onPress={handleShare}
              icon={<Share2 size={16} color={colors.textSecondary} />}
              className="flex-1"
            />
          </View>

          {/* Report issue */}
          <Pressable onPress={handleReportIssue} className="w-full items-center active:opacity-70">
            <Text style={{ ...typography.body, fontWeight: '500', color: colors.danger }}>
              {t('transaction.detail.reportIssue')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
