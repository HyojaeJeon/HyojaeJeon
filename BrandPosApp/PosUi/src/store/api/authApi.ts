import { posApi } from './posApi';

/**
 * 인증 세션 데이터
 * C++ LoginUseCase가 반환하고, SQLite에 영구 저장하는 구조.
 * UI 측에서는 RTK Query 캐시로만 보관한다 (localStorage 사용 안 함).
 */
interface AuthSession {
  employeeId: string;
  employeeName: string;
  role: string;
  storeCode: string;
  storeName: string;
  posNo: string;
  adjustNo: string;
  loginAt: string;
}

interface LoginParams {
  employeeId: string;
  password: string;
  depositAmount: number;
  loginMode: 'normal' | 'order';
}

/**
 * Auth API — 인증 관련 엔드포인트
 *
 * 세션 영구 저장은 C++ SQLite가 담당한다. UI는 저장하지 않는다.
 *
 * 프로세스:
 *   [POS 시작] → SYSTEM:BOOTSTRAP → C++가 SQLite에서 세션 조회
 *     → session 있음 → 자동 로그인 (메인 메뉴)
 *     → session 없음 → 로그인 화면
 *
 *   [로그인] → AUTH:LOGIN → C++ LoginUseCase
 *     → 중앙서버 인증 API 호출 → 성공 → SQLite에 세션 저장
 *     → UI에 세션 데이터 반환
 *
 *   [POS 종료 → 재시작] → SYSTEM:BOOTSTRAP
 *     → C++가 SQLite에서 마지막 세션 로드 → UI에 전달
 *     → 로그인 화면 건너뛰고 메인 메뉴로
 */
const authApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * 로그인
     * C++ LoginUseCase가 중앙서버 인증 + SQLite 세션 저장을 담당한다.
     */
    login: build.mutation<AuthSession, LoginParams>({
      queryFn: async (params, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          cmd: 'AUTH:LOGIN',
          params: {
            employeeId: params.employeeId,
            password: params.password,
            depositAmount: params.depositAmount,
            loginMode: params.loginMode,
          },
        });
        return result as { data: AuthSession };
      },
      invalidatesTags: ['System'],
    }),

    /**
     * 로그아웃
     * C++가 SQLite 세션 삭제를 담당한다.
     */
    logout: build.mutation<unknown, void>({
      queryFn: async (_params, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ cmd: 'AUTH:LOGOUT', params: {} });
        return result as { data: unknown };
      },
      invalidatesTags: ['System', 'Table', 'Order', 'Payment'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
} = authApi;
