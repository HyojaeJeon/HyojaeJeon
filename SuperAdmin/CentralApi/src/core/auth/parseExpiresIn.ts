/**
 * JWT expiresIn 문자열('1d', '24h', '3600' 등)을 초 단위 숫자로 변환합니다.
 * 지원 단위: s(초), m(분), h(시), d(일). 순수 숫자 문자열은 초로 해석합니다.
 * 파싱 실패 시 기본값 86400(24시간)을 반환합니다.
 *
 * Chuyển chuỗi expiresIn ('1d', '24h', '3600'...) thành số giây.
 * Đơn vị hỗ trợ: s, m, h, d. Chuỗi thuần số được hiểu là giây.
 * Nếu parse thất bại, trả về mặc định 86400 (24 giờ).
 */
export function parseExpiresIn(raw: string): number {
  const trimmed = raw.trim();

  // 순수 숫자 → 초 / Thuần số → giây
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const match = /^(\d+)([smhd])$/i.exec(trimmed);
  if (!match) {
    return 24 * 60 * 60;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 24 * 60 * 60;
    default:
      return 24 * 60 * 60;
  }
}
