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
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { useModal } from '@shared/ui';
import { colors, typography, spacing } from '@shared/ui/tokens';
import { useAppDispatch, useAppSelector } from '@store/index';
import { clearSession } from '@store/slices/authSlice';
import { setBiometricEnabled } from '@store/slices/settingsSlice';
import { useSettingsData } from './useSettingsData';
import { ProfileCard } from './ProfileCard';
import { MenuSection } from './MenuSection';
import type { MenuItem } from './MenuSection';

type SettingsNavProp = NativeStackNavigationProp<RootStackParamList>;

const LOCALE_LABELS: Record<string, string> = {
  vi: 'Tiếng Việt',
  ko: '한국어',
  en: 'English',
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<SettingsNavProp>();
  const { show: showModal } = useModal();
  const dispatch = useAppDispatch();
  const { employee } = useSettingsData();

  const biometricEnabled = useAppSelector((s) => s.settings.biometricEnabled);
  const currentLocale = useAppSelector((s) => s.settings.locale);

  /* ─── Handlers ─── */

  const handleLanguagePicker = () => {
    navigation.navigate('LanguageSettingScreen');
  };

  const handleAppInfo = () => {
    navigation.navigate('AppInfoScreen');
  };

  const handleLogout = () => {
    showModal({
      title: t('settings.logoutConfirmTitle'),
      message: t('settings.logoutConfirmMessage'),
      variant: 'danger',
      confirmText: t('settings.logout'),
      cancelText: t('common.cancel'),
      onConfirm: () => {
        dispatch(clearSession());
      },
    });
  };

  const handleProfilePress = () => {
    navigation.navigate('ProfileEditScreen');
  };

  /* ─── Menu items ─── */

  const mealTicketItems: MenuItem[] = [
    {
      label: t('settings.policyView'),
      icon: Shield,
      onPress: () => navigation.navigate('PolicyViewScreen'),
    },
    {
      label: t('settings.badgeLink'),
      icon: CreditCard,
      badge: 'RFID-****7890',
      badgeColor: 'gray',
      onPress: () => navigation.navigate('BadgeLinkScreen'),
    },
    {
      label: t('settings.eWallet'),
      icon: Wallet,
      badge: t('settings.momoLinked'),
      badgeColor: 'green',
      onPress: () => navigation.navigate('EWalletLinkScreen'),
    },
  ];

  const appSettingItems: MenuItem[] = [
    {
      label: t('settings.notification'),
      icon: Bell,
      onPress: () => navigation.navigate('NotificationSettingScreen'),
    },
    {
      label: t('settings.language'),
      icon: Globe,
      badge: LOCALE_LABELS[currentLocale] ?? t('settings.languageVi'),
      badgeColor: 'gray',
      onPress: handleLanguagePicker,
    },
    {
      label: t('settings.biometric'),
      icon: Fingerprint,
      toggle: biometricEnabled,
      onToggle: (value: boolean) => dispatch(setBiometricEnabled(value)),
    },
  ];

  const otherItems: MenuItem[] = [
    {
      label: t('settings.support'),
      icon: HelpCircle,
      onPress: () => navigation.navigate('SupportScreen'),
    },
    {
      label: t('settings.appInfo'),
      icon: Info,
      onPress: handleAppInfo,
    },
  ];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg, paddingHorizontal: spacing.screenHorizontal, paddingTop: 8, paddingBottom: 24 }}
    >
      {/* Title */}
      <Text style={{ ...typography.screenTitle, paddingVertical: 12 }}>{t('settings.appSettings')}</Text>

      <View style={{ gap: spacing.sectionGap }}>
        {/* Profile card */}
        <ProfileCard employee={employee} onPress={handleProfilePress} />

        {/* Menu sections */}
        <MenuSection title={t('settings.mealManagement')} items={mealTicketItems} />
        <MenuSection title={t('settings.appSettings')} items={appSettingItems} />
        <MenuSection title={t('settings.other')} items={otherItems} />

        {/* Logout */}
        <View className="flex-col items-center" style={{ marginTop: spacing.xl }}>
          <Pressable className="flex-row items-center active:opacity-70" style={{ gap: spacing.sm }} onPress={handleLogout}>
            <LogOut size={18} color={colors.danger} />
            <Text style={{ ...typography.button, color: colors.danger }}>
              {t('settings.logout')}
            </Text>
          </Pressable>
          <Text style={{ ...typography.caption, color: colors.textPlaceholder, marginTop: spacing.sm }}>
            {t('settings.version', { ver: '1.0.0', build: '100' })}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
