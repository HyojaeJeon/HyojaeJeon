'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGetTablesQuery, useGetMenuQuery } from '@store/api/index';
import TableCard from '../../../design-system/organisms/TableCard';
import MenuCard from '../../../design-system/organisms/MenuCard';
import OrderSidebar from '../../../design-system/organisms/OrderSidebar';
import TakeoutBar from '../../../design-system/organisms/TakeoutBar';

/* ─── Nav Button (large, visible, touch-friendly) ─── */
function NavBtn({ children, disabled, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center cursor-pointer select-none
        transition-colors duration-100 rounded-lg
        ${disabled ? 'opacity-30 cursor-default bg-gray-50' : 'bg-gray-100 active:bg-gray-200'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/* ─── SVG Icons (larger, bolder) ─── */
const IconLeft = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconRight = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconUp = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M4 13l6-6 6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconDown = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M4 7l6 6 6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default function ScreenPreviewClient({ slug }) {
  if (slug === 'table') return <TableScreenPreview />;
  if (slug === 'order') return <OrderScreenPreview />;
  if (slug === 'payment') return <PaymentScreenPreview />;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
      <p className="text-sm text-gray-400">준비 중입니다.</p>
    </div>
  );
}

/* ═══════════════════════════
   TABLE SCREEN
   ═══════════════════════════ */
function TableScreenPreview() {
  const { data, isLoading } = useGetTablesQuery();
  const [activeTab, setActiveTab] = useState('hall');
  const tables = data?.tables || [];

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center bg-pos-surface"><p className="text-sm text-gray-400">불러오는 중...</p></div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-pos-surface">
      <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
        <h1 className="text-base font-bold text-gray-900">테이블 관리</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 tabular-nums">{tables.length}개 테이블</span>
          <div className="w-2 h-2 rounded-full bg-pos-success" />
        </div>
      </header>
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-4 gap-3 h-full" style={{ gridTemplateRows: 'repeat(3, 1fr)' }}>
          {tables.slice(0, 12).map((t) => (
            <TableCard key={t.id} table={t} onClick={() => {}} />
          ))}
        </div>
      </div>
      <TakeoutBar activeTab={activeTab} onTabSelect={setActiveTab} counts={{ takeout: 1, delivery: 3 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ORDER SCREEN
   Layout: [Menu Area] [Nav Column 56px] [Sidebar 300px]
   Nav Column groups ALL arrows on the right side.
   ═══════════════════════════════════════════════ */
function OrderScreenPreview() {
  const { data } = useGetMenuQuery();

  /* ─ Category state ─ */
  const categories = data?.categories || [];
  const [activeCatId, setActiveCatId] = useState('C1');
  const [catOffset, setCatOffset] = useState(0);
  const visibleCatCount = 7;
  const visibleCats = categories.slice(catOffset, catOffset + visibleCatCount);
  const canCatLeft = catOffset > 0;
  const canCatRight = catOffset + visibleCatCount < categories.length;

  /* ─ Menu pagination (5×4 = 20/page) ─ */
  const allItems = data?.items || [];
  const catItems = allItems.filter((i) => i.categoryId === activeCatId);
  const [menuPage, setMenuPage] = useState(0);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(catItems.length / itemsPerPage);
  const pageItems = catItems.slice(menuPage * itemsPerPage, (menuPage + 1) * itemsPerPage);
  const canPageUp = menuPage > 0;
  const canPageDown = menuPage + 1 < totalPages;

  /* ─ Cart state (interactive) ─ */
  const [cart, setCart] = useState([
    { name: '김치찌개', price: 150000, quantity: 2 },
    { name: '제육볶음', price: 190000, quantity: 1 },
    { name: '콜라', price: 35000, quantity: 2 },
  ]);
  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const [orderOffset, setOrderOffset] = useState(0);

  const orderVisibleCount = 5;

  const handleAddToCart = useCallback((menuId) => {
    const menuItem = allItems.find((m) => m.id === menuId);
    if (!menuItem || menuItem.isSoldOut) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.name === menuItem.name);
      if (existing) return prev.map((c) => c.name === menuItem.name ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { name: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  }, [allItems]);

  // 새 아이템 추가 시 마지막 페이지로 자동 이동
  const prevCartLen = useRef(cart.length);
  useEffect(() => {
    if (cart.length > prevCartLen.current && cart.length > orderVisibleCount) {
      setOrderOffset(Math.max(0, cart.length - orderVisibleCount));
    }
    prevCartLen.current = cart.length;
  }, [cart.length]);

  const handleCatSelect = (catId) => { setActiveCatId(catId); setMenuPage(0); };

  const orderVisible = cart.slice(orderOffset, orderOffset + orderVisibleCount);
  const canOrderPrev = orderOffset > 0;
  const canOrderNext = orderOffset + orderVisibleCount < cart.length;

  return (
    <div className="w-full h-full flex flex-col bg-white">

      {/* ═══ Header — FULL WIDTH (메뉴 + 주문내역 모두 포함) ═══ */}
      <header className="h-12 bg-white border-b border-gray-100 flex items-center shrink-0">
        <div className="flex items-center px-5 flex-1 min-w-0">
          <button type="button" className="text-gray-400 mr-3 cursor-pointer active:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-sm font-bold text-gray-900">테이블 1번</h1>
        </div>
        <div className="w-[300px] shrink-0 flex items-center px-4 border-l border-gray-100 h-full">
          <h2 className="text-sm font-bold text-gray-900">주문 내역</h2>
          {cart.length > 0 && (
            <span className="text-[11px] font-semibold min-w-[20px] h-5 flex items-center justify-center px-1.5 bg-soft-red-50 text-soft-red-500 rounded-full ml-2">
              {cart.length}
            </span>
          )}
          {/* 주문내역 < > 페이지 버튼 */}
          <div className="ml-auto flex gap-1">
            <NavBtn disabled={!canOrderPrev} onClick={() => setOrderOffset((o) => Math.max(0, o - orderVisibleCount))} className="w-8 h-8">
              <IconLeft size={16} color={canOrderPrev ? '#374151' : '#D1D5DB'} />
            </NavBtn>
            <NavBtn disabled={!canOrderNext} onClick={() => setOrderOffset((o) => Math.min(cart.length - orderVisibleCount, o + orderVisibleCount))} className="w-8 h-8">
              <IconRight size={16} color={canOrderNext ? '#374151' : '#D1D5DB'} />
            </NavBtn>
          </div>
        </div>
      </header>

      {/* ═══ Body — 좌측(카테고리+그리드+네비) | 우측(주문내역) ═══ */}
      <div className="flex-1 flex min-h-0">

        {/* ── Left: Category + Grid + Nav ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Category Bar + [<][>] */}
          <div className="h-12 flex shrink-0 border-b border-gray-100">
            <div className="flex-1 flex items-center px-2 gap-1.5 min-w-0 bg-white">
              {visibleCats.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCatSelect(cat.id)}
                  className={`
                    flex-1 h-9 flex items-center justify-center
                    text-[12px] font-semibold rounded-lg
                    transition-colors duration-100 cursor-pointer select-none truncate px-2
                    ${activeCatId === cat.id
                      ? 'bg-soft-red-500 text-white'
                      : 'text-gray-500 bg-gray-50 active:bg-gray-100'}
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="border-l border-gray-100 bg-gray-50" style={{ width: 56 }}>
              <NavBtn disabled={!canCatLeft} onClick={() => setCatOffset((o) => Math.max(0, o - 1))} className="w-full h-full rounded-none">
                <IconLeft size={20} color={canCatLeft ? '#374151' : '#D1D5DB'} />
              </NavBtn>
            </div>
            <div className="border-l border-gray-100 bg-gray-50" style={{ width: 56 }}>
              <NavBtn disabled={!canCatRight} onClick={() => setCatOffset((o) => Math.min(categories.length - visibleCatCount, o + 1))} className="w-full h-full rounded-none">
                <IconRight size={20} color={canCatRight ? '#374151' : '#D1D5DB'} />
              </NavBtn>
            </div>
          </div>

          {/* Menu Grid + ▲▼ nav */}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 p-1 overflow-hidden bg-pos-surface min-w-0">
              <div className="grid grid-cols-5 gap-1 h-full" style={{ gridTemplateRows: 'repeat(4, 1fr)' }}>
                {pageItems.map((menu) => (
                  <MenuCard key={menu.id} menu={menu} onAdd={handleAddToCart} />
                ))}
                {Array.from({ length: Math.max(0, itemsPerPage - pageItems.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50" />
                ))}
              </div>
            </div>
            <div className="shrink-0 bg-gray-50 border-l border-r border-gray-100 flex flex-col" style={{ width: 56 }}>
              <NavBtn disabled={!canPageUp} onClick={() => setMenuPage((p) => p - 1)} className="flex-1 rounded-none">
                <IconUp size={22} color={canPageUp ? '#374151' : '#D1D5DB'} />
              </NavBtn>
              <div className="h-8 flex items-center justify-center shrink-0 bg-white border-y border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                  {totalPages > 0 ? `${menuPage + 1}/${totalPages}` : '-'}
                </span>
              </div>
              <NavBtn disabled={!canPageDown} onClick={() => setMenuPage((p) => p + 1)} className="flex-1 rounded-none">
                <IconDown size={22} color={canPageDown ? '#374151' : '#D1D5DB'} />
              </NavBtn>
            </div>
          </div>
        </div>

        {/* ── Right: Order area (300px) — 헤더 바로 아래부터 아이템 표시 ── */}
        <div className="w-[300px] shrink-0 bg-white border-l border-gray-200 flex flex-col">
          {/* Items — 최대 5개, 헤더 < >로 페이지 전환 */}
          <div className="flex-1 overflow-hidden">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 px-6">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-gray-300">
                  <path d="M7 7h1.5l2.8 11.2h8.4L22.5 7H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="23" r="1.5" fill="currentColor" /><circle cx="19" cy="23" r="1.5" fill="currentColor" />
                </svg>
                <p className="text-xs text-gray-400 text-center">메뉴를 선택해주세요</p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {orderVisible.map((item, idx) => (
                  <div key={orderOffset + idx} className="bg-gray-50 rounded-xl px-3 py-2">
                    {/* Row 1: 아이템명 + 합계 */}
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-900 truncate flex-1 min-w-0 mr-2">{item.name}</p>
                      <span className="text-xs font-bold text-gray-900 shrink-0 tabular-nums">{(item.price * item.quantity).toLocaleString()}₫</span>
                    </div>
                    {/* Row 2: 단가 + 수량 증감 */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 tabular-nums">{item.price.toLocaleString()}₫</span>
                      <div className="flex items-center shrink-0">
                        <button type="button" onClick={() => setCart((prev) => {
                          const q = prev.find(c => c.name === item.name)?.quantity;
                          if (q <= 1) return prev.filter(c => c.name !== item.name);
                          return prev.map(c => c.name === item.name ? { ...c, quantity: c.quantity - 1 } : c);
                        })} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-bold cursor-pointer active:bg-gray-100">−</button>
                        <span className="text-sm font-bold text-gray-900 w-8 text-center tabular-nums">{item.quantity}</span>
                        <button type="button" onClick={() => setCart((prev) => prev.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c))}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-bold cursor-pointer active:bg-gray-100">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total + Pay */}
          <div className="p-4 border-t border-gray-100 shrink-0 space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs text-gray-500">총 결제 금액</span>
              <span className="text-xl font-extrabold text-soft-red-500 tabular-nums">{totalAmount.toLocaleString()}<span className="text-sm font-bold ml-0.5">₫</span></span>
            </div>
            <button type="button" onClick={() => alert('결제!')} disabled={cart.length === 0}
              className={`w-full h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-transform duration-150 cursor-pointer ${cart.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-soft-red-500 text-white active:scale-[0.98] shadow-pos-card'}`}>
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════
   PAYMENT SCREEN
   ═══════════════════════════ */
function PaymentScreenPreview() {
  const orderItems = [
    { name: '삼겹살', qty: 2, price: 530000 },
    { name: '된장찌개', qty: 2, price: 300000 },
    { name: '김치전', qty: 1, price: 150000 },
    { name: '소주', qty: 3, price: 285000 },
    { name: '콜라', qty: 2, price: 70000 },
    { name: '공기밥', qty: 4, price: 80000 },
    { name: '계란말이', qty: 1, price: 115000 },
  ];
  const total = orderItems.reduce((s, i) => s + i.price, 0);

  return (
    <div className="w-full h-full flex bg-white">
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-12 bg-white border-b border-gray-100 flex items-center px-5 shrink-0">
          <button type="button" className="text-gray-400 mr-3 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-sm font-bold text-gray-900">결제 · 테이블 3번</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
          <p className="text-xs text-gray-400 mb-1">받을 금액</p>
          <p className="text-4xl font-extrabold text-soft-red-500 tabular-nums mb-6">
            {total.toLocaleString()}<span className="text-lg ml-1">₫</span>
          </p>
          <div className="grid grid-cols-3 gap-2 w-full max-w-[400px] mb-5">
            {[
              { label: '현금', sub: 'Cash' },
              { label: '카드', sub: 'Card' },
              { label: '포인트', sub: 'Points' },
              { label: '쿠폰', sub: 'Coupon' },
              { label: '할인', sub: 'Discount' },
              { label: '복합결제', sub: 'Split' },
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                className="h-12 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center cursor-pointer active:scale-[0.97] active:bg-gray-100 transition-transform duration-100"
              >
                <span className="text-xs font-bold text-gray-900">{m.label}</span>
                <span className="text-[9px] text-gray-400">{m.sub}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1.5 w-full max-w-[400px]">
            {['1','2','3','C','4','5','6','←','7','8','9','00','','0','000','OK'].map((key, i) => (
              <button
                key={i}
                type="button"
                disabled={key === ''}
                className={`h-10 rounded-xl text-xs font-semibold cursor-pointer active:scale-[0.97] transition-transform duration-100 ${
                  key === 'OK'
                    ? 'bg-soft-red-500 text-white'
                    : key === 'C'
                      ? 'bg-warm-yellow-50 text-warm-yellow-700 border border-warm-yellow-100'
                      : key === ''
                        ? 'invisible'
                        : 'bg-gray-50 text-gray-700 border border-gray-100'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
      <aside className="w-[280px] h-full bg-pos-surface border-l border-gray-100 flex flex-col shrink-0">
        <div className="h-12 flex items-center px-4 border-b border-gray-100 shrink-0">
          <h3 className="text-xs font-bold text-gray-900">주문 상세</h3>
        </div>
        <div className="flex-1 p-3 space-y-0.5 overflow-hidden">
          {orderItems.map((item) => (
            <div key={item.name} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-xs text-gray-700">{item.name}</p>
                <p className="text-[10px] text-gray-400 tabular-nums">×{item.qty}</p>
              </div>
              <span className="text-xs font-semibold text-gray-900 tabular-nums">{item.price.toLocaleString()}₫</span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">합계</span>
            <span className="text-lg font-extrabold text-gray-900 tabular-nums">{total.toLocaleString()}₫</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
