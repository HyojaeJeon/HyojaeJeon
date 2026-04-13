import { View, Text, Pressable } from 'react-native';
import { Eye } from 'lucide-react-native';
import { MOCK_WALLET, formatVnd } from '@shared/mock/mockData';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

export function BalanceCard() {
  const { t } = useTranslation();
  const {
    balanceVnd,
    companyAllowanceVnd,
    personalTopUpVnd,
    dailySpentVnd,
    dailyLimitVnd,
  } = MOCK_WALLET;

  const spentRatio = Math.min(dailySpentVnd / dailyLimitVnd, 1);

  return (
    <LinearGradient
      colors={['#3B82F6', '#6366F1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-6"
    >
      {/* Top row: label + eye */}
      <View className="flex flex-row items-center justify-between">
        <Text className="text-sm text-white/70">{t('wallet.balance')}</Text>
        <Pressable className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Eye size={16} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      {/* Main balance */}
      <Text className="mt-2 text-3xl font-bold text-white">
        {formatVnd(balanceVnd)}
      </Text>

      {/* Sub rows */}
      <View className="mt-3 gap-1">
        <View className="flex flex-row items-center gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-white/60" />
          <Text className="text-xs text-white/80">
            {t('wallet.companyFund')}: {formatVnd(companyAllowanceVnd)}
          </Text>
        </View>
        <View className="flex flex-row items-center gap-2">
          <View className="h-1.5 w-1.5 rounded-full bg-white/60" />
          <Text className="text-xs text-white/80">
            {t('wallet.personalFund')}: {formatVnd(personalTopUpVnd)}
          </Text>
        </View>
      </View>

      {/* Daily progress */}
      <View className="mt-4">
        <Text className="text-xs text-white/60">
          {t('wallet.todaySpent')}: {formatVnd(dailySpentVnd)}/{formatVnd(dailyLimitVnd)}
        </Text>
        <View className="mt-1.5 h-1 w-full rounded-full bg-white/20">
          <View
            className="h-1 rounded-full bg-white"
            style={{ width: `${spentRatio * 100}%` }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}
