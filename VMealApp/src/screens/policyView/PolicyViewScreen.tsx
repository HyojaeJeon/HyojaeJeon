import { View, Text, ScrollView } from 'react-native';
import { Info } from 'lucide-react-native';
import { AppHeader } from '@shared/ui/AppHeader';
import { MOCK_POLICIES, MOCK_EMPLOYEE } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';
import { PolicyCard } from './PolicyCard';

export default function PolicyViewScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <AppHeader title={t('policy.title')} />

      <ScrollView className="flex-1 px-5 pt-4 pb-6">
        <View className="gap-4">
          {/* Info banner */}
          <View className="flex-row gap-3 rounded-xl border border-[#3B82F6]/10 bg-[#3B82F6]/5 p-4">
            <Info size={18} color="#3B82F6" />
            <Text className="text-xs text-gray-600 leading-relaxed flex-1">
              {t('policy.banner', { company: MOCK_EMPLOYEE.corporateName })}
            </Text>
          </View>

          {/* Policy cards */}
          {MOCK_POLICIES.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}

          {/* Footer note */}
          <Text className="text-xs text-gray-400 text-center pt-2">
            {t('policy.contactAdmin')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
