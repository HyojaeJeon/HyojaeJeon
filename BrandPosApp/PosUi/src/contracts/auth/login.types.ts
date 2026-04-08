/**
 * LOGIN bridge contract (PosUi ↔ C++ LoginUseCase)
 *
 * Bridge command: STAFF:LOGIN
 * Source of truth for: store/api/authApi.ts, mocks/fixtures/auth/login.fixture.ts,
 *                      screens/LoginScreen
 *
 * 백엔드(=C++ UseCase) 연동 시 이 파일은 변경하지 않는다.
 * 변경이 필요하면 화면 문서(login.md) 의 데이터 요구사항부터 수정한다.
 */

export type LoginMode = 'NORMAL' | 'ORDER';

export interface LoginRequest {
  employeeId: string;
  password: string;
  depositAmount: number;
  loginMode: LoginMode;
}

export interface AuthSession {
  employeeId: string;
  employeeName: string;
  role: string;
  storeCode: string;
  storeName: string;
  posNo: string;
  adjustNo: string;
  loginAt: string;
}

export interface LoginErrorPayload {
  code: string;
  message: string;
}
