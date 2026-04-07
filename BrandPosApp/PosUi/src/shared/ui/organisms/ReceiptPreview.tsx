'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface ReceiptPreviewProps {
  storeName: string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  receiptNo: string;
  date: string;
  onPrint?: () => void;
}

/**
 * ReceiptPreview -- 영수증 미리보기 카드
 *
 * 열감지 영수증 스타일: 좁은 폭, 고정폭 숫자, 점선 구분.
 */
export default function ReceiptPreview({
  storeName,
  items,
  subtotal,
  discount = 0,
  tax = 0,
  total,
  receiptNo,
  date,
  onPrint,
}: ReceiptPreviewProps) {
  const { t } = usePosI18n();
  const fmt = (v: number) => v.toLocaleString('ko-KR');

  return (
    <div className="w-full max-w-[280px] mx-auto bg-pos-bg border border-pos-border rounded-pos-sm p-4 font-mono text-xs">
      {/* 매장명 */}
      <div className="text-center mb-3">
        <p className="text-md font-bold text-pos-text">{storeName}</p>
      </div>

      {/* 점선 구분 */}
      <div className="border-t border-dashed border-pos-border-strong my-2" />

      {/* 영수증 번호 / 날짜 */}
      <div className="flex justify-between text-2xs text-pos-text-muted mb-2">
        <span>No. {receiptNo}</span>
        <span>{date}</span>
      </div>

      {/* 점선 구분 */}
      <div className="border-t border-dashed border-pos-border-strong my-2" />

      {/* 항목 헤더 */}
      <div className="flex justify-between text-2xs text-pos-text-muted mb-1 px-0.5">
        <span className="flex-1">{t('common.item')}</span>
        <span className="w-8 text-center">{t('common.quantity')}</span>
        <span className="w-16 text-right">{t('common.amount')}</span>
      </div>

      {/* 항목 목록 */}
      <div className="space-y-0.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs text-pos-text px-0.5">
            <span className="flex-1 truncate">{item.name}</span>
            <span className="w-8 text-center tabular-nums">{item.qty}</span>
            <span className="w-16 text-right tabular-nums">{fmt(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      {/* 점선 구분 */}
      <div className="border-t border-dashed border-pos-border-strong my-2" />

      {/* 소계 */}
      <div className="flex justify-between text-xs text-pos-text">
        <span>{t('common.subtotal')}</span>
        <span className="tabular-nums">{fmt(subtotal)}</span>
      </div>

      {/* 할인 */}
      {discount > 0 && (
        <div className="flex justify-between text-xs text-pos-error">
          <span>{t('common.discount')}</span>
          <span className="tabular-nums">-{fmt(discount)}</span>
        </div>
      )}

      {/* 세금 */}
      {tax > 0 && (
        <div className="flex justify-between text-xs text-pos-text">
          <span>{t('common.tax')}</span>
          <span className="tabular-nums">{fmt(tax)}</span>
        </div>
      )}

      {/* 점선 구분 */}
      <div className="border-t border-dashed border-pos-border-strong my-2" />

      {/* 총합계 */}
      <div className="flex justify-between text-md font-bold text-pos-text">
        <span>{t('common.total')}</span>
        <span className="tabular-nums">{fmt(total)}</span>
      </div>

      {/* 인쇄 버튼 */}
      {onPrint && (
        <>
          <div className="border-t border-dashed border-pos-border-strong my-3" />
          <button
            type="button"
            onClick={onPrint}
            className="w-full h-touch rounded-pos-btn bg-primary-500 text-pos-text-inverse text-sm font-bold active:bg-primary-700 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
          >
            {t('common.print')}
          </button>
        </>
      )}
    </div>
  );
}
