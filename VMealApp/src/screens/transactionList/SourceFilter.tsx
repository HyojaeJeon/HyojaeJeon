import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';

interface FilterChip {
  label: string;
  active: boolean;
}

interface SourceFilterProps {
  filters: FilterChip[];
}

export function SourceFilter({ filters }: SourceFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
      <View className="flex-row gap-2">
        {filters.map((f) => (
          <Pressable
            key={f.label}
            className={`flex-row shrink-0 items-center gap-1.5 rounded-full px-4 py-2 ${
              f.active
                ? 'bg-[#3B82F6]'
                : 'bg-white border border-gray-200'
            }`}
          >
            {f.active && <Check size={14} color="#FFFFFF" />}
            <Text
              className={`text-[13px] font-medium ${
                f.active ? 'text-white' : 'text-gray-600'
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
