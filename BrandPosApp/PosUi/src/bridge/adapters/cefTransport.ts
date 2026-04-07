interface Envelope {
  v: number;
  requestId: string;
  timestamp: string;
  cmd: string;
  params: Record<string, unknown>;
  idempotencyKey?: string;
}

/**
 * CEF Transport — 실제 window.cefQuery를 Promise로 래핑
 * CEF 환경에서만 동작한다. next dev 환경에서는 mockTransport가 사용된다.
 */
export const cefTransport = (envelope: Envelope) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.cefQuery) {
      reject(new Error('cefQuery is not available. Not running inside CEF.'));
      return;
    }

    window.cefQuery({
      request: JSON.stringify(envelope),
      onSuccess: (responseJson: string) => {
        try {
          const parsed = JSON.parse(responseJson);
          resolve(parsed);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          reject(new Error(`Failed to parse C++ response: ${msg}`));
        }
      },
      onFailure: (errorCode: number, errorMessage: string) => {
        reject(new Error(`cefQuery failed [${errorCode}]: ${errorMessage}`));
      },
    });
  });
};
