'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import TextInput from '@shared/ui/atoms/TextInput';
import Badge from '@shared/ui/atoms/Badge';
import Button from '@shared/ui/atoms/Button';

/**
 * DeliveryManageDialog -- 배달 관리 메인 화면 (레거시 IDD_CUSTDELI)
 *
 * 고객 검색/등록, 배달 주문/결제, 배달원 지정, 배달 시작/완료,
 * 그릇 회수, 전표 인쇄 등 배달 업무 전체 라이프사이클 관리.
 *
 * Bridge Commands: DELIVERY:RECEIVE, DELIVERY:ASSIGN, DELIVERY:START,
 *   DELIVERY:COMPLETE, DELIVERY:SEARCH_ADDRESS, DELIVERY:PRINT_SLIP
 * UseCases: ReceiveDeliveryOrderUseCase, AssignDeliveryUseCase,
 *   StartDeliveryUseCase, CompleteDeliveryUseCase, etc.
 */

// ─── Types ───

interface CustomerInfo {
  name: string;
  phone: string;
  hphone: string;
  address: string;
  memo: string;
  code: string;
  point: number;
}

interface OrderItem {
  itemName: string;
  qty: number;
  price: number;
}

interface DeliveryOrder {
  orderId: string;
  custName: string;
  totalAmt: number;
  status: string;
  time: string;
}

interface DeliveryHistory {
  date: string;
  orderId: string;
  amount: number;
  status: string;
}

interface DeliveryManageDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub Data ───

const STUB_CUSTOMER: CustomerInfo = {
  name: '홍길동',
  phone: '02-1234-5678',
  hphone: '010-1234-5678',
  address: '서울시 강남구 테헤란로 123',
  memo: '현관 비밀번호 1234#',
  code: 'C001',
  point: 1500,
};

const STUB_ORDER_ITEMS: OrderItem[] = [
  { itemName: '짜장면', qty: 2, price: 14000 },
  { itemName: '짬뽕', qty: 1, price: 9000 },
  { itemName: '탕수육(소)', qty: 1, price: 18000 },
];

const STUB_TODAY_ORDERS: DeliveryOrder[] = [
  { orderId: 'D001', custName: '홍길동', totalAmt: 41000, status: 'DELIVERING', time: '12:30' },
  { orderId: 'D002', custName: '김철수', totalAmt: 23000, status: 'ASSIGNED', time: '12:45' },
  { orderId: 'D003', custName: '이영희', totalAmt: 15000, status: 'COMPLETED', time: '11:00' },
];

const STUB_HISTORY: DeliveryHistory[] = [
  { date: '2026-04-05', orderId: 'D001', amount: 41000, status: '배달중' },
  { date: '2026-04-04', orderId: 'D010', amount: 32000, status: '완료' },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  COMPLETED: 'success',
  DELIVERING: 'info',
  ASSIGNED: 'warning',
  PENDING: 'error',
};

// ─── Component ───

export default function DeliveryManageDialog({
  open,
  onClose,
}: DeliveryManageDialogProps) {
  const [customer, setCustomer] = useState<CustomerInfo>(STUB_CUSTOMER);
  const [orderItems] = useState<OrderItem[]>(STUB_ORDER_ITEMS);
  const [todayOrders] = useState<DeliveryOrder[]>(STUB_TODAY_ORDERS);
  const [deliveryHistory] = useState<DeliveryHistory[]>(STUB_HISTORY);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Summary
  const totalAmt = orderItems.reduce((s, i) => s + i.price, 0);
  const orderCount = todayOrders.length;
  const deliveryCount = todayOrders.filter((o) => o.status !== 'COMPLETED').length;

  // ─── Handlers ───

  const handleCustomerSearch = useCallback(() => {
    // TODO: Open CustomerSearchDialog
    console.log('[DeliveryManageDialog] open CustomerSearchDialog');
  }, []);

  const handleCustomerRegister = useCallback(() => {
    // TODO: Open CustomerRegistrationDialog
    console.log('[DeliveryManageDialog] open CustomerRegistrationDialog');
  }, []);

  const handleOrder = useCallback(async () => {
    // TODO: DELIVERY:RECEIVE Bridge command via RTK Query
    // - idempotencyKey: `DELIVERY:RECEIVE:<uuid>`
    console.log('[DeliveryManageDialog] DELIVERY:RECEIVE', { customer, orderItems });
  }, [customer, orderItems]);

  const handleAssignDriver = useCallback(async () => {
    if (!selectedOrderId) return;
    // TODO: DELIVERY:ASSIGN Bridge command
    // - idempotencyKey: `DELIVERY:ASSIGN:<uuid>`
    console.log('[DeliveryManageDialog] DELIVERY:ASSIGN', { orderId: selectedOrderId });
  }, [selectedOrderId]);

  const handleStartDelivery = useCallback(async () => {
    if (!selectedOrderId) return;
    // TODO: DELIVERY:START Bridge command
    // - idempotencyKey: `DELIVERY:START:<uuid>`
    console.log('[DeliveryManageDialog] DELIVERY:START', { orderId: selectedOrderId });
  }, [selectedOrderId]);

  const handleCompleteDelivery = useCallback(async () => {
    if (!selectedOrderId) return;
    // TODO: DELIVERY:COMPLETE Bridge command
    // - idempotencyKey: `DELIVERY:COMPLETE:<uuid>`
    // - params: { completeType: 'DELIVERED' }
    console.log('[DeliveryManageDialog] DELIVERY:COMPLETE', { orderId: selectedOrderId });
  }, [selectedOrderId]);

  const handleDishReturn = useCallback(async () => {
    if (!selectedOrderId) return;
    // TODO: DELIVERY:COMPLETE with completeType='DISH_RETURN'
    console.log('[DeliveryManageDialog] DELIVERY:COMPLETE (DISH_RETURN)', { orderId: selectedOrderId });
  }, [selectedOrderId]);

  const handleBatchComplete = useCallback(async () => {
    // TODO: DELIVERY:COMPLETE with completeType='BATCH' for all active
    console.log('[DeliveryManageDialog] DELIVERY:COMPLETE (BATCH)');
  }, []);

  const handleAddressSearch = useCallback(() => {
    // TODO: Open DeliveryAddressDialog
    console.log('[DeliveryManageDialog] open DeliveryAddressDialog');
  }, []);

  const handleMapView = useCallback(() => {
    // TODO: P2 - Open map (online only)
    console.log('[DeliveryManageDialog] open map view (online only)');
  }, []);

  const handlePrint = useCallback(async () => {
    // TODO: DELIVERY:PRINT_SLIP Bridge command (async post-commit)
    console.log('[DeliveryManageDialog] DELIVERY:PRINT_SLIP');
  }, []);

  const handleClearCustomer = useCallback(() => {
    setCustomer({ name: '', phone: '', hphone: '', address: '', memo: '', code: '', point: 0 });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const fmt = (n: number) => n.toLocaleString();

  // ─── Render ───

  return (
    <FullScreenPanel
      open={open}
      onClose={handleClose}
      title="배달 관리"
      footer={
        <Button variant="ghost" size="md" onClick={handleClose}>닫기</Button>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Top Bar */}
        <div className="shrink-0 flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleCustomerSearch}>고객찾기</Button>
          <Button variant="outline" size="sm" onClick={handleCustomerRegister}>고객등록/수정</Button>
          <div className="flex-1" />
          <span className="text-xs text-pos-text-muted">
            주문건수: {orderCount} | 배달건수: {deliveryCount} | 합계: {fmt(totalAmt)}
          </span>
        </div>

        {/* Main Content: 2 columns */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Left: Customer Info + Order Items + History */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {/* Customer Info */}
            <div className="grid grid-cols-[60px_1fr] gap-1 text-sm">
              <span className="text-pos-text-muted">고객명</span>
              <TextInput value={customer.name} onChange={(v) => setCustomer((p) => ({ ...p, name: v }))} />
              <span className="text-pos-text-muted">전화</span>
              <TextInput value={customer.phone} onChange={(v) => setCustomer((p) => ({ ...p, phone: v }))} />
              <span className="text-pos-text-muted">휴대폰</span>
              <TextInput value={customer.hphone} onChange={(v) => setCustomer((p) => ({ ...p, hphone: v }))} />
              <span className="text-pos-text-muted">주소</span>
              <div className="flex gap-1">
                <TextInput value={customer.address} onChange={(v) => setCustomer((p) => ({ ...p, address: v }))} fullWidth />
                <Button variant="ghost" size="sm" onClick={handleAddressSearch}>주소</Button>
                <Button variant="ghost" size="sm" onClick={handleMapView}>지도</Button>
              </div>
              <span className="text-pos-text-muted">메모</span>
              <div className="flex gap-1">
                <TextInput value={customer.memo} onChange={(v) => setCustomer((p) => ({ ...p, memo: v }))} fullWidth />
                <Button variant="ghost" size="sm" onClick={handleClearCustomer}>초기화</Button>
              </div>
            </div>
            <div className="text-xs text-pos-text-muted">
              코드: {customer.code} | 포인트: {fmt(customer.point)}
            </div>

            {/* Order Items Grid */}
            <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
              <div className="shrink-0 bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
                주문 메뉴
              </div>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-2 py-1 border-b border-pos-border">
                    <span className="text-sm text-pos-text">{item.itemName}</span>
                    <span className="text-sm text-pos-text tabular-nums">{item.qty}</span>
                    <span className="text-sm text-pos-text tabular-nums">{fmt(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery History Grid */}
            <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
              <div className="shrink-0 bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
                배달 이력
              </div>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {deliveryHistory.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between px-2 py-1 border-b border-pos-border">
                    <span className="text-xs text-pos-text-muted">{h.date}</span>
                    <span className="text-xs text-pos-text">{h.orderId}</span>
                    <span className="text-xs text-pos-text tabular-nums">{fmt(h.amount)}</span>
                    <span className="text-xs text-pos-text">{h.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex gap-1">
              <Button variant="ghost" size="sm" onClick={handlePrint}>리스트인쇄</Button>
              <Button variant="ghost" size="sm" onClick={handleDishReturn}>그릇회수</Button>
              <Button variant="ghost" size="sm" onClick={handleBatchComplete}>일괄완료</Button>
            </div>
          </div>

          {/* Right: Today Orders + Summary + Actions */}
          <div className="w-[220px] flex flex-col gap-2 min-h-0">
            {/* Today Orders Grid */}
            <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
              <div className="shrink-0 bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
                오늘 주문
              </div>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {todayOrders.map((order) => (
                  <div
                    key={order.orderId}
                    onClick={() => setSelectedOrderId(order.orderId)}
                    className={`flex items-center justify-between px-2 py-1 border-b border-pos-border cursor-pointer
                      ${selectedOrderId === order.orderId ? 'bg-primary-50' : 'active:bg-pos-surface'}
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs text-pos-text font-medium">{order.custName}</span>
                      <span className="text-xs text-pos-text-muted">{order.time}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-pos-text tabular-nums">{fmt(order.totalAmt)}</span>
                      <Badge variant={STATUS_VARIANT[order.status] ?? 'info'} size="sm">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="text-xs flex flex-col gap-1">
              <div className="flex justify-between"><span className="text-pos-text-muted">총액</span><span className="text-pos-text tabular-nums">{fmt(totalAmt)}</span></div>
              <div className="flex justify-between"><span className="text-pos-text-muted">할인합계</span><span className="text-pos-text tabular-nums">0</span></div>
              <div className="flex justify-between"><span className="text-pos-text-muted">수금금액</span><span className="text-pos-text tabular-nums">0</span></div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              <Button variant="primary" size="sm" onClick={handleOrder}>주문/결제</Button>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={handleAssignDriver} className="flex-1">배달원지정</Button>
                <Button variant="outline" size="sm" onClick={handleStartDelivery} className="flex-1">배달시작</Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleCompleteDelivery}>배달미수</Button>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
