import { View, Text, Pressable } from 'react-native';
import { ShoppingBag, Plus, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { colors, typography, spacing, shadows, radius } from '@shared/ui/tokens';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function QuickActions() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const ACTIONS = [
    {
      icon: ShoppingBag,
      label: t('wallet.order'),
      bgColor: colors.primaryLight,
      iconColor: colors.primary,
      onPress: () => navigation.navigate('Main', { screen: 'MerchantMap' } as never),
    },
    {
      icon: Plus,
      label: t('wallet.topUp'),
      bgColor: colors.successLight,
      iconColor: colors.success,
      onPress: () => navigation.navigate('TopUpScreen'),
    },
    {
      icon: Users,
      label: t('wallet.groupPay'),
      bgColor: colors.warningLight,
      iconColor: colors.warning,
      onPress: () => navigation.navigate('GroupPayScreen', { merchantId: '' }),
    },
  ];

  return (
    <View className="flex flex-row items-center justify-center" style={{ gap: spacing.xl + spacing.xl }}>
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Pressable
            key={action.label}
            className="flex flex-col items-center"
            style={{ gap: spacing.sm }}
            onPress={action.onPress}
          >
            <View
              className="items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: radius.full,
                backgroundColor: action.bgColor,
                ...shadows.card,
              }}
            >
              <Icon size={26} color={action.iconColor} />
            </View>
            <Text style={[typography.caption, { fontWeight: '500', color: colors.textSecondary }]}>
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
