/**
 * PosRequestSender — UI → C++ 요청/응답 단일 창구
 *
 * 모든 bridge 통신은 이 파일을 거친다. 컴포넌트에서 window.cefQuery를 직접 호출하지 않는다.
 * RTK Query baseQuery와 bridge/commands/ 모두 이 sendRequest를 transport로 사용한다.
 *
 * Envelope 규격:
 *   요청: { v, requestId, timestamp, cmd, params, idempotencyKey? }
 *   응답: { v, requestId, timestamp, ok, code, data?, error? }
 */

let _requestIdCounter = 0;

/** UUID-like requestId 생성 (crypto 불가 환경 대비) */
function generateRequestId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  _requestIdCounter += 1;
  return `req-${Date.now()}-${_requestIdCounter}`;
}

/** 현재 환경에 맞는 transport를 선택 */
async function getTransport() {
  // CEF 환경: window.cefQuery가 존재
  if (typeof window !== 'undefined' && window.cefQuery) {
    const { cefTransport } = await import('./adapters/cefTransport');
    return cefTransport;
  }
  // 개발 환경: mockTransport 사용
  const { mockTransport } = await import('./adapters/mockTransport');
  return mockTransport;
}

/**
 * C++로 요청을 보내고 응답을 받는다.
 *
 * @param {string} cmd - 명령어 (예: "TABLE:GET_ALL", "TABLE:SELECT", "PAYMENT:EXECUTE")
 * @param {object} [params={}] - 요청 파라미터
 * @param {object} [options={}] - { idempotencyKey?, timeout? }
 * @returns {Promise<object>} 표준 응답 { v, requestId, timestamp, ok, code, data?, error? }
 */
export async function sendRequest(cmd, params = {}, options = {}) {
  const envelope = {
    v: 1,
    requestId: generateRequestId(),
    timestamp: new Date().toISOString(),
    cmd,
    params,
  };

  if (options.idempotencyKey) {
    envelope.idempotencyKey = options.idempotencyKey;
  }

  const transport = await getTransport();
  const response = await transport(envelope);
  return response;
}
