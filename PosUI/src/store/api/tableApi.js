import { posApi } from './posApi';

/**
 * Table API — 테이블 조회/선택 엔드포인트
 * posApi.injectEndpoints()로 등록한다.
 */
const tableApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    getTables: build.query({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        return baseQuery({ cmd: 'TABLE:GET_ALL', params: {} });
      },
      providesTags: ['Table'],
    }),

    selectTable: build.mutation({
      queryFn: async ({ id }, _api, _extraOptions, baseQuery) => {
        return baseQuery({ cmd: 'TABLE:SELECT', params: { id } });
      },
      invalidatesTags: ['Table'],
    }),
  }),
});

export const { useGetTablesQuery, useSelectTableMutation } = tableApi;
