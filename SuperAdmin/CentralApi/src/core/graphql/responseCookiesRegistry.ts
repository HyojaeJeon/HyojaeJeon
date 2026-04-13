/**
 * 한국어: GraphQL 요청 단위 responseCookies registry.
 *   Apollo/Fastify 경계에서 request/reply 객체 동일성에 기대지 않고,
 *   Fastify request.id 기준으로 queued cookie 배열을 안전하게 회수한다.
 *
 * Tiếng Việt: Registry responseCookies theo từng request GraphQL.
 */

const responseCookiesByRequestId = new Map<string, string[]>();

export function registerResponseCookies(
  requestId: string,
  responseCookies: string[],
): void {
  responseCookiesByRequestId.set(requestId, responseCookies);
}

export function getResponseCookies(requestId: string): string[] | undefined {
  return responseCookiesByRequestId.get(requestId);
}

export function clearResponseCookies(requestId: string): void {
  responseCookiesByRequestId.delete(requestId);
}
