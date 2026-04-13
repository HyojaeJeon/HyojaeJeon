/**
 * 한국어: 표준 success 코드. resolver 가 raw 값을 반환하면 interceptor 가
 *   기본적으로 'OK' 코드를 사용해 success 응답을 만든다. 도메인이 별도 코드
 *   ('CREATED', 'UPDATED' 등) 를 원하면 명시적으로 wrap 할 수 있다.
 *
 * Tiếng Việt: Bảng mã thành công.
 */
export const SuccessCode = {
  OK: 'OK',
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
} as const;

export type SuccessCodeValue = (typeof SuccessCode)[keyof typeof SuccessCode];
