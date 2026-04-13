import { View, Text, Pressable } from 'react-native';
import { MOCK_EMPLOYEE } from '@shared/mock/mockData';
import { useTranslation } from 'react-i18next';

/** Mask phone: +84795050727 -> +84 795 *** 727 */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} *** ${digits.slice(-3)}`;
}

const OTP_FILLED = ['4', '2', '8', '', '', ''];

export function PhoneVerifyStep() {
  const { t } = useTranslation();

  return (
    <View className="flex flex-col px-5 pt-6">
      {/* Step indicator */}
      <View className="flex flex-row items-center gap-2">
        <Text className="text-xs font-medium text-[#3B82F6]">{t('auth.step', { current: 1, total: 4 })}</Text>
      </View>
      <View className="mt-2 h-1 w-full rounded-full bg-gray-200">
        <View className="h-1 w-1/4 rounded-full bg-[#3B82F6]" />
      </View>

      {/* Title */}
      <Text className="mt-6 text-xl font-bold text-gray-900">
        {t('auth.phoneVerify.title')}
      </Text>
      <Text className="mt-2 text-sm text-gray-500">
        {'\u004D\u00E3 x\u00E1c th\u1EF1c \u0111\u00E3 \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn s\u1ED1 \u0111i\u1EC7n tho\u1EA1i c\u1EE7a b\u1EA1n'}
      </Text>

      {/* Phone display */}
      <View className="mt-6 flex items-center justify-center rounded-xl bg-gray-50 py-4">
        <Text className="text-lg font-semibold tracking-wider text-gray-900">
          {maskPhone(MOCK_EMPLOYEE.phone)}
        </Text>
      </View>

      {/* OTP boxes */}
      <View className="mt-8 flex flex-row items-center justify-center gap-3">
        {OTP_FILLED.map((digit, i) => (
          <View
            key={i}
            className={`flex h-[56px] w-[46px] items-center justify-center rounded-xl border-2 ${
              digit
                ? 'border-[#3B82F6] bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Text
              className={`text-xl font-bold ${
                digit ? 'text-gray-900' : 'text-gray-300'
              }`}
            >
              {digit || '\u2022'}
            </Text>
          </View>
        ))}
      </View>

      {/* Timer */}
      <Text className="mt-6 text-center text-sm text-gray-400">
        {t('auth.phoneVerify.resendAfter')}{' '}
        <Text className="font-semibold text-[#3B82F6]">02:45</Text>
      </Text>

      {/* Confirm button — disabled since OTP incomplete */}
      <Pressable
        disabled
        className="mt-8 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6]/40"
      >
        <Text className="text-[15px] font-semibold text-white">
          {t('common.confirm')}
        </Text>
      </Pressable>
    </View>
  );
}
