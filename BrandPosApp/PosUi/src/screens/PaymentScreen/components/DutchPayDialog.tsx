'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// -------------------------------------------------------------------
// DutchPayDialog -- 할인/세일 관리 (saledc.md)
//
// 주문 항목에 할인을 적용/취소하는 팝업.
// 할인명, 상세내용, 타입, 상태, 금액을 표시.
// 주문 항목별 할인 적용 대상을 그리드로 관리.
//
// 신규 구조: PaymentScreen 내부 할인 설정 패널/모달로 통합.
// -------------------------------------------------------------------

interface DiscountItem {
  id: string;
  name: string;
  detail: string;
  type: string;
  status: string;
  amount: number;
}

interface OrderItemForDiscount {
  id: string;
  name: string;
  qty: number;
  amount: number;
  discountApplied: boolean;
}

interface DutchPayDialogProps {
  open: boolean;
  onClose: () => void;
  tableId: string;
}

// Stub data
const STUB_DISCOUNTS: DiscountItem[] = [
  { id: 'DC01', name: '직원할인', detail: '10% 할인', type: '정률', status: '활성', amount: 0 },
  { id: 'DC02', name: '단체할인', detail: '5,000원 할인', type: '정액', status: '활성', amount: 5000 },
  { id: 'DC03', name: '이벤트할인', detail: '특별 이벤트', type: '정률', status: '비활성', amount: 0 },
];

const STUB_ORDER_ITEMS: OrderItemForDiscount[] = [
  { id: 'O1', name: '불고기정식', qty: 2, amount: 24000, discountApplied: false },
  { id: 'O2', name: '된장찌개', qty: 1, amount: 8000, discountApplied: false },
  { id: 'O3', name: '공기밥', qty: 3, amount: 3000, discountApplied: false },
];

export default function DutchPayDialog({
  open,
  onClose,
  tableId,
}: DutchPayDialogProps) {
  const [selectedDiscount, setSelectedDiscount] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItemForDiscount[]>(STUB_ORDER_ITEMS);

  const handleSaveDiscount = useCallback(() => {
    // TODO: PAYMENT:APPLY_DISCOUNT bridge command
    console.log('[DutchPayDialog] save discount:', selectedDiscount, 'for table:', tableId);
  }, [selectedDiscount, tableId]);

  const handleRegisterDiscount = useCallback(() => {
    // TODO: PAYMENT:APPLY_DISCOUNT bridge command (register new)
    console.log('[DutchPayDialog] register discount');
  }, []);

  const handleCancelDiscount = useCallback(() => {
    // TODO: PAYMENT:APPLY_DISCOUNT bridge command (cancel)
    setSelectedDiscount('');
    console.log('[DutchPayDialog] cancel discount');
  }, []);

  const toggleItemDiscount = useCallback((itemId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, discountApplied: !item.discountApplied } : item
      )
    );
  }, []);

  const fmt = (v: number) => v.toLocaleString('ko-KR');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="할인/세일 관리"
      size="lg"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSaveDiscount}>저장</Button>
          <Button variant="secondary" size="md" onClick={handleCancelDiscount}>취소/삭제</Button>
          <Button variant="ghost" size="md" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Discount info display */}
        {selectedDiscount && (() => {
          const dc = STUB_DISCOUNTS.find((d) => d.id === selectedDiscount);
          return dc ? (
            <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-pos-card border border-pos-border">
              <div className="flex justify-between text-sm">
                <span className="text-pos-text-secondary">할인명</span>
                <span className="font-semibold text-pos-text">{dc.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-pos-text-secondary">상세</span>
                <span className="text-pos-text">{dc.detail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-pos-text-secondary">타입</span>
                <span className="text-pos-text">{dc.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-pos-text-secondary">상태</span>
                <span className="text-pos-text">{dc.status}</span>
              </div>
              {dc.amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-pos-text-secondary">금액</span>
                  <span className="font-bold text-pos-error tabular-nums">-{fmt(dc.amount)}원</span>
                </div>
              )}
            </div>
          ) : null;
        })()}

        {/* Discount list (IDC_GRID) */}
        <div>
          <div className="text-xs text-pos-text-muted mb-2 font-semibold">할인 목록</div>
          <div className="border border-pos-border rounded-pos-card overflow-hidden">
            {STUB_DISCOUNTS.map((dc) => (
              <button
                key={dc.id}
                type="button"
                onClick={() => setSelectedDiscount(dc.id)}
                className={`
                  w-full flex justify-between items-center px-3 py-2 text-sm
                  border-b border-pos-border cursor-pointer select-none
                  ${selectedDiscount === dc.id ? 'bg-primary-50' : 'bg-pos-bg'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-pos-text">{dc.name}</span>
                  <span className="text-xs text-pos-text-muted">({dc.type})</span>
                </div>
                <span className={`text-xs ${dc.status === '활성' ? 'text-primary-500' : 'text-pos-text-muted'}`}>
                  {dc.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Discount target grid (IDC_GRID2) -- order items for discount application */}
        <div>
          <div className="text-xs text-pos-text-muted mb-2 font-semibold">할인 적용 대상</div>
          <div className="border border-pos-border rounded-pos-card overflow-hidden">
            <div className="grid grid-cols-[1fr_3fr_1fr_2fr_1fr] gap-1 px-3 py-1 bg-gray-100 text-xs font-semibold text-pos-text-secondary">
              <span>No</span>
              <span>메뉴명</span>
              <span className="text-center">수량</span>
              <span className="text-right">금액</span>
              <span className="text-center">적용</span>
            </div>
            {orderItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItemDiscount(item.id)}
                className="w-full grid grid-cols-[1fr_3fr_1fr_2fr_1fr] gap-1 px-3 py-2 text-sm border-b border-pos-border cursor-pointer select-none active:bg-primary-50"
              >
                <span className="text-pos-text-secondary">{idx + 1}</span>
                <span className="text-pos-text">{item.name}</span>
                <span className="text-center text-pos-text tabular-nums">{item.qty}</span>
                <span className="text-right text-pos-text tabular-nums">{fmt(item.amount)}</span>
                <span className="text-center">
                  {item.discountApplied ? (
                    <span className="text-primary-500 font-bold">V</span>
                  ) : (
                    <span className="text-pos-text-muted">-</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Register button (hidden, conditional on settings) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRegisterDiscount}
          className="self-start"
        >
          {/* TODO: conditional display based on INI feature flag */}
          할인 등록
        </Button>
      </div>
    </Modal>
  );
}
