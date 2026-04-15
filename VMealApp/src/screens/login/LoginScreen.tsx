import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { Mail, Phone, ChevronRight, Code } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { MEAL_EMPLOYEE_LOGIN } from '@graphql/mutations/auth';
import { useAppDispatch } from '@store/index';
import { setSession } from '@store/slices/authSlice';
import { useModal } from '@shared/ui';
import { colors, typography, spacing, radius, components } from '@shared/ui/tokens';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * 기획서 §4.2 — 인증 방식 선택 화면
 *
 * 소셜 로그인 (Google, Apple) + 이메일 + 전화번호 OTP
 * + 개발자용 하드코딩 로그인 (DEV only)
 */

/**
 * 개발자용 하드코딩 계정 — Samsung Vietnam 소속 테스트 임직원
 * corporateId: prisma db seed 실행 후 CORP-SAMSUNG-VN 의 실제 UUID 를 입력한다.
 */
const DEV_ACCOUNT = {
  phone: '+84795050727',
  corporateId: '55000d46-9dd0-4ba0-8792-9747b916faed', // CORP-SAMSUNG-VN (seed 결과)
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { show } = useModal();
  const [devLoading, setDevLoading] = useState(false);

  const [employeeLoginMutation] = useMutation(MEAL_EMPLOYEE_LOGIN);

  function showComingSoon() {
    show({
      title: t('common.comingSoon'),
      message: t('common.comingSoonMessage'),
      confirmText: t('common.ok'),
    });
  }

  /** 개발자 로그인 — CentralApi mealEmployeeLogin mutation 호출 */
  async function handleDevLogin() {
    setDevLoading(true);
    try {
      const { data } = await employeeLoginMutation({
        variables: {
          phone: DEV_ACCOUNT.phone,
          corporateId: DEV_ACCOUNT.corporateId,
        },
      });

      const result = data?.mealEmployeeLogin;
      if (result?.error) {
        show({ title: t('common.error'), message: result.error.message ?? result.error.code ?? 'Unknown error', confirmText: t('common.ok') });
        return;
      }

      const payload = result?.success?.data;
      if (payload?.accessToken && payload?.employee) {
        dispatch(
          setSession({
            user: {
              id: payload.employee.id,
              loginId: payload.employee.phone ?? DEV_ACCOUNT.phone,
              displayName: payload.employee.fullName,
              userType: 'MEAL_EMPLOYEE',
              corporateId: payload.employee.corporateId ?? null,
              employeeId: payload.employee.id,
              walletId: payload.wallet?.id ?? null,
            },
            accessToken: payload.accessToken,
          }),
        );
        // setSession -> Redux auth.user 가 설정되면 RootNavigator 가 자동으로 Main 으로 전환
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      show({ title: t('common.error'), message, confirmText: t('common.ok') });
    } finally {
      setDevLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bgWhite }} contentContainerClassName="flex-1" contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 56, paddingBottom: 40 }}>
      {/* Logo + Title */}
      <View className="items-center" style={{ marginBottom: spacing.xxxl }}>
        <LinearGradient
          colors={[colors.primary, '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="items-center justify-center"
          style={{ height: 64, width: 64, borderRadius: radius.xl, marginBottom: spacing.cardPadding }}
        >
          <Text style={{ color: colors.textInverse, fontSize: 24, fontWeight: '700' }}>V</Text>
        </LinearGradient>
        <Text style={typography.displayMedium}>{t('auth.login.title')}</Text>
        <Text style={{ ...typography.body, marginTop: spacing.sm }}>{t('auth.login.subtitle')}</Text>
      </View>

      {/* Social Login Buttons */}
      <View style={{ gap: spacing.elementGap, marginBottom: spacing.sectionGap }}>
        {/* Google */}
        <Pressable
          className="flex-row items-center"
          style={{ height: components.input.height, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgWhite, paddingHorizontal: spacing.lg }}
          onPress={showComingSoon}
        >
          <View className="items-center justify-center" style={{ height: 24, width: 24, borderRadius: radius.full, backgroundColor: colors.bgWhite, marginRight: spacing.elementGap }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#4285F4' }}>G</Text>
          </View>
          <Text className="flex-1" style={typography.button}>
            {t('auth.login.google')}
          </Text>
          <ChevronRight size={18} color={colors.textTertiary} />
        </Pressable>

        {/* Apple */}
        <Pressable
          className="flex-row items-center"
          style={{ height: components.input.height, borderRadius: radius.md, backgroundColor: '#000000', paddingHorizontal: spacing.lg }}
          onPress={showComingSoon}
        >
          <View className="items-center justify-center" style={{ height: 24, width: 24, marginRight: spacing.elementGap }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textInverse }}>&#xF8FF;</Text>
          </View>
          <Text className="flex-1" style={{ ...typography.button, color: colors.textInverse }}>
            {t('auth.login.apple')}
          </Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Divider */}
      <View className="flex-row items-center" style={{ marginBottom: spacing.sectionGap }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
        <Text style={{ ...typography.caption, paddingHorizontal: spacing.lg }}>{t('auth.login.orContinueWith')}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
      </View>

      {/* Email + Phone Login */}
      <View style={{ gap: spacing.elementGap, marginBottom: 40 }}>
        {/* Email */}
        <Pressable
          className="flex-row items-center"
          style={{ height: components.input.height, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgInput, paddingHorizontal: spacing.lg }}
          onPress={showComingSoon}
        >
          <Mail size={20} color={colors.textSecondary} />
          <Text className="flex-1" style={{ ...typography.button, marginLeft: spacing.elementGap }}>
            {t('auth.login.email')}
          </Text>
          <ChevronRight size={18} color={colors.textTertiary} />
        </Pressable>

        {/* Phone OTP */}
        <Pressable
          className="flex-row items-center"
          style={{ height: components.input.height, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgInput, paddingHorizontal: spacing.lg }}
          onPress={() => navigation.navigate('Auth')}
        >
          <Phone size={20} color={colors.textSecondary} />
          <Text className="flex-1" style={{ ...typography.button, marginLeft: spacing.elementGap }}>
            {t('auth.login.phone')}
          </Text>
          <ChevronRight size={18} color={colors.textTertiary} />
        </Pressable>
      </View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* ── DEV LOGIN (개발자 전용) ── */}
      <View style={{ marginBottom: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.warning, backgroundColor: colors.warningLight, padding: spacing.cardPaddingCompact }}>
        <Text style={{ ...typography.caption, fontWeight: '600', color: '#B45309', marginBottom: spacing.sm }}>
          Developer Login
        </Text>
        <Text style={{ fontSize: 11, color: '#D97706', marginBottom: spacing.elementGap }}>
          +84795050727 / Samsung Vietnam (MEAL_EMPLOYEE)
        </Text>
        <Pressable
          onPress={handleDevLogin}
          disabled={devLoading}
          className="flex-row items-center justify-center"
          style={{ height: 44, borderRadius: radius.sm, backgroundColor: '#F59E0B', opacity: devLoading ? 0.6 : 1 }}
        >
          {devLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Code size={16} color="#FFF" />
              <Text style={{ marginLeft: spacing.sm, fontSize: 14, fontWeight: '600', color: colors.textInverse }}>
                Dev Login (Skip Auth)
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Footer */}
      <View className="items-center">
        <Text style={{ ...typography.caption, textAlign: 'center', lineHeight: 20 }}>
          {t('auth.login.agreement')}
        </Text>
      </View>
    </ScrollView>
  );
}
