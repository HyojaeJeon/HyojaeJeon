'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

// ─── Types ────────────────────────────────────────────
interface HoldOrder {
  id: string;
  holdTime: string;
  tableName: string;
  totalAmount: number;
  itemCount: number;
}

interface HoldOrderDetail {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface HoldOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onRestore?: (holdOrderId: string) => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_HOLD_ORDERS: HoldOrder[] = Array.from({ length: 5 }, (_, i) => ({
  id: `hold-${i + 1}`,
  holdTime: `14:${String(30 + i).padStart(2, '0')}`,
  tableName: `T-${String(i + 1).padStart(2, '0')}`,
  totalAmount: (i + 1) * 15000,
  itemCount: i + 2,
}));

const STUB_HOLD_DETAILS: Record<string, HoldOrderDetail[]> = {
  'hold-1': [
    { id: 'd-1', name: '아메리카노', quantity: 2, price: 4500 },
    { id: 'd-2', name: '카페라떼', quantity: 1, price: 5000 },
    { id: 'd-3', name: '치즈케이크', quantity: 1, price: 6000 },
  ],
};

// ─── HoldOrderDialog ──────────────────────────────────
export default function HoldOrderDialog({
  open,
  onClose,
  onRestore,
}: HoldOrderDialogProps) {
  const [holdOrders] = useState<HoldOrder[]>(STUB_HOLD_ORDERS);
  const [selectedHoldId, setSelectedHoldId] = useState<string | null>(null);
  const [details, setDetails] = useState<HoldOrderDetail[]>([]);

  const handleSelectHold = useCallback((holdId: string) => {
    setSelectedHoldId(holdId);
    // TODO: ORDER:GET_HOLD_LIST bridge call for detail
    // Stub: use local mock data
    setDetails(STUB_HOLD_DETAILS[holdId] ?? [
      { id: 'stub-1', name: '주문 항목 1', quantity: 1, price: 10000 },
      { id: 'stub-2', name: '주문 항목 2', quantity: 2, price: 8000 },
    ]);
  }, []);

  const handleRestore = useCallback(() => {
    if (!selectedHoldId) return;
    // TODO: ORDER:RESTORE_HOLD bridge call
    onRestore?.(selectedHoldId);
    onClose();
  }, [selectedHoldId, onRestore, onClose]);

  const handlePrint = useCallback(() => {
    // TODO: print hold order receipt via Device/Printer
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="보류 주문"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={handlePrint}>
            영수증인쇄
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleRestore}
            disabled={!selectedHoldId}
          >
            선택
          </Button>
        </>
      }
    >
      <div className="flex gap-3 h-full px-4 py-3 min-h-0">
        {/* Master: Hold order list */}
        <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr_100px_60px] gap-2 px-3 py-2 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            <span>시간</span>
            <span>테이블</span>
            <span className="text-right">금액</span>
            <span className="text-right">항목</span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {holdOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                보류된 주문이 없습니다
              </div>
            ) : (
              holdOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => handleSelectHold(order.id)}
                  className={`
                    w-full grid grid-cols-[80px_1fr_100px_60px] gap-2 px-3 py-2.5 text-xs cursor-pointer
                    transition-colors duration-fast text-left
                    ${selectedHoldId === order.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'}
                  `}
                >
                  <span className="tabular-nums">{order.holdTime}</span>
                  <span className="truncate">{order.tableName}</span>
                  <span className="text-right tabular-nums">{order.totalAmount.toLocaleString()}</span>
                  <span className="text-right tabular-nums">{order.itemCount}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail: Selected order items */}
        <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_60px_100px] gap-2 px-3 py-2 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            <span>항목</span>
            <span className="text-right">수량</span>
            <span className="text-right">가격</span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {!selectedHoldId ? (
              <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                보류 주문을 선택하세요
              </div>
            ) : details.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                주문 항목이 없습니다
              </div>
            ) : (
              details.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_60px_100px] gap-2 px-3 py-2.5 text-xs text-pos-text"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-right tabular-nums">{item.quantity}</span>
                  <span className="text-right tabular-nums">
                    {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
