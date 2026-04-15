import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { colors, typography, spacing, shadows, radius } from '@shared/ui/tokens';

export interface MenuItem {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  badge?: string;
  badgeColor?: 'green' | 'gray' | 'blue';
  toggle?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

function BadgeLabel({ text, color = 'gray' }: { text: string; color?: 'green' | 'gray' | 'blue' }) {
  const colorMap = {
    green: colors.success,
    gray: colors.textTertiary,
    blue: colors.primary,
  };
  return <Text style={{ ...typography.caption, color: colorMap[color] }}>{text}</Text>;
}

function ToggleSwitch({ on, onValueChange }: { on: boolean; onValueChange?: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!on)}
      hitSlop={8}
    >
      <View
        className="relative"
        style={{ height: 26, width: 46, borderRadius: radius.full, backgroundColor: on ? colors.primary : colors.textPlaceholder }}
      >
        <View
          className="absolute"
          style={{
            top: 2,
            height: 22,
            width: 22,
            borderRadius: radius.full,
            backgroundColor: colors.bgWhite,
            left: on ? 22 : 2,
          }}
        />
      </View>
    </Pressable>
  );
}

export function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ ...typography.overline, textTransform: 'uppercase', paddingHorizontal: 4 }}>{title}</Text>
      <View
        className="overflow-hidden"
        style={{
          borderRadius: radius.xl,
          backgroundColor: colors.bgCard,
          padding: spacing.cardPadding,
          ...shadows.card,
        }}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isToggle = item.toggle !== undefined;
          return (
            <View key={item.label}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />}
              <Pressable
                className="flex-row items-center active:bg-gray-50"
                style={{ gap: spacing.md, height: 56, paddingHorizontal: 0 }}
                onPress={() => {
                  if (isToggle) {
                    item.onToggle?.(!item.toggle);
                  } else {
                    item.onPress?.();
                  }
                }}
              >
                <View className="items-center justify-center" style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.bgInput }}>
                  <Icon size={20} color={colors.textTertiary} />
                </View>
                <Text className="flex-1" style={typography.cardTitle}>{item.label}</Text>
                {item.badge && (
                  <BadgeLabel text={item.badge} color={item.badgeColor} />
                )}
                {isToggle && (
                  <ToggleSwitch on={!!item.toggle} onValueChange={item.onToggle} />
                )}
                {!isToggle && (
                  <ChevronRight size={18} color={colors.textPlaceholder} />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
