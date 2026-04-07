'use client';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderSidebarProps {
  orderItems: OrderItem[];
  totalAmount: number;
  onCheckout: () => void;
  isLoading: boolean;
  scrollOffset?: number;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export default function OrderSidebar({ orderItems, totalAmount, onCheckout, isLoading, scrollOffset = 0, onScrollUp, onScrollDown }: OrderSidebarProps) {
  const isCartEmpty = !orderItems || orderItems.length === 0;
  const visibleCount = 4;
  const offset = scrollOffset || 0;
  const visibleItems = isCartEmpty ? [] : orderItems.slice(offset, offset + visibleCount);
  const canUp = offset > 0;
  const canDown = !isCartEmpty && offset + visibleCount < orderItems.length;

  return (
    <aside className="w-sidebar h-full bg-pos-bg border-l border-pos-border flex flex-col shrink-0">
      {/* Header */}
      <div className="h-header border-b border-pos-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-md font-bold text-pos-text">주문 내역</h2>
        {!isCartEmpty && (
          <span className="text-2xs font-semibold min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-primary-50 text-primary-500 rounded-pos-full">
            {orderItems.length}
          </span>
        )}
      </div>

      {/* List Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Up Button */}
        <button type="button" onClick={onScrollUp} disabled={!canUp}
          className={`h-8 shrink-0 flex items-center justify-center border-b border-pos-border transition-colors duration-fast ${canUp ? 'text-pos-text-secondary active:bg-gray-100 cursor-pointer' : 'text-pos-text-muted cursor-default'}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <div className="flex-1 flex flex-col justify-start overflow-hidden">
          {isCartEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-6">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-pos-text-muted">
                <path d="M7 7h1.5l2.8 11.2h8.4L22.5 7H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="23" r="1.5" fill="currentColor" /><circle cx="19" cy="23" r="1.5" fill="currentColor" />
              </svg>
              <p className="text-xs text-pos-text-muted text-center">메뉴를 선택해주세요</p>
            </div>
          ) : (
            <div className="p-3 space-y-1.5 flex-1">
              {visibleItems.map((item, idx) => (
                <div key={offset + idx} className="flex items-center justify-between bg-pos-surface rounded-pos-sm px-3 py-2.5">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs font-semibold text-pos-text truncate">{item.name}</p>
                    <p className="text-2xs text-pos-text-muted tabular-nums">{item.price.toLocaleString()}₫ × {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-pos-text-secondary shrink-0 tabular-nums">
                    {(item.price * item.quantity).toLocaleString()}₫
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Down Button */}
        <button type="button" onClick={onScrollDown} disabled={!canDown}
          className={`h-8 shrink-0 flex items-center justify-center border-t border-pos-border transition-colors duration-fast ${canDown ? 'text-pos-text-secondary active:bg-gray-100 cursor-pointer' : 'text-pos-text-muted cursor-default'}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-pos-border shrink-0 space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-xs text-pos-text-secondary">총 결제 금액</span>
          <span className="text-xl font-extrabold text-primary-500 tabular-nums">
            {(totalAmount || 0).toLocaleString()}<span className="text-md font-bold ml-0.5">₫</span>
          </span>
        </div>
        <button type="button" onClick={onCheckout} disabled={isCartEmpty || isLoading}
          className={`w-full h-touch rounded-pos-btn text-md font-bold transition-transform duration-normal cursor-pointer ${
            isCartEmpty || isLoading ? 'bg-pos-surface text-pos-text-muted cursor-not-allowed' : 'bg-primary-500 text-pos-text-inverse active:scale-[0.98] shadow-pos-card'
          }`}>
          {isLoading ? '처리 중...' : '결제하기'}
        </button>
      </div>
    </aside>
  );
}
