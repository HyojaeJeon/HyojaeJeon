import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { PrimaryButton } from '@shared/ui';
import { colors, typography, spacing, radius } from '@shared/ui/tokens';
import { useTranslation } from 'react-i18next';

interface PhoneVerifyStepProps {
  onNext: () => void;
  /** Phone number to display (E.164 format) */
  phone?: string;
}

const OTP_LENGTH = 6;

/** Mask phone: +84795050727 -> +84 795 *** 727 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} *** ${digits.slice(-3)}`;
}

export function PhoneVerifyStep({ onNext, phone = '' }: PhoneVerifyStepProps) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(165); // 2:45 = 165 seconds
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  const isComplete = otp.every((d) => d !== '');

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((v) => v - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleChange = (text: string, index: number) => {
    // Take only last character (handles paste edge case per-box)
    const char = text.slice(-1);
    if (char && !/\d/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next box
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous box and clear it
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    if (!isComplete) return;
    // In production: validate OTP against server.
    // For now, proceed to next step.
    onNext();
  };

  return (
    <View className="flex flex-col" style={{ paddingHorizontal: spacing.screenHorizontal, paddingTop: spacing.xxl }}>
      {/* Step indicator */}
      <View className="flex flex-row items-center" style={{ gap: spacing.sm }}>
        <Text style={{ ...typography.caption, fontWeight: '500', color: colors.primary }}>{t('auth.step', { current: 1, total: 4 })}</Text>
      </View>
      <View style={{ marginTop: spacing.sm, height: 4, width: '100%', borderRadius: radius.full, backgroundColor: colors.border }}>
        <View style={{ height: 4, width: '25%', borderRadius: radius.full, backgroundColor: colors.primary }} />
      </View>

      {/* Title */}
      <Text style={{ ...typography.sectionTitle, fontSize: 20, fontWeight: '700', marginTop: spacing.xxl }}>
        {t('auth.phoneVerify.title')}
      </Text>
      <Text style={{ ...typography.body, marginTop: spacing.sm }}>
        {'\u004D\u00E3 x\u00E1c th\u1EF1c \u0111\u00E3 \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn s\u1ED1 \u0111i\u1EC7n tho\u1EA1i c\u1EE7a b\u1EA1n'}
      </Text>

      {/* Phone display */}
      <View className="flex items-center justify-center" style={{ marginTop: spacing.xxl, borderRadius: radius.md, backgroundColor: colors.bgInput, paddingVertical: spacing.lg }}>
        <Text style={{ fontSize: 18, fontWeight: '600', letterSpacing: 1, color: colors.textPrimary }}>
          {phone ? maskPhone(phone) : '—'}
        </Text>
      </View>

      {/* OTP boxes */}
      <View className="flex flex-row items-center justify-center" style={{ marginTop: spacing.sectionGap, gap: spacing.elementGap }}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(ref) => { inputRefs.current[i] = ref; }}
            value={digit}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            style={{
              height: 56, width: 46, borderRadius: radius.md,
              borderWidth: 2,
              borderColor: digit ? colors.primary : colors.border,
              backgroundColor: digit ? colors.primaryLight : colors.bgWhite,
              textAlign: 'center', fontSize: 20, fontWeight: '700',
              color: digit ? colors.textPrimary : colors.textPlaceholder,
            }}
          />
        ))}
      </View>

      {/* Timer */}
      <Text style={{ ...typography.body, textAlign: 'center', marginTop: spacing.xxl }}>
        {t('auth.phoneVerify.resendAfter')}{' '}
        <Text style={{ fontWeight: '600', color: colors.primary }}>{formatTimer(timer)}</Text>
      </Text>

      {/* Confirm button */}
      <View style={{ marginTop: spacing.sectionGap }}>
        <PrimaryButton
          title={t('common.confirm')}
          onPress={handleConfirm}
          disabled={!isComplete}
          size="lg"
          className="w-full"
        />
      </View>
    </View>
  );
}
