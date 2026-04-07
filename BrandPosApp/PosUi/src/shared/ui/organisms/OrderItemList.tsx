'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderItemListProps {
  items: OrderItem[];
  onQuantityChange: (index: number, qty: number) => void;
  onRemove: (index: number) => void;
  emptyMessage?: string;
}

export default function OrderItemList({
  items,
  onQuantityChange,
  onRemove,
  emptyMessage,
}: OrderItemListProps) {
  const { t } = usePosI18n();
  const resolvedEmptyMessage = emptyMessage ?? t('common.emptyOrder');
  if (!items || items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-pos-text-muted">
          <path d="M7 7h1.5l2.8 11.2h8.4L22.5 7H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="23" r="1.5" fill="currentColor" />
          <circle cx="19" cy="23" r="1.5" fill="currentColor" />
        </svg>
        <p className="text-xs text-pos-text-muted text-center">{resolvedEmptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1.5" style={{ scrollbarWidth: 'none' }}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center bg-pos-surface rounded-pos-sm px-3 py-2.5 gap-2"
        >
          {/* Name + unit price */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-pos-text truncate">{item.name}</p>
            <p className="text-2xs text-pos-text-muted tabular-nums">
              {item.price.toLocaleString()}
            </p>
          </div>

          {/* Quantity stepper */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (item.quantity <= 1) {
                  onRemove(index);
                } else {
                  onQuantityChange(index, item.quantity - 1);
                }
              }}
              className="w-7 h-7 flex items-center justify-center rounded-pos-sm bg-pos-surface text-pos-text-secondary active:bg-gray-300 active:scale-[0.92] transition-transform duration-fast cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="w-7 text-center text-xs font-bold text-pos-text tabular-nums select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(index, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-pos-sm bg-pos-surface text-pos-text-secondary active:bg-gray-300 active:scale-[0.92] transition-transform duration-fast cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2.5v7M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-xs font-bold text-pos-text-secondary shrink-0 tabular-nums w-16 text-right">
            {(item.price * item.quantity).toLocaleString()}
          </span>

          {/* Remove */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-6 h-6 flex items-center justify-center rounded-pos-full text-pos-text-muted active:bg-primary-100 active:text-primary-500 active:scale-[0.9] transition-transform duration-fast cursor-pointer shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
