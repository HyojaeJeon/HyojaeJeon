import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, Heart, UtensilsCrossed } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { MockMerchant } from '@shared/mock/types';

interface PhotoHeaderProps {
  merchant: MockMerchant;
}

export function PhotoHeader({ merchant }: PhotoHeaderProps) {
  return (
    <View className="relative h-[200px] w-full">
      {/* Background gradient placeholder */}
      <LinearGradient
        colors={['#FEF3C7', '#FFEDD5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      {/* Center icon */}
      <View className="absolute inset-0 items-center justify-center">
        <UtensilsCrossed size={56} color="#FBBF24" />
      </View>

      {/* Restaurant name overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)']}
        className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10"
      >
        <Text className="text-lg font-bold text-white">
          {merchant.branchName}
        </Text>
      </LinearGradient>

      {/* Back button */}
      <Pressable className="absolute left-4 top-4 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/90 shadow-sm">
        <ChevronLeft size={20} color="#111827" />
      </Pressable>

      {/* Heart button */}
      <Pressable className="absolute right-4 top-4 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/90 shadow-sm">
        <Heart size={18} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}
