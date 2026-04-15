import { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import {
  Bell,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  Utensils,
  Moon,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, Card } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useAppDispatch, useAppSelector } from '@store/index';
import { setNotificationEnabled } from '@store/slices/settingsSlice';

interface ToggleItem {
  id: string;
  icon: LucideIcon;
  labelKey: string;
  descKey: string;
}

const TOGGLE_ITEMS: ToggleItem[] = [
  {
    id: 'push',
    icon: Bell,
    labelKey: 'notificationSetting.pushNotifications',
    descKey: 'notificationSetting.pushDesc',
  },
  {
    id: 'orderStatus',
    icon: ShoppingBag,
    labelKey: 'notificationSetting.orderUpdates',
    descKey: 'notificationSetting.orderUpdatesDesc',
  },
  {
    id: 'payment',
    icon: CreditCard,
    labelKey: 'notificationSetting.paymentConfirm',
    descKey: 'notificationSetting.paymentConfirmDesc',
  },
  {
    id: 'dailyLimit',
    icon: AlertTriangle,
    labelKey: 'notificationSetting.dailyLimit',
    descKey: 'notificationSetting.dailyLimitDesc',
  },
  {
    id: 'dailyMenu',
    icon: Utensils,
    labelKey: 'notificationSetting.dailyMenu',
    descKey: 'notificationSetting.dailyMenuDesc',
  },
];

export default function NotificationSettingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const masterEnabled = useAppSelector((s) => s.settings.notificationEnabled);

  // Local toggles for sub-settings (in production these would be persisted per-key)
  const [subToggles, setSubToggles] = useState<Record<string, boolean>>({
    orderStatus: true,
    payment: true,
    dailyLimit: true,
    dailyMenu: false,
  });

  const handleMasterToggle = (value: boolean) => {
    dispatch(setNotificationEnabled(value));
  };

  const handleSubToggle = (id: string, value: boolean) => {
    setSubToggles((prev) => ({ ...prev, [id]: value }));
  };

  const isSubDisabled = !masterEnabled;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={t('notificationSetting.title')} onBack={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={{ gap: spacing.elementGap }}>
          {TOGGLE_ITEMS.map((item) => {
            const isMaster = item.id === 'push';
            const isOn = isMaster ? masterEnabled : (subToggles[item.id] ?? false);
            const disabled = !isMaster && isSubDisabled;
            const IconComp = item.icon;

            return (
              <Card key={item.id} style={{ padding: spacing.cardPaddingCompact }}>
                <View className="flex-row items-center">
                  {/* Icon */}
                  <View
                    className="items-center justify-center"
                    style={{
                      height: 40, width: 40, borderRadius: radius.md,
                      backgroundColor: disabled ? colors.border : colors.primaryLight,
                    }}
                  >
                    <IconComp size={20} color={disabled ? colors.textPlaceholder : colors.primary} />
                  </View>

                  {/* Label + description */}
                  <View style={{ flex: 1, marginLeft: spacing.elementGap, marginRight: spacing.elementGap }}>
                    <Text
                      style={{
                        ...typography.cardTitle,
                        color: disabled ? colors.textPlaceholder : colors.textPrimary,
                      }}
                    >
                      {t(item.labelKey)}
                    </Text>
                    <Text
                      style={{
                        ...typography.caption,
                        marginTop: 2,
                        color: disabled ? colors.borderLight : colors.textTertiary,
                      }}
                    >
                      {t(item.descKey)}
                    </Text>
                  </View>

                  {/* Toggle */}
                  <Switch
                    value={isOn}
                    onValueChange={(v) =>
                      isMaster ? handleMasterToggle(v) : handleSubToggle(item.id, v)
                    }
                    disabled={disabled}
                    trackColor={{ false: '#E5E7EB', true: colors.primary }}
                    thumbColor={colors.bgWhite}
                  />
                </View>
              </Card>
            );
          })}

          {/* Quiet hours section */}
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ ...typography.overline, marginBottom: spacing.elementGap }}>
              {t('notificationSetting.quietHours')}
            </Text>
            <Card style={{ padding: spacing.cardPaddingCompact }}>
              <View className="flex-row items-center">
                <View className="items-center justify-center" style={{ height: 40, width: 40, borderRadius: radius.md, backgroundColor: colors.border }}>
                  <Moon size={20} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.elementGap }}>
                  <Text style={typography.cardTitle}>
                    {t('notificationSetting.quietHoursLabel')}
                  </Text>
                  <Text style={{ ...typography.caption, marginTop: 2 }}>
                    {t('notificationSetting.quietHoursDesc')}
                  </Text>
                </View>
                <View style={{ backgroundColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.elementGap, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>22:00 - 07:00</Text>
                </View>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
