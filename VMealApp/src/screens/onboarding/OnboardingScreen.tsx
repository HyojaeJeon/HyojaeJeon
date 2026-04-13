import { View, Text, Pressable, TextInput } from 'react-native';
import { UtensilsCrossed, Coffee, Salad, QrCode } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  return (
    <View className="flex h-full min-h-[700px] flex-col bg-[#F8FAFC] px-5 pt-2">
      {/* Top section: Logo + heading */}
      <View className="flex flex-col items-center pt-8">
        {/* Small logo */}
        <LinearGradient
          colors={['#3B82F6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl"
        >
          <Text className="text-[28px] font-extrabold leading-none text-white">V</Text>
        </LinearGradient>

        <Text className="mt-4 text-[22px] font-bold text-gray-900">
          {t('onboarding.welcome')}
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          {t('splash.tagline')}
        </Text>
      </View>

      {/* Illustration area */}
      <LinearGradient
        colors={['#EFF6FF', '#EEF2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mx-auto mt-8 flex h-[180px] w-full max-w-[280px] items-center justify-center rounded-3xl"
      >
        <View className="flex flex-row items-center gap-6">
          <View className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
            <UtensilsCrossed size={28} color="#F97316" />
          </View>
          <View className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <Coffee size={28} color="#D97706" />
          </View>
          <View className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <Salad size={28} color="#10B981" />
          </View>
        </View>
      </LinearGradient>

      {/* Company code input */}
      <View className="mt-8">
        <Text className="text-sm font-medium text-gray-700">
          {t('onboarding.enterCode')}
        </Text>
        <View className="mt-2 flex h-[52px] flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
          <TextInput
            className="flex-1 text-[15px] text-gray-900"
            placeholder={t('onboarding.codePlaceholder')}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <Text className="mt-2 text-xs text-gray-400">
          {t('onboarding.codeHelper')}
        </Text>
      </View>

      {/* QR code link */}
      <Pressable className="mx-auto mt-4 flex flex-row items-center gap-2">
        <QrCode size={16} color="#3B82F6" />
        <Text className="text-sm font-medium text-[#3B82F6]">{t('onboarding.orScanQR')}</Text>
      </Pressable>

      {/* Spacer to push button down */}
      <View className="flex-1" />

      {/* CTA button */}
      <Pressable className="mb-4 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]">
        <Text className="text-[15px] font-semibold text-white">
          {t('common.continue')}
        </Text>
      </Pressable>

      {/* Footer version */}
      <Text className="mb-6 text-center text-[11px] text-gray-300">
        {t('onboarding.version')} 1.0.0
      </Text>
    </View>
  );
}
