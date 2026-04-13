import { View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { MockMealEmployee } from '@shared/mock/types';

interface ProfileCardProps {
  employee: MockMealEmployee;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ProfileCard({ employee }: ProfileCardProps) {
  const { t } = useTranslation();
  const initials = getInitials(employee.name);

  return (
    <View>
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <View className="flex-row items-center gap-4">
          {/* Avatar */}
          <View className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-[#3B82F6]">
            <Text className="text-white text-xl font-bold">{initials}</Text>
          </View>

          {/* Info */}
          <View className="flex-1 min-w-0">
            <Text className="text-[16px] font-semibold text-gray-900" numberOfLines={1}>
              {employee.name}
            </Text>
            <Text className="text-sm text-gray-400 mt-0.5">{employee.department}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{employee.employeeCode}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{employee.corporateName}</Text>
          </View>

          {/* Chevron */}
          <ChevronRight size={20} color="#D1D5DB" />
        </View>
      </View>

      {/* Account status */}
      <View className="flex-row items-center gap-1.5 mt-2 px-1">
        <View className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        <Text className="text-xs text-[#10B981]">{t('settings.activeAccount')}</Text>
      </View>
    </View>
  );
}
