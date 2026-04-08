/**
 * LoginScreen fixtures (3종 시나리오 강제: default / empty / error)
 *
 * 사용처: store/api/authApi.ts (DATA_SOURCE === 'mock' 분기)
 * 백엔드 연동 시 이 파일은 변경하지 않는다.
 */
import type { AuthSession, LoginErrorPayload } from '@contracts/auth/login.types';

export const loginFixtures = {
  default: {
    employeeId: '0001',
    employeeName: '홍길동',
    role: 'MANAGER',
    storeCode: 'ST-0001',
    storeName: 'HJ POS Demo Store',
    posNo: '01',
    adjustNo: '20260408-001',
    loginAt: '2026-04-08T09:00:00.000Z',
  } satisfies AuthSession,

  /**
   * empty: 세션 데이터는 비어있을 수 없으므로
   * 최소 필드만 채운 신규 직원 (이름/역할 미지정) 케이스로 정의한다.
   */
  empty: {
    employeeId: '0000',
    employeeName: '',
    role: '',
    storeCode: '',
    storeName: '',
    posNo: '',
    adjustNo: '',
    loginAt: '2026-04-08T00:00:00.000Z',
  } satisfies AuthSession,

  error: {
    code: 'STAFF_LOGIN_FAILED',
    message: 'Invalid employee id or password',
  } satisfies LoginErrorPayload,
};
