import { posApi } from './posApi';

/**
 * 부트스트랩 응답 데이터
 *
 * POS 시작 시 C++가 SQLite에서 로드하는 초기 데이터.
 * session이 있으면 자동 로그인, 없으면 로그인 화면.
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

interface BootstrapData {
  posId: string;
  storeName: string;
  dbConnected: boolean;
  internetConnected: boolean;
  mqttConnected: boolean;
  printerConnected: boolean;
  syncBacklogCount: number;
  session: AuthSession | null;  // SQLite에서 로드한 마지막 세션 (없으면 null → 로그인 필요)
  theme: 'light' | 'dark';     // SQLite LocalSetting에서 로드한 테마
}

/**
 * System API — 부트스트랩/설정/시스템 상태
 *
 * POS 시작 흐름:
 *   app 시작 → useGetBootstrapDataQuery()
 *     → C++ SYSTEM:BOOTSTRAP
 *       → SQLite에서 세션/설정/상태 조회
 *       → 응답: { session, posId, storeName, ... }
 *     → session !== null → 메인 메뉴
 *     → session === null → 로그인 화면
 */
const systemApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    getBootstrapData: build.query<BootstrapData, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ cmd: 'SYSTEM:BOOTSTRAP', params: {} });
        return result as { data: BootstrapData };
      },
      providesTags: ['System'],
    }),
  }),
});

export const { useGetBootstrapDataQuery } = systemApi;
