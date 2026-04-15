import { View, Text, ScrollView } from 'react-native';
import { CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { PrimaryButton, Card } from '@shared/ui';
import { colors, typography, spacing } from '@shared/ui/tokens';
import { formatVnd } from '@shared/utils/format';

type TopUpResultRoute = RouteProp<RootStackParamList, 'TopUpResultScreen'>;
type TopUpResultNav = NativeStackNavigationProp<RootStackParamList, 'TopUpResultScreen'>;

function formatTimestamp(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
}

export default function TopUpResultScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<TopUpResultNav>();
  const route = useRoute<TopUpResultRoute>();

  const { amount, success, balanceAfter } = route.params;

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleTopUpAgain = () => {
    navigation.replace('TopUpScreen');
  };

  const handleViewDetails = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.sectionGap, paddingBottom: spacing.xxl, alignItems: 'center' }}>
        {/* Status animation area */}
        <View
          className="items-center justify-center"
          style={{
            height: 120, width: 120, borderRadius: 60, marginBottom: spacing.xxl,
            backgroundColor: success ? colors.successLight : colors.dangerLight,
          }}
        >
          {success ? (
            <CheckCircle size={64} color={colors.success} />
          ) : (
            <XCircle size={64} color={colors.danger} />
          )}
        </View>

        {/* Status text */}
        <Text style={{ ...typography.sectionTitle, fontSize: 20, marginBottom: spacing.xs }}>
          {success ? t('topUpResult.successTitle') : t('topUpResult.failTitle')}
        </Text>
        <Text style={{ ...typography.body, marginBottom: spacing.xxl }}>
          {success ? t('topUpResult.successMessage') : t('topUpResult.failMessage')}
        </Text>

        {/* Amount charged */}
        <View className="items-center" style={{ marginBottom: spacing.xxl }}>
          <Text style={typography.caption}>{t('topUpResult.amountCharged')}</Text>
          <Text style={{ ...typography.displayLarge, marginTop: spacing.xs }}>
            {formatVnd(amount)}
          </Text>
        </View>

        {/* Details card */}
        <Card style={{ width: '100%', padding: spacing.cardPadding, marginBottom: spacing.xxl }}>
          <View style={{ gap: spacing.elementGap }}>
            {/* New balance */}
            <View className="flex-row items-center justify-between">
              <Text style={typography.body}>
                {t('topUpResult.newBalance')}
              </Text>
              <Text style={{ ...typography.cardTitle, color: colors.success }}>
                {formatVnd(balanceAfter)}
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: colors.divider }} />

            {/* Payment method */}
            <View className="flex-row items-center justify-between">
              <Text style={typography.body}>
                {t('topUpResult.paymentMethod')}
              </Text>
              <Text style={{ ...typography.cardTitle }}>NAPAS QR</Text>
            </View>

            <View style={{ height: 1, backgroundColor: colors.divider }} />

            {/* Timestamp */}
            <View className="flex-row items-center justify-between">
              <Text style={typography.body}>
                {t('topUpResult.timestamp')}
              </Text>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <Clock size={14} color={colors.textTertiary} />
                <Text style={{ ...typography.body, color: colors.textSecondary }}>{formatTimestamp()}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action buttons */}
        <View style={{ width: '100%', gap: spacing.elementGap }}>
          <PrimaryButton
            title={t('topUpResult.goHome')}
            onPress={handleGoHome}
            variant="primary"
            size="lg"
            className="w-full"
          />
          <PrimaryButton
            title={t('topUpResult.topUpAgain')}
            onPress={handleTopUpAgain}
            variant="outline"
            size="lg"
            className="w-full"
          />
          <PrimaryButton
            title={t('topUpResult.viewDetails')}
            onPress={handleViewDetails}
            variant="ghost"
            size="lg"
            className="w-full"
          />
        </View>
      </ScrollView>
    </View>
  );
}
