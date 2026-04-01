'use client';

/**
 * OrderSidebar — HDS Organism
 * 주문 내역 + 상하 네비게이션 버튼 + 총액(VND) + 결제 버튼.
 * 스크롤 없이 버튼으로 탐색.
 */
export default function OrderSidebar({ orderItems, totalAmount, onCheckout, isLoading, scrollOffset = 0, onScrollUp, onScrollDown }) {
  const isCartEmpty = !orderItems || orderItems.length === 0;
  const visibleCount = 4;
  const offset = scrollOffset || 0;
  const visibleItems = isCartEmpty ? [] : orderItems.slice(offset, offset + visibleCount);
  const canUp = offset > 0;
  const canDown = !isCartEmpty && offset + visibleCount < orderItems.length;

  return (
    <aside className="w-[300px] h-full bg-white border-l border-gray-200 flex flex-col shrink-0">
      {/* Header */}
      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
        <h2 className="text-sm font-bold text-gray-900">주문 내역</h2>
        {!isCartEmpty && (
          <span className="text-[11px] font-semibold min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-soft-red-50 text-soft-red-500 rounded-full">
            {orderItems.length}
          </span>
        )}
      </div>

      {/* List Area with Up/Down nav */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Up Button */}
        <button
          type="button"
          onClick={onScrollUp}
          disabled={!canUp}
          className={`h-8 shrink-0 flex items-center justify-center border-b border-gray-50 transition-colors duration-100 ${canUp ? 'text-gray-500 active:bg-gray-100 cursor-pointer' : 'text-gray-200 cursor-default'}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* Visible Items */}
        <div className="flex-1 flex flex-col justify-start overflow-hidden">
          {isCartEmpty ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 px-6">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-gray-300">
                <path d="M7 7h1.5l2.8 11.2h8.4L22.5 7H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="23" r="1.5" fill="currentColor" />
                <circle cx="19" cy="23" r="1.5" fill="currentColor" />
              </svg>
              <p className="text-xs text-gray-400 text-center">메뉴를 선택해주세요</p>
            </div>
          ) : (
            <div className="p-3 space-y-1.5 flex-1">
              {visibleItems.map((item, idx) => (
                <div key={offset + idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400 tabular-nums">{item.price.toLocaleString()}₫ × {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-700 shrink-0 tabular-nums">
                    {(item.price * item.quantity).toLocaleString()}₫
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Down Button */}
        <button
          type="button"
          onClick={onScrollDown}
          disabled={!canDown}
          className={`h-8 shrink-0 flex items-center justify-center border-t border-gray-50 transition-colors duration-100 ${canDown ? 'text-gray-500 active:bg-gray-100 cursor-pointer' : 'text-gray-200 cursor-default'}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 shrink-0 space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-xs text-gray-500">총 결제 금액</span>
          <span className="text-xl font-extrabold text-soft-red-500 tabular-nums">
            {(totalAmount || 0).toLocaleString()}
            <span className="text-sm font-bold ml-0.5">₫</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isCartEmpty || isLoading}
          className={`w-full h-12 rounded-xl text-sm font-bold transition-transform duration-150 cursor-pointer ${
            isCartEmpty || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-soft-red-500 text-white active:scale-[0.98] shadow-pos-card'
          }`}
        >
          {isLoading ? '처리 중...' : '결제하기'}
        </button>
      </div>
    </aside>
  );
}
