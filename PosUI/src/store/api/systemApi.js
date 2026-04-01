import { posApi } from './posApi';

/**
 * System API — 부트스트랩/설정/시스템 상태 엔드포인트
 */
const systemApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    getBootstrapData: build.query({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        return baseQuery({ cmd: 'SYSTEM:BOOTSTRAP', params: {} });
      },
      providesTags: ['System'],
    }),
  }),
});

export const { useGetBootstrapDataQuery } = systemApi;
