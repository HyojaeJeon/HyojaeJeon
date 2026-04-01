import { posApi } from './posApi';

/**
 * Order/Menu API — 메뉴 조회, 주문 조회/추가 엔드포인트
 * posApi.injectEndpoints()로 등록한다.
 */
const orderApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    getMenu: build.query({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        return baseQuery({ cmd: 'MENU:GET_ALL', params: {} });
      },
      providesTags: ['Order'],
    }),

    getOrder: build.query({
      queryFn: async ({ tableId }, _api, _extraOptions, baseQuery) => {
        return baseQuery({ cmd: 'ORDER:GET', params: { tableId } });
      },
      providesTags: ['Order'],
    }),

    addOrderItem: build.mutation({
      queryFn: async ({ tableId, menuId, quantity }, _api, _extraOptions, baseQuery) => {
        return baseQuery({ cmd: 'ORDER:ADD_ITEM', params: { tableId, menuId, quantity } });
      },
      invalidatesTags: ['Order', 'Table'],
    }),
  }),
});

export const { useGetMenuQuery, useGetOrderQuery, useAddOrderItemMutation } = orderApi;
