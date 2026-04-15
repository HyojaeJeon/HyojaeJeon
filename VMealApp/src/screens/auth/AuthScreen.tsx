import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';
import { useAppDispatch } from '@store/index';
import { setSession } from '@store/slices/authSlice';
import { colors, typography, spacing } from '@shared/ui/tokens';
import { PhoneVerifyStep } from './PhoneVerifyStep';
import { CompanyBindStep } from './CompanyBindStep';
import { PermissionStep } from './PermissionStep';
import { useTranslation } from 'react-i18next';

type StepKey = 'phone' | 'company' | 'permission';
type AuthNavProp = NativeStackNavigationProp<RootStackParamList>;

const STEP_KEYS: { key: StepKey; labelKey: string }[] = [
  { key: 'phone', labelKey: 'auth.tabs.phone' },
  { key: 'company', labelKey: 'auth.tabs.info' },
  { key: 'permission', labelKey: 'auth.tabs.permission' },
];

const STEP_ORDER: StepKey[] = ['phone', 'company', 'permission'];

export default function AuthScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthNavProp>();
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState<StepKey>('phone');
  const [completedSteps, setCompletedSteps] = useState<Set<StepKey>>(new Set());

  const currentIndex = STEP_ORDER.indexOf(activeStep);

  const goToNextStep = () => {
    // Mark current step as completed
    setCompletedSteps((prev) => new Set(prev).add(activeStep));

    const nextIndex = currentIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      setActiveStep(STEP_ORDER[nextIndex]);
    } else {
      // All steps complete — dispatch session and navigate to Main
      // TODO: Replace with real auth mutation response (OTP verify → server token + user)
      dispatch(
        setSession({
          user: {
            id: '',
            loginId: '',
            displayName: '',
            userType: 'EMPLOYEE',
            corporateId: '',
            employeeId: '',
            walletId: null,
          },
          accessToken: '',
        }),
      );
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const handleTabPress = (key: StepKey) => {
    const targetIndex = STEP_ORDER.indexOf(key);
    // Allow navigating back or to completed steps, but not forward past current
    if (targetIndex <= currentIndex || completedSteps.has(key)) {
      setActiveStep(key);
    }
  };

  return (
    <View className="flex flex-col" style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Step selector tabs */}
      <View className="flex flex-row" style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgWhite }}>
        {STEP_KEYS.map((step) => {
          const active = step.key === activeStep;
          const stepIndex = STEP_ORDER.indexOf(step.key);
          const isAccessible = stepIndex <= currentIndex || completedSteps.has(step.key);
          return (
            <Pressable
              key={step.key}
              onPress={() => handleTabPress(step.key)}
              disabled={!isAccessible}
              className="flex-1 items-center"
              style={{
                paddingVertical: spacing.elementGap,
                borderBottomWidth: active ? 2 : 0,
                borderBottomColor: active ? colors.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  ...typography.caption,
                  fontWeight: '500',
                  color: active ? colors.primary : isAccessible ? colors.textTertiary : colors.textPlaceholder,
                }}
              >
                {t(step.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Active step content */}
      <View className="flex-1">
        {activeStep === 'phone' && <PhoneVerifyStep onNext={goToNextStep} />}
        {activeStep === 'company' && <CompanyBindStep onNext={goToNextStep} />}
        {activeStep === 'permission' && <PermissionStep onNext={goToNextStep} />}
      </View>
    </View>
  );
}
