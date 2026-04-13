import { View, Text, Pressable } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { MOCK_EMPLOYEE } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

export function CompanyBindStep() {
  const { t } = useTranslation();

  const INFO_ROWS = [
    { label: t('auth.companyBind.name'), value: MOCK_EMPLOYEE.name },
    { label: t('auth.companyBind.employeeCode'), value: MOCK_EMPLOYEE.employeeCode },
    { label: t('auth.companyBind.department'), value: MOCK_EMPLOYEE.department },
    { label: t('auth.companyBind.company'), value: MOCK_EMPLOYEE.corporateName },
  ];

  return (
    <View className="flex flex-col px-5 pt-6">
      {/* Step indicator */}
      <View className="flex flex-row items-center gap-2">
        <Text className="text-xs font-medium text-[#3B82F6]">{t('auth.step', { current: 2, total: 4 })}</Text>
      </View>
      <View className="mt-2 h-1 w-full rounded-full bg-gray-200">
        <View className="h-1 w-1/2 rounded-full bg-[#3B82F6]" />
      </View>

      {/* Title */}
      <Text className="mt-6 text-xl font-bold text-gray-900">
        {t('auth.companyBind.title')}
      </Text>
      <Text className="mt-2 text-sm text-gray-500">
        Ki\u1EC3m tra th\u00F4ng tin nh\u00E2n vi\u00EAn \u0111\u01B0\u1EE3c li\u00EAn k\u1EBFt
      </Text>

      {/* Info card */}
      <View className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <View className="gap-4">
          {INFO_ROWS.map((row) => (
            <View key={row.label}>
              <Text className="text-xs text-gray-400">{row.label}</Text>
              <Text className="mt-0.5 text-sm font-medium text-gray-900">
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Success badge */}
      <View className="mt-5 flex flex-row items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
        <CheckCircle size={18} color="#10B981" />
        <Text className="text-sm font-medium text-emerald-700">
          {t('auth.companyBind.matchSuccess')}
        </Text>
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
