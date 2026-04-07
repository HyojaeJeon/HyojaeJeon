import { createApi } from '@reduxjs/toolkit/query/react';

interface BridgeArg {
  cmd: string;
  params: Record<string, unknown>;
  idempotencyKey?: string;
}

/**
 * POS Bridge baseQuery
 * RTK Query의 모든 endpoint가 이 baseQuery를 통해 PosRequestSender로 통신한다.
 * fetch 대신 bridge transport를 사용하므로 인터넷이 아닌 로컬 C++/SQLite 경로로 조회한다.
 *
 * [개선] PosRequestSender를 모듈 스코프에서 1회 import 후 캐시.
 *        매 요청마다 dynamic import 반복하지 않는다.
 */
let _sendRequest: typeof import('@bridge/PosRequestSender').sendRequest | null = null;

async function getSendRequest() {
  if (_sendRequest) return _sendRequest;
  const mod = await import('@bridge/PosRequestSender');
  _sendRequest = mod.sendRequest;
  return _sendRequest;
}

const posBaseQuery = () => async (arg: BridgeArg) => {
  const sendRequest = await getSendRequest();
  try {
    const response = await sendRequest(arg.cmd, arg.params, {
      idempotencyKey: arg.idempotencyKey,
    });
    if (response.ok) {
      return { data: response.data };
    }
    return { error: { code: response.code, data: response.error } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: { code: 'TRANSPORT_ERROR', data: message } };
  }
};

/**
 * POS API Root
 * 모든 도메인별 Api는 posApi.injectEndpoints()로 등록한다.
 *
 * [개선] tagTypes 세분화:
 *   - 'TableList' : 테이블 목록 전체
 *   - 'Table'     : 개별 테이블 (id별)
 *   - 'Floor'     : 층별 테이블 그룹
 *   → 부분 갱신이 가능하도록 태그를 나눈다.
 */
export const posApi = createApi({
  reducerPath: 'posApi',
  baseQuery: posBaseQuery(),
  tagTypes: ['TableList', 'Table', 'Floor', 'Order', 'Payment', 'Sync', 'System', 'Config'],
  endpoints: () => ({}),
});
