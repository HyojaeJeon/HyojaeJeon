import { View, Text, Pressable } from 'react-native';
import { ShoppingBag, Plus, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export function QuickActions() {
  const { t } = useTranslation();

  const ACTIONS = [
    {
      icon: ShoppingBag,
      label: t('wallet.order'),
      bgColor: 'bg-blue-50',
      iconColor: '#3B82F6',
    },
    {
      icon: Plus,
      label: t('wallet.topUp'),
      bgColor: 'bg-emerald-50',
      iconColor: '#10B981',
    },
    {
      icon: Users,
      label: t('wallet.groupPay'),
      bgColor: 'bg-amber-50',
      iconColor: '#F59E0B',
    },
  ];

  return (
    <View className="flex flex-row items-center justify-center gap-8">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Pressable key={action.label} className="flex flex-col items-center gap-2">
            <View
              className={`flex h-14 w-14 items-center justify-center rounded-full ${action.bgColor}`}
            >
              <Icon size={22} color={action.iconColor} />
            </View>
            <Text className="text-xs font-medium text-gray-600">
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
