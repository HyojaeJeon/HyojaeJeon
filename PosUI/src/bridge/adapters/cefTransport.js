/**
 * CEF Transport — 실제 window.cefQuery를 Promise로 래핑
 * CEF 환경에서만 동작한다. next dev 환경에서는 mockTransport가 사용된다.
 *
 * @param {object} envelope - { v, requestId, timestamp, cmd, params, idempotencyKey? }
 * @returns {Promise<object>} C++ 응답 JSON
 */
export const cefTransport = (envelope) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.cefQuery) {
      reject(new Error('cefQuery is not available. Not running inside CEF.'));
      return;
    }

    window.cefQuery({
      request: JSON.stringify(envelope),
      onSuccess: (responseJson) => {
        try {
          const parsed = JSON.parse(responseJson);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse C++ response: ${e.message}`));
        }
      },
      onFailure: (errorCode, errorMessage) => {
        reject(new Error(`cefQuery failed [${errorCode}]: ${errorMessage}`));
      },
    });
  });
};
