import { createApi } from '@reduxjs/toolkit/query/react';

/**
 * POS Bridge baseQuery
 * RTK Query의 모든 endpoint가 이 baseQuery를 통해 PosRequestSender로 통신한다.
 * fetch 대신 bridge transport를 사용하므로 인터넷이 아닌 로컬 C++/MSSQL 경로로 조회한다.
 */
const posBaseQuery = () => async (arg) => {
  // arg = { cmd, params, idempotencyKey? }
  const { sendRequest } = await import('@bridge/PosRequestSender');
  try {
    const response = await sendRequest(arg.cmd, arg.params, {
      idempotencyKey: arg.idempotencyKey,
    });
    if (response.ok) {
      return { data: response.data };
    }
    return { error: { code: response.code, data: response.error } };
  } catch (err) {
    return { error: { code: 'TRANSPORT_ERROR', data: err.message } };
  }
};

/**
 * POS API Root
 * 모든 도메인별 Api는 posApi.injectEndpoints()로 등록한다.
 */
export const posApi = createApi({
  reducerPath: 'posApi',
  baseQuery: posBaseQuery(),
  tagTypes: ['Table', 'Order', 'Payment', 'Sync', 'System', 'Config'],
  endpoints: () => ({}),
});
