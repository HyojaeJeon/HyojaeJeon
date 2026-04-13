import { View, Text } from 'react-native';
import { UtensilsCrossed } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { t } = useTranslation();
  return (
    <LinearGradient
      colors={['#3B82F6', '#6366F1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex h-full min-h-[700px] flex-col items-center justify-between py-16"
    >
      {/* Top spacer */}
      <View />

      {/* Center logo + text */}
      <View className="flex flex-col items-center gap-4">
        {/* Logo */}
        <View className="relative flex h-[100px] w-[100px] items-center justify-center">
          {/* Outer glow ring */}
          <View className="absolute inset-0 rounded-3xl bg-white/10" />
          {/* Inner icon area */}
          <View className="relative flex items-center justify-center">
            <Text className="text-[52px] font-extrabold leading-none text-white tracking-tight">
              V
            </Text>
            <View className="absolute -right-2 -top-1">
              <UtensilsCrossed
                size={22}
                color="rgba(255,255,255,0.8)"
                strokeWidth={2.5}
              />
            </View>
          </View>
        </View>

        {/* App name */}
        <Text className="text-4xl font-bold text-white tracking-tight">VMeal</Text>

        {/* Subtitle */}
        <Text className="text-sm text-white/70">{t('splash.tagline')}</Text>
      </View>

      {/* Bottom loading section */}
      <View className="flex flex-col items-center gap-4">
        {/* Spinner — static placeholder (animate-spin removed for RN) */}
        <View className="h-8 w-8 rounded-full border-[3px] border-white/30 border-t-white" />

        {/* Loading text */}
        <Text className="text-xs text-white/50">{t('splash.loading')}</Text>
      </View>
    </LinearGradient>
  );
}
