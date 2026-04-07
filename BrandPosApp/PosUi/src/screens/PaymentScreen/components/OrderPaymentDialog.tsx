'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import NumPad from '@shared/ui/molecules/NumPad';
import SummaryPanel from '@shared/ui/organisms/SummaryPanel';
import ChangeCalculator from '@shared/ui/specialized/ChangeCalculator';

// -------------------------------------------------------------------
// OrderPaymentDialog -- 주문+결제 통합 다이얼로그 (oracc-dialog.md)
//
// ORDER_DIALOG의 확장판: 메뉴 선택/주문/결제를 한 화면에서 처리.
// 즉시결제, 소규모 매장용 통합 흐름.
// -------------------------------------------------------------------

/** Stub types */
interface MenuItem {
  id: string;
  name: string;
  price: number;
  groupCode: string;
}

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface OrderPaymentDialogProps {
  tableCode: string;
  personCount: number;
  onClose: () => void;
}

// Stub menu groups
const MENU_GROUPS = [
  { code: 'GRP01', name: '메인' },
  { code: 'GRP02', name: '사이드' },
  { code: 'GRP03', name: '음료' },
  { code: 'GRP04', name: '디저트' },
  { code: 'GRP05', name: '주류' },
];

// Stub menu items
const STUB_MENU_ITEMS: MenuItem[] = [
  { id: 'M001', name: '불고기정식', price: 12000, groupCode: 'GRP01' },
  { id: 'M002', name: '비빔밥', price: 10000, groupCode: 'GRP01' },
  { id: 'M003', name: '된장찌개', price: 8000, groupCode: 'GRP01' },
  { id: 'M004', name: '콜라', price: 2000, groupCode: 'GRP03' },
  { id: 'M005', name: '공기밥', price: 1000, groupCode: 'GRP02' },
];

export default function OrderPaymentDialog({
  tableCode,
  personCount,
  onClose,
}: OrderPaymentDialogProps) {
  // -- Local state ---------------------------------------------------
  const [activeGroup, setActiveGroup] = useState<string>('GRP01');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [numpadValue, setNumpadValue] = useState<string>('0');
  const [menuPage, setMenuPage] = useState(0);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = 0;
  const netAmount = totalAmount - discountAmount;

  // -- Stub handlers -------------------------------------------------

  const handleAddItem = useCallback((menuItem: MenuItem) => {
    // TODO: ORDER:ADD_ITEM bridge command
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.id === menuItem.id);
      if (existing) {
        return prev.map((o) =>
          o.id === menuItem.id
            ? { ...o, qty: o.qty + 1, amount: (o.qty + 1) * o.unitPrice }
            : o
        );
      }
      return [...prev, {
        id: menuItem.id,
        name: menuItem.name,
        qty: 1,
        unitPrice: menuItem.price,
        amount: menuItem.price,
      }];
    });
    console.log('[OrderPaymentDialog] add item:', menuItem.id);
  }, []);

  const handleRemoveItem = useCallback(() => {
    if (!selectedLine) return;
    // TODO: ORDER:REMOVE_ITEM bridge command
    setOrderItems((prev) => prev.filter((o) => o.id !== selectedLine));
    setSelectedLine('');
    console.log('[OrderPaymentDialog] remove item:', selectedLine);
  }, [selectedLine]);

  const handleCancelAll = useCallback(() => {
    // TODO: ORDER:CANCEL bridge command
    setOrderItems([]);
    setSelectedLine('');
    console.log('[OrderPaymentDialog] cancel all');
  }, []);

  const handleOrderComplete = useCallback(() => {
    // TODO: ORDER:COMPLETE bridge command
    console.log('[OrderPaymentDialog] order complete');
  }, []);

  const handleCashPayment = useCallback(() => {
    // TODO: PAYMENT:CASH bridge command
    console.log('[OrderPaymentDialog] cash payment', { amount: netAmount, received: receivedAmount });
  }, [netAmount, receivedAmount]);

  const handleCardPayment = useCallback(() => {
    // TODO: PAYMENT:CARD bridge command (synchronous-wait)
    console.log('[OrderPaymentDialog] card payment', { amount: netAmount });
  }, [netAmount]);

  const handlePaymentComplete = useCallback(() => {
    // TODO: PAYMENT:EXECUTE bridge command
    console.log('[OrderPaymentDialog] payment complete');
  }, []);

  const handlePaymentReset = useCallback(() => {
    // TODO: PAYMENT:VOID bridge command
    setReceivedAmount(0);
    console.log('[OrderPaymentDialog] payment reset');
  }, []);

  const handleDiscount = useCallback(() => {
    // TODO: ORDER:APPLY_DISCOUNT bridge command
    console.log('[OrderPaymentDialog] apply discount');
  }, []);

  const handleService = useCallback(() => {
    // TODO: ORDER:APPLY_SERVICE bridge command
    console.log('[OrderPaymentDialog] apply service');
  }, []);

  const handleDecreaseQty = useCallback(() => {
    if (!selectedLine) return;
    // TODO: ORDER:MODIFY_QTY bridge command (qty - 1)
    setOrderItems((prev) =>
      prev
        .map((o) =>
          o.id === selectedLine
            ? { ...o, qty: o.qty - 1, amount: (o.qty - 1) * o.unitPrice }
            : o
        )
        .filter((o) => o.qty > 0)
    );
    console.log('[OrderPaymentDialog] decrease qty');
  }, [selectedLine]);

  const handlePrintOrder = useCallback(() => {
    // TODO: ORDER:PRINT bridge command (printType: "kitchen")
    console.log('[OrderPaymentDialog] print order');
  }, []);

  const handlePrintReceipt = useCallback(() => {
    // TODO: SALES:REPRINT bridge command (printType: "receipt")
    console.log('[OrderPaymentDialog] print receipt');
  }, []);

  const handleKitchenMemo = useCallback(() => {
    // TODO: ORDER:SET_KITCHEN_MEMO bridge command
    console.log('[OrderPaymentDialog] kitchen memo');
  }, []);

  const filteredMenuItems = STUB_MENU_ITEMS.filter((m) => m.groupCode === activeGroup);

  // -- Render --------------------------------------------------------
  return (
    <div className="flex flex-col w-full h-full bg-pos-surface">
      {/* Header */}
      <header className="h-header flex items-center justify-between px-4 bg-pos-bg border-b border-pos-border shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-primary-500">{tableCode}</span>
          <span className="text-md text-pos-text-secondary">{personCount}명</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrintOrder}>주문인쇄</Button>
          <Button variant="ghost" size="sm" onClick={handlePrintReceipt}>영수증</Button>
          <Button variant="danger" size="sm" onClick={onClose}>닫기</Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: order list + summary */}
        <div className="flex flex-col w-[40%] border-r border-pos-border">
          {/* Order item list */}
          <div className="flex-1 overflow-auto">
            {orderItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-md text-pos-text-muted">
                메뉴를 선택해주세요
              </div>
            ) : (
              orderItems.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedLine(item.id)}
                  className={`
                    w-full flex justify-between items-center px-3 py-2 text-sm
                    border-b border-pos-border cursor-pointer select-none
                    ${selectedLine === item.id ? 'bg-primary-50' : 'bg-pos-bg'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-pos-text-secondary w-5">{idx + 1}</span>
                    <span className="font-medium text-pos-text">{item.name}</span>
                    <span className="text-pos-text-secondary">x{item.qty}</span>
                  </div>
                  <span className="font-semibold text-pos-text tabular-nums">
                    {item.amount.toLocaleString('ko-KR')}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="p-3 border-t border-pos-border shrink-0 bg-pos-bg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-pos-text-secondary">총매출액</span>
              <span className="font-semibold tabular-nums">{totalAmount.toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-pos-text-secondary">할인금액</span>
              <span className="font-semibold text-pos-error tabular-nums">-{discountAmount.toLocaleString('ko-KR')}</span>
            </div>
            <div className="border-t border-pos-border my-1" />
            <div className="flex justify-between text-md">
              <span className="font-bold">주문금액</span>
              <span className="font-bold text-primary-500 tabular-nums">{netAmount.toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-pos-text-secondary">받은금액</span>
              <span className="font-semibold tabular-nums">{receivedAmount.toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-pos-text-secondary">거스름돈</span>
              <span className={`font-bold tabular-nums ${receivedAmount - netAmount >= 0 ? 'text-primary-500' : 'text-pos-error'}`}>
                {(receivedAmount - netAmount).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: menu grid + action buttons */}
        <div className="flex flex-col w-[60%]">
          {/* Menu group tabs */}
          <div className="flex gap-1 px-3 py-2 bg-pos-bg border-b border-pos-border overflow-auto shrink-0">
            {MENU_GROUPS.map((g) => (
              <button
                key={g.code}
                type="button"
                onClick={() => { setActiveGroup(g.code); setMenuPage(0); }}
                className={`
                  px-3 py-1 rounded-pos-btn text-xs font-semibold whitespace-nowrap
                  select-none cursor-pointer active:scale-[0.95]
                  ${activeGroup === g.code
                    ? 'bg-primary-500 text-white'
                    : 'bg-pos-bg text-pos-text border border-pos-border'}
                `}
              >
                {g.name}
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setMenuPage(Math.max(0, menuPage - 1))}>{'<'}</Button>
            <Button variant="ghost" size="sm" onClick={() => setMenuPage(menuPage + 1)}>{'>'}</Button>
          </div>

          {/* Menu item grid (5x5) */}
          <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-5 gap-2">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddItem(item)}
                  className="
                    flex flex-col items-center justify-center gap-1
                    h-touch-xl rounded-pos-btn
                    bg-pos-bg border border-pos-border
                    text-xs font-medium text-pos-text
                    select-none cursor-pointer active:scale-[0.95]
                    active:bg-primary-50 transition-transform duration-fast
                  "
                >
                  <span className="truncate px-1">{item.name}</span>
                  <span className="text-2xs text-pos-text-muted tabular-nums">
                    {item.price.toLocaleString('ko-KR')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom action buttons */}
          <div className="grid grid-cols-6 gap-1 p-2 border-t border-pos-border shrink-0">
            <Button variant="secondary" size="sm" onClick={handleCashPayment}>현금</Button>
            <Button variant="secondary" size="sm" onClick={handleCardPayment}>카드</Button>
            <Button variant="secondary" size="sm" onClick={handlePaymentComplete}>결제완료</Button>
            <Button variant="secondary" size="sm" onClick={handlePaymentReset}>결제초기화</Button>
            <Button variant="secondary" size="sm" onClick={handleRemoveItem}>개별취소</Button>
            <Button variant="danger" size="sm" onClick={handleCancelAll}>전체취소</Button>
          </div>
          <div className="grid grid-cols-6 gap-1 px-2 pb-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleDiscount}>할인</Button>
            <Button variant="ghost" size="sm" onClick={handleService}>서비스</Button>
            <Button variant="ghost" size="sm" onClick={handleDecreaseQty}>수량-1</Button>
            <Button variant="ghost" size="sm" onClick={handleKitchenMemo}>주방메모</Button>
            <Button variant="ghost" size="sm" onClick={handleOrderComplete}>주문완료</Button>
            <Button variant="ghost" size="sm" onClick={() => {
              // TODO: PAYMENT:EXECUTE (기타결제)
              console.log('[OrderPaymentDialog] etc payment');
            }}>기타결제</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
