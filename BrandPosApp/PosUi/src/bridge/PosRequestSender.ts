/**
 * PosRequestSender — UI → C++ 요청/응답 단일 창구
 *
 * 모든 bridge 통신은 이 파일을 거친다. 컴포넌트에서 window.cefQuery를 직접 호출하지 않는다.
 * RTK Query baseQuery와 bridge/commands/ 모두 이 sendRequest를 transport로 사용한다.
 *
 * [개선] transport를 모듈 스코프에서 1회만 결정하여 캐시한다.
 *        매 요청마다 동적 import + 환경 감지를 반복하지 않는다.
 *
 * Envelope 규격:
 *   요청: { v, requestId, timestamp, cmd, params, idempotencyKey? }
 *   응답: { v, requestId, timestamp, ok, code, data?, error? }
 */

interface Envelope {
  v: number;
  requestId: string;
  timestamp: string;
  cmd: string;
  params: Record<string, unknown>;
  idempotencyKey?: string;
}

interface RequestOptions {
  idempotencyKey?: string;
  timeout?: number;
}

export interface PosResponse {
  v: number;
  requestId: string;
  timestamp: string;
  ok: boolean;
  code: string;
  data?: unknown;
  error?: { message: string };
}

type TransportFn = (envelope: Envelope) => Promise<unknown>;

let _requestIdCounter = 0;

/** UUID-like requestId 생성 (crypto 불가 환경 대비) */
function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  _requestIdCounter += 1;
  return `req-${Date.now()}-${_requestIdCounter}`;
}

/**
 * transport를 모듈 스코프에서 1회만 결정하여 캐시한다.
 * 이전: 매 요청마다 async import + window.cefQuery 검사 반복
 * 이후: 첫 호출에서 결정 → Promise 캐시 → 이후 즉시 반환
 */
let _transportPromise: Promise<TransportFn> | null = null;

function getTransport(): Promise<TransportFn> {
  if (_transportPromise) return _transportPromise;

  _transportPromise = (async () => {
    if (typeof window !== 'undefined' && window.cefQuery) {
      const { cefTransport } = await import('./adapters/cefTransport');
      return cefTransport as TransportFn;
    }
    const { mockTransport } = await import('./adapters/mockTransport');
    return mockTransport as TransportFn;
  })();

  return _transportPromise;
}

/** 현재 요청에서 사용 중인 requestId를 추적 (중복 이벤트 필터링용) */
const pendingRequestIds = new Set<string>();

export function isPendingRequest(requestId: string): boolean {
  return pendingRequestIds.has(requestId);
}

/**
 * C++로 요청을 보내고 응답을 받는다.
 *
 * @param cmd - 명령어 (예: "TABLE:GET_ALL", "TABLE:SELECT", "PAYMENT:EXECUTE")
 * @param params - 요청 파라미터
 * @param options - { idempotencyKey?, timeout? }
 * @returns 표준 응답 { v, requestId, timestamp, ok, code, data?, error? }
 */
export async function sendRequest(
  cmd: string,
  params: Record<string, unknown> = {},
  options: RequestOptions = {},
): Promise<PosResponse> {
  const requestId = generateRequestId();

  const envelope: Envelope = {
    v: 1,
    requestId,
    timestamp: new Date().toISOString(),
    cmd,
    params,
  };

  if (options.idempotencyKey) {
    envelope.idempotencyKey = options.idempotencyKey;
  }

  pendingRequestIds.add(requestId);

  try {
    const transport = await getTransport();
    const response = (await transport(envelope)) as PosResponse;
    return response;
  } finally {
    // 응답 수신 후 지연을 두고 제거.
    // C++의 PosRealTimeSender가 응답보다 먼저 이벤트를 보낼 수 있으므로
    // 충분한 여유(1.5초)를 두어 중복 이벤트를 확실히 필터링한다.
    setTimeout(() => pendingRequestIds.delete(requestId), 1500);
  }
}
