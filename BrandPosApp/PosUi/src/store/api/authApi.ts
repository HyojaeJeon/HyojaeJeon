import { posApi } from './posApi';
import type {
  LoginRequest,
  AuthSession,
} from '@contracts/auth/login.types';
import { loginFixtures } from '@mocks/fixtures/auth/login.fixture';

/**
 * Auth API — 인증 관련 endpoint
 *
 * 데이터 소스 분기는 빌드 타임 상수 `NEXT_PUBLIC_DATA_SOURCE` 로 전환한다.
 *   'mock'   → fixture 반환 (백엔드 없이 UI 개발)
 *   'bridge' → C++ LoginUseCase (STAFF:LOGIN) 호출 — EdgePos 정상 모드
 *   'rest'   → 향후 REST 백엔드 연동용 (현재 미사용)
 *
 * **Reference 패턴**: 모든 endpoint 는 이 구조를 그대로 복제한다.
 * 백엔드 연동 시 .env.local 의 NEXT_PUBLIC_DATA_SOURCE 한 줄만 변경한다.
 */
const DATA_SOURCE = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock') as
  | 'mock'
  | 'bridge'
  | 'rest';

const authApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthSession, LoginRequest>({
      queryFn: async (params, _api, _extra, baseQuery) => {
        switch (DATA_SOURCE) {
          case 'mock': {
            return { data: loginFixtures.default };
          }
          case 'bridge': {
            const result = await baseQuery({
              cmd: 'STAFF:LOGIN',
              params: {
                employeeId: params.employeeId,
                password: params.password,
                depositAmount: params.depositAmount,
                loginMode: params.loginMode,
              },
            });
            return result as { data: AuthSession };
          }
          case 'rest': {
            const result = await baseQuery({
              url: '/auth/login',
              method: 'POST',
              body: params,
            });
            return result as { data: AuthSession };
          }
        }
      },
      invalidatesTags: ['System'],
    }),

    logout: build.mutation<unknown, void>({
      queryFn: async (_params, _api, _extra, baseQuery) => {
        switch (DATA_SOURCE) {
          case 'mock': {
            return { data: { ok: true } };
          }
          case 'bridge': {
            const result = await baseQuery({ cmd: 'AUTH:LOGOUT', params: {} });
            return result as { data: unknown };
          }
          case 'rest': {
            const result = await baseQuery({ url: '/auth/logout', method: 'POST' });
            return result as { data: unknown };
          }
        }
      },
      invalidatesTags: ['System', 'Table', 'Order', 'Payment'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
