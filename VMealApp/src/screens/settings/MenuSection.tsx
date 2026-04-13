import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { ComponentType } from 'react';

export interface MenuItem {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  badge?: string;
  badgeColor?: 'green' | 'gray' | 'blue';
  toggle?: boolean;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

function BadgeLabel({ text, color = 'gray' }: { text: string; color?: 'green' | 'gray' | 'blue' }) {
  const colorMap = {
    green: 'text-[#10B981]',
    gray: 'text-gray-400',
    blue: 'text-[#3B82F6]',
  };
  return <Text className={`text-xs ${colorMap[color]}`}>{text}</Text>;
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <View
      className={`relative h-[26px] w-[46px] rounded-full ${
        on ? 'bg-[#3B82F6]' : 'bg-gray-300'
      }`}
    >
      <View
        className={`absolute top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-sm ${
          on ? 'left-[22px]' : 'left-[2px]'
        }`}
      />
    </View>
  );
}

export function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-semibold uppercase text-gray-400 tracking-wide px-1">{title}</Text>
      <View className="rounded-2xl overflow-hidden border border-gray-100">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <View key={item.label}>
              {idx > 0 && <View className="border-t border-gray-100 mx-4" />}
              <Pressable className="flex-row items-center gap-3 bg-white px-4 py-3.5">
                <Icon size={20} color="#9CA3AF" />
                <Text className="flex-1 text-[15px] text-gray-900">{item.label}</Text>
                {item.badge && (
                  <BadgeLabel text={item.badge} color={item.badgeColor} />
                )}
                {item.toggle !== undefined && <ToggleSwitch on={item.toggle} />}
                {item.toggle === undefined && (
                  <ChevronRight size={18} color="#D1D5DB" />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
