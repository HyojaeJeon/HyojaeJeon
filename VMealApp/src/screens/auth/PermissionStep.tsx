import { View, Text, Pressable } from 'react-native';
import { MapPin, Bell, Fingerprint } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface PermissionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}

function PermissionCard({ icon, title, description, enabled }: PermissionCardProps) {
  return (
    <View className="flex flex-row items-center gap-3 rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
      {/* Icon */}
      <View className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
        {icon}
      </View>

      {/* Text */}
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-gray-900">{title}</Text>
        <Text className="mt-0.5 text-xs text-gray-400 leading-tight">{description}</Text>
      </View>

      {/* Toggle */}
      <View
        className={`relative h-[28px] w-[48px] flex-shrink-0 rounded-full ${
          enabled ? 'bg-[#3B82F6]' : 'bg-gray-200'
        }`}
      >
        <View
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm ${
            enabled ? 'left-[23px]' : 'left-[3px]'
          }`}
        />
      </View>
    </View>
  );
}

export function PermissionStep() {
  const { t } = useTranslation();

  const PERMISSIONS = [
    {
      icon: <MapPin size={20} color="#3B82F6" />,
      title: t('auth.permission.location'),
      description: t('auth.permission.locationDesc'),
      enabled: true,
    },
    {
      icon: <Bell size={20} color="#3B82F6" />,
      title: t('auth.permission.notification'),
      description: t('auth.permission.notificationDesc'),
      enabled: true,
    },
    {
      icon: <Fingerprint size={20} color="#3B82F6" />,
      title: t('auth.permission.biometric'),
      description: t('auth.permission.biometricDesc'),
      enabled: false,
    },
  ];

  return (
    <View className="flex flex-col px-5 pt-6">
      {/* Step indicator */}
      <View className="flex flex-row items-center gap-2">
        <Text className="text-xs font-medium text-[#3B82F6]">{t('auth.step', { current: 3, total: 4 })}</Text>
      </View>
      <View className="mt-2 h-1 w-full rounded-full bg-gray-200">
        <View className="h-1 w-3/4 rounded-full bg-[#3B82F6]" />
      </View>

      {/* Title */}
      <Text className="mt-6 text-xl font-bold text-gray-900">
        {t('auth.permission.title')}
      </Text>
      <Text className="mt-2 text-sm text-gray-500">
        Cho ph\u00E9p \u1EE9ng d\u1EE5ng truy c\u1EADp \u0111\u1EC3 tr\u1EA3i nghi\u1EC7m t\u1ED1t h\u01A1n
      </Text>

      {/* Permission cards */}
      <View className="mt-6 gap-3">
        {PERMISSIONS.map((p) => (
          <PermissionCard
            key={p.title}
            icon={p.icon}
            title={p.title}
            description={p.description}
            enabled={p.enabled}
          />
        ))}
      </View>

      {/* Continue button */}
      <Pressable className="mt-8 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]">
        <Text className="text-[15px] font-semibold text-white">
          {t('common.continue')}
        </Text>
      </Pressable>
    </View>
  );
}
