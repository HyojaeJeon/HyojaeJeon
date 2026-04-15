/**
 * VMeal 인증 서비스
 * - OTP 전화번호 인증 (Firebase Auth)
 * - 생체인증 (react-native-biometrics)
 * - 세션 관리 (Apollo + Redux)
 */

import ReactNativeBiometrics, { type BiometryType } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

/** 생체인증 지원 여부 확인 */
export async function checkBiometricAvailability(): Promise<{
  available: boolean;
  biometryType: 'FaceID' | 'TouchID' | 'Biometrics' | null;
}> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, biometryType: available ? biometryType as BiometryType : null };
  } catch {
    return { available: false, biometryType: null };
  }
}

/** 생체인증 프롬프트 */
export async function promptBiometric(reason: string): Promise<boolean> {
  try {
    const { success } = await rnBiometrics.simplePrompt({ promptMessage: reason });
    return success;
  } catch {
    return false;
  }
}

/** OTP 전송 (Firebase Auth - 스텁) */
export async function sendOtp(phoneNumber: string): Promise<{ confirmationId: string }> {
  // TODO: Firebase Auth phone verification
  // import auth from '@react-native-firebase/auth';
  // const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
  console.log('[AuthService] sendOtp:', phoneNumber);
  return { confirmationId: 'mock-confirmation-id' };
}

/** OTP 검증 (Firebase Auth - 스텁) */
export async function verifyOtp(confirmationId: string, code: string): Promise<boolean> {
  // TODO: confirmation.confirm(code)
  console.log('[AuthService] verifyOtp:', confirmationId, code);
  return true;
}

/** 세션 토큰 갱신 */
export async function refreshSession(/* apolloClient, dispatch */): Promise<boolean> {
  // TODO: Call CentralApi refreshSession mutation
  return false;
}
