import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Home, MapPin, Receipt, User } from 'lucide-react-native';
import WalletHomeScreen from '@screens/walletHome/WalletHomeScreen';
import MerchantMapScreen from '@screens/merchantMap/MerchantMapScreen';
import TransactionListScreen from '@screens/transactionList/TransactionListScreen';
import SettingsScreen from '@screens/settings/SettingsScreen';

export type MainTabParamList = {
  WalletHome: undefined;
  MerchantMap: undefined;
  TransactionList: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS = {
  WalletHome: Home,
  MerchantMap: MapPin,
  TransactionList: Receipt,
  Settings: User,
} as const;

export function MainTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          backgroundColor: '#FFFFFF',
          height: 56,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        tabBarIcon: ({ color, size }) => {
          const IconComponent = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
          return <IconComponent size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="WalletHome"
        component={WalletHomeScreen}
        options={{ tabBarLabel: t('tab.home') }}
      />
      <Tab.Screen
        name="MerchantMap"
        component={MerchantMapScreen}
        options={{ tabBarLabel: t('tab.explore') }}
      />
      <Tab.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{ tabBarLabel: t('tab.activity') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: t('tab.account') }}
      />
    </Tab.Navigator>
  );
}
