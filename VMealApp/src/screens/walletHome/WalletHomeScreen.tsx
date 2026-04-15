import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Bell } from 'lucide-react-native';
import { BalanceCard } from './BalanceCard';
import { QuickActions } from './QuickActions';
import { RecentTransactions } from './RecentTransactions';
import { NearbyMerchants } from './NearbyMerchants';
import { useWalletHomeData } from './useWalletHomeData';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { useAppSelector } from '@store/index';
import { colors, typography, spacing, shadows, radius } from '@shared/ui/tokens';

export default function WalletHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppSelector((s) => s.auth.user);
  const { wallet, transactions, merchants, loading, refetchWallet, refetchTransactions, refetchMerchants } =
    useWalletHomeData();
  const displayName = user?.displayName ?? '';
  const firstName = displayName.split(' ').pop() ?? displayName;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchWallet(), refetchTransactions(), refetchMerchants()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWallet, refetchTransactions, refetchMerchants]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('NotificationListScreen');
  }, [navigation]);

  if (loading && !wallet) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <View style={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.sm, paddingBottom: spacing.sectionGap }}>
        {/* Greeting row */}
        <View className="flex flex-row items-center justify-between" style={{ paddingVertical: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text style={typography.caption}>{t('wallet.greeting')}</Text>
            <Text style={typography.screenTitle}>{firstName}</Text>
          </View>
          <Pressable
            className="relative items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.full,
              backgroundColor: colors.bgWhite,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.card,
            }}
            onPress={handleNotificationPress}
          >
            <Bell size={20} color={colors.textSecondary} />
            {/* Notification dot */}
            <View
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                width: 8,
                height: 8,
                borderRadius: radius.full,
                backgroundColor: colors.danger,
              }}
            />
          </Pressable>
        </View>

        {/* Sections */}
        <View style={{ gap: spacing.sectionGap, marginTop: spacing.sm }}>
          {/* Balance card */}
          <BalanceCard wallet={wallet} />

          {/* Quick actions */}
          <QuickActions />

          {/* Recent transactions */}
          <RecentTransactions transactions={transactions} />

          {/* Nearby merchants */}
          <NearbyMerchants merchants={merchants} />
        </View>
      </View>
    </ScrollView>
  );
}
