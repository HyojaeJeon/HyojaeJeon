import { View, Text, ScrollView, Pressable } from 'react-native';
import { Bell, ShoppingBag, CreditCard, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, Card } from '@shared/ui';
import { colors, typography, spacing, radius, shadows, components } from '@shared/ui/tokens';

interface NotificationItem {
  id: string;
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM';
  titleKey: string;
  bodyKey: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'ORDER', titleKey: 'notification.orderAccepted', bodyKey: 'notification.orderAcceptedBody', time: '5m', read: false },
  { id: 'n2', type: 'PAYMENT', titleKey: 'notification.paymentSuccess', bodyKey: 'notification.paymentSuccessBody', time: '1h', read: false },
  { id: 'n3', type: 'ORDER', titleKey: 'notification.orderReady', bodyKey: 'notification.orderReadyBody', time: '2h', read: true },
  { id: 'n4', type: 'SYSTEM', titleKey: 'notification.policyUpdated', bodyKey: 'notification.policyUpdatedBody', time: '1d', read: true },
  { id: 'n5', type: 'PAYMENT', titleKey: 'notification.topUpSuccess', bodyKey: 'notification.topUpSuccessBody', time: '2d', read: true },
];

const TYPE_ICON = {
  ORDER: { icon: ShoppingBag, color: colors.primary, bg: colors.primaryLight },
  PAYMENT: { icon: CreditCard, color: colors.success, bg: colors.successLight },
  SYSTEM: { icon: Bell, color: colors.warning, bg: colors.warningLight },
};

export default function NotificationListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader
        title={t('notification.title')}
        onBack={() => navigation.goBack()}
        right={
          <Pressable>
            <Clock size={20} color={colors.textSecondary} />
          </Pressable>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.lg,
          paddingBottom: spacing.sectionGap,
        }}
      >
        {unreadCount > 0 && (
          <Text
            style={{
              ...typography.caption,
              marginBottom: spacing.md,
            }}
          >
            {t('notification.unreadCount', { count: unreadCount })}
          </Text>
        )}

        <View style={{ gap: spacing.itemGap }}>
          {MOCK_NOTIFICATIONS.map((notif) => {
            const config = TYPE_ICON[notif.type];
            const Icon = config.icon;

            return (
              <Pressable key={notif.id}>
                <Card
                  style={{
                    padding: spacing.cardPadding,
                    backgroundColor: !notif.read ? colors.primaryLight : colors.bgCard,
                    ...shadows.card,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <View
                      style={{
                        height: components.avatar.md.size,
                        width: components.avatar.md.size,
                        borderRadius: radius.full,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: config.bg,
                      }}
                    >
                      <Icon size={18} color={config.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text
                          style={{
                            ...typography.cardTitle,
                            fontWeight: !notif.read ? '700' : typography.cardTitle.fontWeight,
                            color: !notif.read ? colors.textPrimary : colors.textSecondary,
                          }}
                          numberOfLines={1}
                        >
                          {t(notif.titleKey)}
                        </Text>
                        <Text
                          style={{
                            ...typography.caption,
                            marginLeft: spacing.sm,
                          }}
                        >
                          {notif.time}
                        </Text>
                      </View>
                      <Text
                        style={{
                          ...typography.body,
                          marginTop: spacing.xs,
                        }}
                        numberOfLines={2}
                      >
                        {t(notif.bodyKey)}
                      </Text>
                    </View>
                    {!notif.read && (
                      <View
                        style={{
                          height: 8,
                          width: 8,
                          borderRadius: radius.full,
                          backgroundColor: colors.primary,
                          marginTop: spacing.xs,
                          marginLeft: spacing.sm,
                        }}
                      />
                    )}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {MOCK_NOTIFICATIONS.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Bell size={48} color={colors.textPlaceholder} />
            <Text
              style={{
                ...typography.body,
                color: colors.textPlaceholder,
                marginTop: spacing.lg,
              }}
            >
              {t('notification.empty')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
