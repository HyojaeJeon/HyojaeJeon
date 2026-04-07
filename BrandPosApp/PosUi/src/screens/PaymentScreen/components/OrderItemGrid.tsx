'use client';

// -------------------------------------------------------------------
// OrderItemGrid -- 주문 항목 그리드 (MFCGridCtrl 대체)
// 주문된 메뉴 항목의 이름, 수량, 단가, 금액을 테이블 형태로 표시
// -------------------------------------------------------------------

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface OrderItemGridProps {
  items: OrderItem[];
  selectedItemId?: string;
  onSelectItem?: (id: string) => void;
}

export default function OrderItemGrid({
  items,
  selectedItemId,
  onSelectItem,
}: OrderItemGridProps) {
  const fmt = (v: number) => v.toLocaleString('ko-KR');

  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_3fr_1fr_2fr_2fr] gap-1 px-3 py-2 bg-gray-100 text-xs font-semibold text-pos-text-secondary border-b border-pos-border shrink-0">
        <span>No</span>
        <span>메뉴명</span>
        <span className="text-center">수량</span>
        <span className="text-right">단가</span>
        <span className="text-right">금액</span>
      </div>

      {/* Body rows */}
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-md text-pos-text-muted">
          주문 항목이 없습니다
        </div>
      ) : (
        items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem?.(item.id)}
            className={`
              grid grid-cols-[1fr_3fr_1fr_2fr_2fr] gap-1 px-3 py-2 text-sm
              border-b border-pos-border cursor-pointer select-none
              active:bg-primary-50 transition-colors duration-fast
              ${selectedItemId === item.id ? 'bg-primary-50' : 'bg-pos-bg'}
            `}
          >
            <span className="text-pos-text-secondary">{idx + 1}</span>
            <span className="text-pos-text font-medium truncate">{item.name}</span>
            <span className="text-center text-pos-text tabular-nums">{item.qty}</span>
            <span className="text-right text-pos-text-secondary tabular-nums">{fmt(item.unitPrice)}</span>
            <span className="text-right text-pos-text font-semibold tabular-nums">{fmt(item.amount)}</span>
          </button>
        ))
      )}
    </div>
  );
}
