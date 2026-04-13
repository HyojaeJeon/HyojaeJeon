/**
 * 한국어:
 *   커서(cursor) 인코딩/디코딩 유틸리티.
 *   커서는 클라이언트에게 "불투명한 문자열(opaque string)"로 보입니다.
 *   내부적으로는 {createdAt, id} 정보를 base64url로 인코딩한 것입니다.
 *
 *   왜 createdAt과 id 두 가지를 모두 사용하나요?
 *   - createdAt: 시간순 정렬을 위해 필요합니다.
 *   - id: 같은 시각에 생성된 항목이 여러 개일 때 고유하게 구별하기 위해 필요합니다.
 *
 * Tiếng Việt:
 *   Tiện ích mã hóa/giải mã con trỏ (cursor).
 *   Con trỏ hiển thị cho client như "chuỗi không rõ nghĩa (opaque string)".
 *   Bên trong, nó mã hóa thông tin {createdAt, id} bằng base64url.
 *
 *   Tại sao dùng cả createdAt và id?
 *   - createdAt: cần thiết để sắp xếp theo thời gian.
 *   - id: cần thiết để phân biệt khi nhiều mục được tạo cùng một thời điểm.
 */

/**
 * 한국어: 커서에 담기는 데이터의 형태. 생성일시(createdAt)와 고유 ID(id)를 포함합니다.
 * Tiếng Việt: Cấu trúc dữ liệu chứa trong con trỏ. Bao gồm ngày tạo (createdAt) và ID duy nhất (id).
 */
export interface DateIdCursorPayload {
  createdAt: string;
  id: string;
}

/**
 * 한국어: {createdAt, id} 객체를 base64url 문자열로 변환합니다. (인코딩)
 *   예: {createdAt: "2024-01-01", id: "abc"} -> "eyJjcmVhdGVkQX..." 같은 문자열
 * Tiếng Việt: Chuyển đổi đối tượng {createdAt, id} thành chuỗi base64url. (mã hóa)
 *   Ví dụ: {createdAt: "2024-01-01", id: "abc"} -> chuỗi như "eyJjcmVhdGVkQX..."
 */
export function encodeDateIdCursor(payload: DateIdCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

/**
 * 한국어: base64url 문자열을 다시 {createdAt, id} 객체로 변환합니다. (디코딩)
 *   잘못된 형식이면 에러를 던집니다 (유효성 검증 포함).
 * Tiếng Việt: Chuyển đổi chuỗi base64url trở lại đối tượng {createdAt, id}. (giải mã)
 *   Nếu định dạng không hợp lệ sẽ ném lỗi (bao gồm kiểm tra tính hợp lệ).
 */
export function decodeDateIdCursor(cursor: string): DateIdCursorPayload {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
  const parsed = JSON.parse(decoded) as Partial<DateIdCursorPayload>;

  // 한국어: 유효성 검증 — createdAt과 id가 문자열인지, createdAt이 유효한 날짜인지 확인합니다.
  // Tiếng Việt: Kiểm tra tính hợp lệ — xác nhận createdAt và id là chuỗi, và createdAt là ngày hợp lệ.
  if (
    typeof parsed.createdAt !== 'string' ||
    typeof parsed.id !== 'string' ||
    Number.isNaN(Date.parse(parsed.createdAt))
  ) {
    throw new Error('Invalid cursor payload');
  }

  return {
    createdAt: parsed.createdAt,
    id: parsed.id,
  };
}
