'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import TextInput from '@shared/ui/atoms/TextInput';
import Button from '@shared/ui/atoms/Button';

/**
 * DeliveryManageV2Dialog -- 배달 주문+메뉴 선택 통합 화면 (레거시 IDD_CUSTDELI2)
 *
 * 고객 정보 + 메뉴 그룹 탭(10개) + 메뉴 버튼 그리드(5x5) + 주문 수량 조작
 * + 할인/서비스 + 착석/포장/배달 3종 주문 확정.
 * 80개 UI 요소를 가진 가장 복잡한 고객/배달 화면.
 *
 * Bridge Commands: DELIVERY:RECEIVE (orderType: TABLE|PACK|DELIVERY),
 *   DELIVERY:PRINT_SLIP, DELIVERY:SEARCH_ADDRESS
 * UseCases: ReceiveDeliveryOrderUseCase, PrintDeliverySlipUseCase,
 *   SearchDeliveryAddressUseCase
 */

// ─── Types ───

interface CustomerInfo {
  name: string;
  phone: string;
  hphone: string;
  address: string;
  memo: string;
  orderMemo: string;
}

interface MenuGroup {
  id: string;
  name: string;
}

interface MenuItem {
  code: string;
  name: string;
  price: number;
  groupId: string;
}

interface OrderItem {
  code: string;
  name: string;
  qty: number;
  price: number;
  unitPrice: number;
}

interface DeliveryHistory {
  date: string;
  orderId: string;
  amount: number;
  status: string;
}

type OrderType = 'TABLE' | 'PACK' | 'DELIVERY';

interface DeliveryManageV2DialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub Data ───

const STUB_GROUPS: MenuGroup[] = Array.from({ length: 10 }, (_, i) => ({
  id: `G${i + 1}`,
  name: `그룹${i + 1}`,
}));

const STUB_MENUS: MenuItem[] = Array.from({ length: 25 }, (_, i) => ({
  code: `M${String(i + 1).padStart(3, '0')}`,
  name: `메뉴${i + 1}`,
  price: (i + 1) * 1000,
  groupId: 'G1',
}));

const STUB_HISTORY: DeliveryHistory[] = [
  { date: '2026-04-05 12:30', orderId: 'D001', amount: 41000, status: '배달중' },
  { date: '2026-04-05 11:00', orderId: 'D002', amount: 23000, status: '완료' },
];

const PAY_TYPES = ['현금', '카드', '외상', '기타'];

// ─── Component ───

export default function DeliveryManageV2Dialog({
  open,
  onClose,
}: DeliveryManageV2DialogProps) {
  // Customer info
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '', phone: '', hphone: '', address: '', memo: '', orderMemo: '',
  });

  // Menu navigation
  const [activeGroupId, setActiveGroupId] = useState('G1');
  const [groupPage, setGroupPage] = useState(0);
  const [menuPage, setMenuPage] = useState(0);

  // Order state (local)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderIdx, setSelectedOrderIdx] = useState<number | null>(null);
  const [payType, setPayType] = useState('현금');

  // History
  const [history] = useState<DeliveryHistory[]>(STUB_HISTORY);

  // ─── Computed ───

  const visibleGroups = STUB_GROUPS.slice(groupPage * 10, (groupPage + 1) * 10);
  const filteredMenus = STUB_MENUS.filter((m) => m.groupId === activeGroupId);
  const pagedMenus = filteredMenus.slice(menuPage * 25, (menuPage + 1) * 25);

  const totalAmt = orderItems.reduce((s, i) => s + i.price, 0);
  const dcAmt = 0; // TODO: discount calculation
  const orderAmt = totalAmt - dcAmt;

  // ─── Menu Handlers ───

  const handleSelectMenu = useCallback((menu: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.findIndex((o) => o.code === menu.code);
      if (existing >= 0) {
        return prev.map((o, i) =>
          i === existing ? { ...o, qty: o.qty + 1, price: o.unitPrice * (o.qty + 1) } : o
        );
      }
      return [...prev, { code: menu.code, name: menu.name, qty: 1, price: menu.price, unitPrice: menu.price }];
    });
  }, []);

  const handleQtyAdd = useCallback(() => {
    if (selectedOrderIdx === null) return;
    setOrderItems((prev) =>
      prev.map((o, i) =>
        i === selectedOrderIdx ? { ...o, qty: o.qty + 1, price: o.unitPrice * (o.qty + 1) } : o
      )
    );
  }, [selectedOrderIdx]);

  const handleQtySub = useCallback(() => {
    if (selectedOrderIdx === null) return;
    setOrderItems((prev) =>
      prev.map((o, i) =>
        i === selectedOrderIdx && o.qty > 1
          ? { ...o, qty: o.qty - 1, price: o.unitPrice * (o.qty - 1) }
          : o
      )
    );
  }, [selectedOrderIdx]);

  const handleCancelAll = useCallback(() => {
    setOrderItems([]);
    setSelectedOrderIdx(null);
  }, []);

  const handleCancelOne = useCallback(() => {
    if (selectedOrderIdx === null) return;
    setOrderItems((prev) => prev.filter((_, i) => i !== selectedOrderIdx));
    setSelectedOrderIdx(null);
  }, [selectedOrderIdx]);

  // ─── Order Confirm Handlers ───

  const handleConfirmOrder = useCallback(async (orderType: OrderType) => {
    if (orderItems.length === 0) return;
    // TODO: DELIVERY:RECEIVE Bridge command via RTK Query useReceiveDeliveryOrderMutation
    // - idempotencyKey: `DELIVERY:RECEIVE:<uuid>`
    // - params: { custCode, orderType, items, totalAmt, dcAmt, payType, memo, orderMemo }
    console.log('[DeliveryManageV2Dialog] DELIVERY:RECEIVE', { orderType, customer, orderItems, totalAmt, payType });
  }, [customer, orderItems, totalAmt, payType]);

  const handleDiscount = useCallback(() => {
    // TODO: P1 - open discount dialog / apply discount
    console.log('[DeliveryManageV2Dialog] discount');
  }, []);

  const handleService = useCallback(() => {
    // TODO: P1 - apply service (free item)
    console.log('[DeliveryManageV2Dialog] service');
  }, []);

  const handlePrint = useCallback(async () => {
    // TODO: DELIVERY:PRINT_SLIP Bridge command (async post-commit)
    console.log('[DeliveryManageV2Dialog] DELIVERY:PRINT_SLIP');
  }, []);

  const handleCustomerSearch = useCallback(() => {
    // TODO: Open CustomerSearchDialog
    console.log('[DeliveryManageV2Dialog] open CustomerSearchDialog');
  }, []);

  const handleCustomerRegister = useCallback(() => {
    // TODO: Open CustomerRegistrationDialog
    console.log('[DeliveryManageV2Dialog] open CustomerRegistrationDialog');
  }, []);

  const handleAddressSearch = useCallback(() => {
    // TODO: Open DeliveryAddressDialog
    console.log('[DeliveryManageV2Dialog] open DeliveryAddressDialog');
  }, []);

  const handleMapView = useCallback(() => {
    // TODO: P2 - open map (online only)
    console.log('[DeliveryManageV2Dialog] map view');
  }, []);

  const fmt = (n: number) => n.toLocaleString();

  // ─── Render ───

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="배달 주문"
      footer={
        <Button variant="ghost" size="md" onClick={onClose}>닫기</Button>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-2 text-sm">
        {/* Top Bar */}
        <div className="shrink-0 flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleCustomerSearch}>고객찾기</Button>
          <Button variant="outline" size="sm" onClick={handleCustomerRegister}>고객등록/수정</Button>
          <div className="flex-1" />
          <select
            value={payType}
            onChange={(e) => setPayType(e.target.value)}
            className="h-touch px-2 text-sm rounded-pos-input border border-pos-border bg-pos-bg text-pos-text"
          >
            {PAY_TYPES.map((pt) => <option key={pt} value={pt}>{pt}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={handlePrint}>주문인쇄</Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-2 min-h-0">
          {/* Left: Customer + Order Grid + History */}
          <div className="w-[200px] flex flex-col gap-2 shrink-0 min-h-0">
            {/* Customer */}
            <div className="flex flex-col gap-1">
              <TextInput value={customer.name} onChange={(v) => setCustomer((p) => ({ ...p, name: v }))} placeholder="고객명" fullWidth />
              <TextInput value={customer.phone} onChange={(v) => setCustomer((p) => ({ ...p, phone: v }))} placeholder="전화" fullWidth />
              <TextInput value={customer.hphone} onChange={(v) => setCustomer((p) => ({ ...p, hphone: v }))} placeholder="휴대폰" fullWidth />
              <div className="flex gap-1">
                <TextInput value={customer.address} onChange={(v) => setCustomer((p) => ({ ...p, address: v }))} placeholder="주소" fullWidth />
                <Button variant="ghost" size="sm" onClick={handleAddressSearch}>주소</Button>
              </div>
              <TextInput value={customer.memo} onChange={(v) => setCustomer((p) => ({ ...p, memo: v }))} placeholder="메모" fullWidth />
              <textarea
                value={customer.orderMemo}
                onChange={(e) => setCustomer((p) => ({ ...p, orderMemo: e.target.value }))}
                placeholder="주문비고"
                rows={2}
                className="w-full px-2 py-1 text-sm rounded-pos-input border border-pos-border bg-pos-bg text-pos-text resize-none"
              />
            </div>

            {/* Order Items Grid */}
            <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
              <div className="shrink-0 bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
                주문
              </div>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {orderItems.map((item, idx) => (
                  <div
                    key={item.code}
                    onClick={() => setSelectedOrderIdx(idx)}
                    className={`flex items-center justify-between px-2 py-1 border-b border-pos-border cursor-pointer
                      ${selectedOrderIdx === idx ? 'bg-primary-50' : ''}
                    `}
                  >
                    <span className="text-pos-text truncate">{item.name}</span>
                    <span className="text-pos-text tabular-nums">{item.qty}</span>
                    <span className="text-pos-text tabular-nums">{fmt(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="shrink-0 border border-pos-border rounded-pos-sm overflow-hidden">
              <div className="bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
                배달 이력
              </div>
              <div className="max-h-[60px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {history.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between px-2 py-1 border-b border-pos-border">
                    <span className="text-xs text-pos-text-muted">{h.date}</span>
                    <span className="text-xs text-pos-text tabular-nums">{fmt(h.amount)}</span>
                    <span className="text-xs text-pos-text">{h.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Menu Groups + Menu Grid + Actions */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {/* Menu Group Tabs */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setGroupPage((p) => Math.max(0, p - 1))}
                className="w-6 h-6 rounded-pos-sm bg-pos-surface border border-pos-border text-xs cursor-pointer active:scale-[0.95]"
              >
                &#x25B2;
              </button>
              <div className="flex-1 flex gap-1 overflow-hidden">
                {visibleGroups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => { setActiveGroupId(g.id); setMenuPage(0); }}
                    className={`flex-1 h-touch rounded-pos-btn text-xs font-semibold cursor-pointer active:scale-[0.95] border
                      ${activeGroupId === g.id
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-pos-surface text-pos-text border-pos-border'
                      }
                    `}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setGroupPage((p) => p + 1)}
                className="w-6 h-6 rounded-pos-sm bg-pos-surface border border-pos-border text-xs cursor-pointer active:scale-[0.95]"
              >
                &#x25BC;
              </button>
            </div>

            {/* Menu Button Grid (5x5) */}
            <div className="grid grid-cols-5 gap-1 flex-1">
              {Array.from({ length: 25 }, (_, i) => {
                const menu = pagedMenus[i];
                return menu ? (
                  <button
                    key={menu.code}
                    type="button"
                    onClick={() => handleSelectMenu(menu)}
                    className="h-touch rounded-pos-btn bg-pos-surface border border-pos-border text-xs text-pos-text cursor-pointer active:bg-primary-50 active:scale-[0.95] truncate px-1"
                  >
                    {menu.name}
                  </button>
                ) : (
                  <div key={i} className="h-touch" />
                );
              })}
            </div>

            {/* Menu Pagination */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMenuPage((p) => Math.max(0, p - 1))}>
                이전
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMenuPage((p) => p + 1)}>
                다음
              </Button>
            </div>

            {/* Amount Summary */}
            <div className="shrink-0 flex items-center justify-between text-xs px-2">
              <span>총금액: {fmt(totalAmt)}</span>
              <span>할인: {fmt(dcAmt)}</span>
              <span className="font-bold">주문액: {fmt(orderAmt)}</span>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 flex flex-wrap gap-1">
              <Button variant="ghost" size="sm" onClick={handleQtyAdd}>수량+1</Button>
              <Button variant="ghost" size="sm" onClick={handleQtySub}>수량-1</Button>
              {/* TODO: P1 - 주문메모 */}
              <Button variant="ghost" size="sm" onClick={handleCancelAll}>전체취소</Button>
              <Button variant="ghost" size="sm" onClick={handleCancelOne}>개별취소</Button>
              <Button variant="ghost" size="sm" onClick={handleDiscount}>할인</Button>
              <Button variant="ghost" size="sm" onClick={handleService}>서비스</Button>
              {/* TODO: P1 - 세트메뉴(더블), P2 - 부가세전환, 상품교환 */}
            </div>

            {/* Order Confirm Buttons */}
            <div className="shrink-0 flex gap-1">
              <Button variant="outline" size="md" onClick={() => handleConfirmOrder('TABLE')} className="flex-1">
                착석주문
              </Button>
              <Button variant="outline" size="md" onClick={() => handleConfirmOrder('PACK')} className="flex-1">
                포장주문
              </Button>
              <Button variant="primary" size="md" onClick={() => handleConfirmOrder('DELIVERY')} className="flex-1">
                배달주문완료
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
