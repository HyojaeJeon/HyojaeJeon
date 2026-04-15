import { View, Text, Pressable, TextInput } from 'react-native';
import { UtensilsCrossed, Coffee, Salad, QrCode } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  return (
    <View className="flex flex-col" style={{ flex: 1, minHeight: 700, backgroundColor: colors.bg, paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.sm }}>
      {/* Top section: Logo + heading */}
      <View className="flex flex-col items-center" style={{ paddingTop: spacing.sectionGap }}>
        {/* Small logo */}
        <LinearGradient
          colors={[colors.primary, '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex items-center justify-center"
          style={{ height: 56, width: 56, borderRadius: radius.xl }}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textInverse }}>V</Text>
        </LinearGradient>

        <Text style={{ ...typography.displayMedium, fontSize: 22, marginTop: spacing.lg }}>
          {t('onboarding.welcome')}
        </Text>
        <Text style={{ ...typography.body, marginTop: spacing.xs }}>
          {t('splash.tagline')}
        </Text>
      </View>

      {/* Illustration area */}
      <LinearGradient
        colors={[colors.primaryLight, '#EEF2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex items-center justify-center"
        style={{ alignSelf: 'center', marginTop: spacing.sectionGap, height: 180, width: '100%', maxWidth: 280, borderRadius: radius.xxl }}
      >
        <View className="flex flex-row items-center" style={{ gap: spacing.xxl }}>
          <View className="flex items-center justify-center bg-orange-100" style={{ height: 56, width: 56, borderRadius: radius.xl }}>
            <UtensilsCrossed size={28} color="#F97316" />
          </View>
          <View className="flex items-center justify-center bg-amber-100" style={{ height: 56, width: 56, borderRadius: radius.xl }}>
            <Coffee size={28} color="#D97706" />
          </View>
          <View className="flex items-center justify-center bg-emerald-100" style={{ height: 56, width: 56, borderRadius: radius.xl }}>
            <Salad size={28} color={colors.success} />
          </View>
        </View>
      </LinearGradient>

      {/* Company code input */}
      <View style={{ marginTop: spacing.sectionGap }}>
        <Text style={{ ...typography.body, fontWeight: '500', color: colors.textPrimary }}>
          {t('onboarding.enterCode')}
        </Text>
        <View className="flex flex-row items-center" style={{ marginTop: spacing.sm, height: components.input.height, borderRadius: components.input.borderRadius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite, paddingHorizontal: spacing.lg }}>
          <TextInput
            className="flex-1"
            style={{ fontSize: components.input.fontSize, color: colors.textPrimary }}
            placeholder={t('onboarding.codePlaceholder')}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <Text style={{ ...typography.caption, marginTop: spacing.sm }}>
          {t('onboarding.codeHelper')}
        </Text>
      </View>

      {/* QR code link */}
      <Pressable className="flex flex-row items-center" style={{ alignSelf: 'center', marginTop: spacing.lg, gap: spacing.sm }}>
        <QrCode size={16} color={colors.primary} />
        <Text style={{ ...typography.body, fontWeight: '500', color: colors.primary }}>{t('onboarding.orScanQR')}</Text>
      </Pressable>

      {/* Spacer to push button down */}
      <View className="flex-1" />

      {/* CTA → Login 화면으로 이동 (기획서 §4.1 인증 흐름) */}
      <Pressable
        onPress={() => navigation.navigate('Login')}
        className="flex w-full items-center justify-center"
        style={{ marginBottom: spacing.lg, height: components.input.height, borderRadius: radius.md, backgroundColor: colors.primary }}
      >
        <Text style={{ ...typography.button, color: colors.textInverse }}>
          {t('common.continue')}
        </Text>
      </Pressable>

      {/* Footer version */}
      <Text style={{ ...typography.caption, textAlign: 'center', color: colors.textPlaceholder, marginBottom: spacing.xxl }}>
        {t('onboarding.version')} 1.0.0
      </Text>
    </View>
  );
}
