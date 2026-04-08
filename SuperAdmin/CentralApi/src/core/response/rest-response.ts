/**
 * 한국어: REST 표준 응답 빌더 — GraphQL 의 OperationResponse 와 동일한 shape 을
 *   REST controller 에서도 강제하기 위한 helper.
 *
 *   에러는 throw new DomainError(...) 하나로 통일한다 (DomainExceptionFilter 가
 *   `{ success: null, error: { code, message, requestId, details } }` 를 자동
 *   생성하므로 controller 가 수동으로 error 객체를 만들 필요 없다).
 *
 *   본 모듈의 buildRestSuccess() 는 성공 응답에 동일한 `{ success, error }` 응답 wrapper 를
 *   제공한다. controller 는 typed DTO 만 만들고 buildRestSuccess(req, dto) 를 반환하면 된다.
 *
 *   GraphQL 의 WrapResponseInterceptor 는 REST 를 의도적으로 통과시키므로
 *   (controller 응답 형태에 자유) 본 헬퍼를 직접 호출해 일관성을 강제한다.
 *
 * Tiếng Việt: Helper bọc response REST đồng nhất với GraphQL `{ success, error }`.
 */
import type { IncomingMessage } from 'node:http';
import { SuccessCode, SuccessCodeValue } from './response-codes';

export interface RestSuccessResponse<T> {
  success: {
    code: SuccessCodeValue;
    message: string;
    requestId?: string;
    data: T;
  };
  error: null;
}

interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
}

function extractRequestId(req: RequestLike | IncomingMessage | undefined): string | undefined {
  const headers = (req as RequestLike | undefined)?.headers;
  if (!headers) return undefined;
  const raw = headers['x-request-id'];
  if (Array.isArray(raw)) return raw[0];
  return typeof raw === 'string' ? raw : undefined;
}

/**
 * 한국어: REST controller 가 typed payload 를 표준 response wrapper 로 감싸 반환할 때 사용한다.
 *   message 는 i18n 해석 없이 기본 'Success' 를 쓴다 (REST 응답은 보통 기계 파싱 대상이라 OK).
 *   필요하면 호출 측에서 message 를 명시할 수 있다.
 */
export function buildRestSuccess<T>(
  req: RequestLike | IncomingMessage | undefined,
  data: T,
  options: { code?: SuccessCodeValue; message?: string } = {},
): RestSuccessResponse<T> {
  return {
    success: {
      code: options.code ?? SuccessCode.OK,
      message: options.message ?? 'Success',
      requestId: extractRequestId(req),
      data,
    },
    error: null,
  };
}
