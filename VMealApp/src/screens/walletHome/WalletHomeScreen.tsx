import { View, Text, Pressable, ScrollView } from 'react-native';
import { Bell } from 'lucide-react-native';
import { MOCK_EMPLOYEE } from '@shared/mock/mockData';
import { BalanceCard } from './BalanceCard';
import { QuickActions } from './QuickActions';
import { RecentTransactions } from './RecentTransactions';
import { NearbyMerchants } from './NearbyMerchants';
import { useTranslation } from 'react-i18next';

export default function WalletHomeScreen() {
  const { t } = useTranslation();
  const firstName = MOCK_EMPLOYEE.name.split(' ').pop() ?? MOCK_EMPLOYEE.name;

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 pt-2 pb-6">
        {/* Greeting row */}
        <View className="flex flex-row items-center justify-between py-3">
          <View>
            <Text className="text-xs text-gray-400">{t('wallet.greeting')}</Text>
            <Text className="text-lg font-bold text-gray-900">{firstName}</Text>
          </View>
          <Pressable className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm">
            <Bell size={18} color="#4B5563" />
            {/* Notification dot */}
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Pressable>
        </View>

        {/* Sections */}
        <View className="gap-6 mt-2">
          {/* Balance card */}
          <BalanceCard />

          {/* Quick actions */}
          <QuickActions />

          {/* Recent transactions */}
          <RecentTransactions />

          {/* Nearby merchants */}
          <NearbyMerchants />
        </View>
      </View>
    </ScrollView>
  );
}
