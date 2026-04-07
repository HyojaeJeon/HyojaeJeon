import { posApi } from './posApi';

interface MenuData {
  categories: Array<{ id: string; name: string; [key: string]: unknown }>;
  items: Array<{ id: string; name: string; price: number; [key: string]: unknown }>;
}

interface OrderData {
  orderItems: Array<{ id: string; name: string; quantity: number; price: number; [key: string]: unknown }>;
  totalAmount: number;
}

/**
 * Order/Menu API — 메뉴 조회, 주문 조회/추가 엔드포인트
 * posApi.injectEndpoints()로 등록한다.
 */
const orderApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    getMenu: build.query<MenuData, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ cmd: 'MENU:GET_ALL', params: {} });
        return result as { data: MenuData };
      },
      providesTags: ['Order'],
    }),

    getOrder: build.query<OrderData, { tableId: number }>({
      queryFn: async ({ tableId }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ cmd: 'ORDER:GET', params: { tableId } });
        return result as { data: OrderData };
      },
      providesTags: ['Order'],
    }),

    addOrderItem: build.mutation<unknown, { tableId: number; menuId: string; quantity: number }>({
      queryFn: async ({ tableId, menuId, quantity }, _api, _extraOptions, baseQuery) => {
        const result = await baseQuery({ cmd: 'ORDER:ADD_ITEM', params: { tableId, menuId, quantity } });
        return result as { data: unknown };
      },
      invalidatesTags: ['Order', 'Table'],
    }),
  }),
});

export const { useGetMenuQuery, useGetOrderQuery, useAddOrderItemMutation } = orderApi;
