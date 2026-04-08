'use client';

// -------------------------------------------------------------------
// PaymentVNExtension -- 베트남 로케일 고유 확장
// account-dialog-vn.md 참조
//
// 통합 안내: PaymentScreen (index.tsx)은 KR/VN 로케일 통합 화면이다.
// 이 컴포넌트는 VN 로케일 전용 UI 차이를 캡슐화한다:
// - VND 통화 포맷 (소수점 없음, 천 단위 구분자 '.')
// - 베트남 VAT 규정 기반 세금 표시
// - VN 로케일 라벨 (PosUi/src/i18n/locales/vi/payment.json)
// -------------------------------------------------------------------

interface PaymentVNExtensionProps {
  locale: string;
  totalAmount: number;
  vatAmount?: number;
}

/**
 * VND 통화 포맷: 소수점 없음, 천 단위 구분자 '.'
 */
function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN');
}

export default function PaymentVNExtension({
  locale,
  totalAmount,
  vatAmount = 0,
}: PaymentVNExtensionProps) {
  // Only render VN-specific elements when locale is 'vi'
  if (locale !== 'vi') return null;

  return (
    <div className="flex flex-col gap-1 p-2 bg-yellow-50 rounded-pos-card border border-yellow-200">
      <div className="text-xs font-semibold text-yellow-800">VN</div>

      {/* VND formatted total */}
      <div className="flex justify-between items-center">
        {/* TODO: replace with i18n key payment.total from vi locale */}
        <span className="text-xs text-yellow-700">Tong cong</span>
        <span className="text-sm font-bold text-yellow-900 tabular-nums">
          {formatVND(totalAmount)} VND
        </span>
      </div>

      {/* VAT display per Vietnam regulations */}
      {vatAmount > 0 && (
        <div className="flex justify-between items-center">
          {/* TODO: replace with i18n key payment.vat from vi locale */}
          <span className="text-xs text-yellow-700">VAT</span>
          <span className="text-xs text-yellow-900 tabular-nums">
            {formatVND(vatAmount)} VND
          </span>
        </div>
      )}
    </div>
  );
}
