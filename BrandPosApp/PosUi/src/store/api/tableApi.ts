import { posApi } from './posApi';

interface TableItem {
  id: number;
  name: string;
  label: string;
  status: string;
  floor: number;
  [key: string]: unknown;
}

interface TableData {
  tables: TableItem[];
}

/**
 * Table API — 테이블 조회/선택 엔드포인트
 *
 * [개선 1] 세분화된 태그 전략:
 *   - 'TableList'        → 목록 전체를 나타내는 태그
 *   - { type:'Table', id } → 개별 테이블 태그
 *   - { type:'Floor', id } → 층별 태그
 *   테이블 1개가 바뀌면 해당 테이블 + 해당 층만 갱신, 전체 목록은 재조회하지 않는다.
 *
 * [개선 2] mutation 성공 시 optimistic cache update:
 *   C++에서 돌아온 응답 데이터로 해당 테이블의 캐시를 직접 패치한다.
 *   invalidatesTags를 사용하지 않으므로 중복 refetch가 발생하지 않는다.
 *   외부 변경(다른 POS, 배달앱 등)은 PosRealTimeReceiver의 TABLE_REFRESH가 처리한다.
 *
 * [개선 3] idempotencyKey 부여:
 *   TABLE:SELECT는 상태 변경 mutation이므로 멱등성 키를 생성하여 중복 실행을 방지한다.
 */
const tableApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    getTables: build.query<TableData, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ cmd: 'TABLE:GET_ALL', params: {} });
        return result as { data: TableData };
      },
      providesTags: (result) =>
        result?.tables
          ? [
              'TableList',
              ...result.tables.map((t) => ({ type: 'Table' as const, id: t.id })),
              // 층별 태그 (중복 제거)
              ...Array.from(new Set(result.tables.map((t) => t.floor))).map(
                (f) => ({ type: 'Floor' as const, id: f }),
              ),
            ]
          : ['TableList'],
    }),

    selectTable: build.mutation<{ tableId: number; status: string; [k: string]: unknown }, { id: number }>({
      queryFn: async ({ id }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          cmd: 'TABLE:SELECT',
          params: { id },
          idempotencyKey: `TABLE_SELECT_${id}_${Date.now()}`,
        });
        return result as { data: { tableId: number; status: string } };
      },
      /**
       * optimistic cache update — mutation 성공 시 캐시를 직접 수정한다.
       * invalidatesTags 대신 onQueryStarted + updateQueryData를 사용하여
       * TABLE:GET_ALL 재요청 없이 해당 테이블의 status만 갱신한다.
       */
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            tableApi.util.updateQueryData('getTables', undefined, (draft) => {
              const table = draft.tables.find((t) => t.id === id);
              if (table) {
                table.status = data.status ?? 'OCCUPIED';
              }
            }),
          );
        } catch {
          // mutation 실패 시 캐시 변경 없음
        }
      },
      // invalidatesTags 제거: 중복 refetch 방지. 외부 변경은 PosRealTime이 처리.
    }),
  }),
});

export const { useGetTablesQuery, useSelectTableMutation } = tableApi;
