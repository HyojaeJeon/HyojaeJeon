import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export function SearchBar() {
  const { t } = useTranslation();
  return (
    <View className="relative">
      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <Search size={18} color="#9CA3AF" />
      </View>
      <TextInput
        editable={false}
        placeholder={t('merchant.searchPlaceholder')}
        placeholderTextColor="#9CA3AF"
        className="h-[48px] w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900"
      />
    </View>
  );
}
