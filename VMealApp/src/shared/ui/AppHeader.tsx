import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  transparent?: boolean;
}

export function AppHeader({ title, onBack, right, transparent = false }: AppHeaderProps) {
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <View
      className={`flex-row h-[56px] items-center justify-between px-4 ${
        transparent ? '' : 'border-b border-gray-100 bg-white'
      }`}
    >
      {/* Left */}
      <View className="w-[44px] items-start justify-center">
        <Pressable
          onPress={handleBack}
          className="h-[44px] w-[44px] items-center justify-center rounded-full active:bg-gray-100"
        >
          <ChevronLeft size={24} color="#111827" />
        </Pressable>
      </View>

      {/* Center */}
      <Text
        className="flex-1 text-center text-[17px] font-semibold text-gray-900"
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right */}
      <View className="w-[44px] items-end justify-center">{right}</View>
    </View>
  );
}
