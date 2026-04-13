import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  Shield,
  CreditCard,
  Wallet,
  Bell,
  Globe,
  Fingerprint,
  HelpCircle,
  Info,
  LogOut,
} from 'lucide-react-native';
import { MOCK_EMPLOYEE } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { ProfileCard } from './ProfileCard';
import { MenuSection } from './MenuSection';
import type { MenuItem } from './MenuSection';

export default function SettingsScreen() {
  const { t } = useTranslation();

  const mealTicketItems: MenuItem[] = [
    { label: t('settings.policyView'), icon: Shield },
    { label: t('settings.badgeLink'), icon: CreditCard, badge: 'RFID-****7890', badgeColor: 'gray' },
    { label: t('settings.eWallet'), icon: Wallet, badge: t('settings.momoLinked'), badgeColor: 'green' },
  ];

  const appSettingItems: MenuItem[] = [
    { label: t('settings.notification'), icon: Bell, toggle: true },
    { label: t('settings.language'), icon: Globe, badge: t('settings.languageVi'), badgeColor: 'gray' },
    { label: t('settings.biometric'), icon: Fingerprint, toggle: true },
  ];

  const otherItems: MenuItem[] = [
    { label: t('settings.support'), icon: HelpCircle },
    { label: t('settings.appInfo'), icon: Info },
  ];

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC] px-5 pt-2 pb-6">
      {/* Title */}
      <Text className="text-lg font-bold text-gray-900 py-3">{t('settings.appSettings')}</Text>

      <View className="gap-5">
        {/* Profile card */}
        <ProfileCard employee={MOCK_EMPLOYEE} />

        {/* Menu sections */}
        <MenuSection title={t('settings.mealManagement')} items={mealTicketItems} />
        <MenuSection title={t('settings.appSettings')} items={appSettingItems} />
        <MenuSection title={t('settings.other')} items={otherItems} />

        {/* Logout */}
        <View className="mt-6 flex-col items-center">
          <Pressable className="flex-row items-center gap-2">
            <LogOut size={18} color="#EF4444" />
            <Text className="text-[15px] font-medium text-[#EF4444]">
              {t('settings.logout')}
            </Text>
          </Pressable>
          <Text className="mt-2 text-xs text-gray-300">
            {t('settings.version', { ver: '1.0.0', build: '100' })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
