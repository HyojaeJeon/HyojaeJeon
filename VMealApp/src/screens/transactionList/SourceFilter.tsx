import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius } from '@shared/ui/tokens';

interface FilterChip {
  label: string;
  active: boolean;
}

interface SourceFilterProps {
  filters: FilterChip[];
  onFilterPress?: (label: string) => void;
}

export function SourceFilter({ filters, onFilterPress }: SourceFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 4 }}>
      <View className="flex-row" style={{ gap: 8 }}>
        {filters.map((f) => (
          <Pressable
            key={f.label}
            onPress={() => onFilterPress?.(f.label)}
            className="flex-row shrink-0 items-center"
            style={{
              height: 36,
              borderRadius: radius.full,
              paddingHorizontal: 16,
              gap: 6,
              backgroundColor: f.active ? colors.primary : colors.bgWhite,
              borderWidth: f.active ? 0 : 1,
              borderColor: f.active ? undefined : colors.border,
            }}
          >
            {f.active && <Check size={14} color={colors.textInverse} />}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: f.active ? colors.textInverse : colors.textSecondary,
              }}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
