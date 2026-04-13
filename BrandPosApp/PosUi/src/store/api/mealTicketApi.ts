/**
 * 한국어: RFID 식권 RTK Query endpoint — 배지 조회 + 결제 승인.
 * Tiếng Việt: RTK Query endpoint phiếu ăn RFID — tra cứu thẻ + phê duyệt thanh toán.
 */
import { posApi } from './posApi';
import type {
  MealTicketLookupRequest,
  MealTicketLookupResponse,
  MealTicketAuthorizeRequest,
  MealTicketAuthorizeResponse,
} from '@contracts/mealTicket/mealTicket.types';
import { mealTicketFixtures } from '@mocks/fixtures/mealTicket/mealTicket.fixture';

const DATA_SOURCE = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock') as 'mock' | 'bridge' | 'rest';

const mealTicketApi = posApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * 한국어: RFID 배지로 직원/지갑 조회.
     * Tiếng Việt: Tra cứu nhân viên/ví bằng thẻ RFID.
     */
    lookupBadge: build.mutation<MealTicketLookupResponse | null, MealTicketLookupRequest>({
      queryFn: async (params, _api, _extra, baseQuery) => {
        switch (DATA_SOURCE) {
          case 'mock':
            return { data: mealTicketFixtures.lookup.default };
          case 'bridge':
            return (await baseQuery({ cmd: 'MEAL_TICKET:LOOKUP_BADGE', params })) as {
              data: MealTicketLookupResponse | null;
            };
          case 'rest':
            return (await baseQuery({
              cmd: 'MEAL_TICKET:LOOKUP_BADGE',
              params,
            })) as { data: MealTicketLookupResponse | null };
        }
      },
      invalidatesTags: ['MealTicket'],
    }),

    /**
     * 한국어: 식권 결제 승인 요청.
     * Tiếng Việt: Yêu cầu phê duyệt thanh toán phiếu ăn.
     */
    authorizeMealTicket: build.mutation<MealTicketAuthorizeResponse, MealTicketAuthorizeRequest>({
      queryFn: async (params, _api, _extra, baseQuery) => {
        switch (DATA_SOURCE) {
          case 'mock':
            return { data: mealTicketFixtures.authorize.default };
          case 'bridge':
            return (await baseQuery({
              cmd: 'MEAL_TICKET:AUTHORIZE',
              params,
              idempotencyKey: params.idempotencyKey,
            })) as { data: MealTicketAuthorizeResponse };
          case 'rest':
            return (await baseQuery({
              cmd: 'MEAL_TICKET:AUTHORIZE',
              params,
              idempotencyKey: params.idempotencyKey,
            })) as { data: MealTicketAuthorizeResponse };
        }
      },
      invalidatesTags: ['MealTicket'],
    }),
  }),
});

export const { useLookupBadgeMutation, useAuthorizeMealTicketMutation } = mealTicketApi;
