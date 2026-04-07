'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Button from '@shared/ui/atoms/Button';
import Badge from '@shared/ui/atoms/Badge';
import MenuCard from '@shared/ui/organisms/MenuCard';
import Stepper from '@shared/ui/molecules/Stepper';
import Chip from '@shared/ui/molecules/Chip';
import MemoDialog from '@shared/ui/organisms/MemoDialog';
import Modal from '@shared/ui/organisms/Modal';
import { usePosI18n } from '@i18n/PosI18nProvider';
import { useSetPosShell } from '@shared/layout/PosShellContext';

// ─── Types ────────────────────────────────────────────
interface MenuGroup { id: string; name: string; }
interface MenuOption { id: string; name: string; price?: number; }
interface MenuItem { id: string; name: string; price: number; options?: MenuOption[]; [key: string]: unknown; }
interface OrderItem { id: string; name: string; price: number; quantity: number; discountAmount?: number; isService?: boolean; isPacking?: boolean; selectedOptions?: Record<string, number>; cookingMemo?: string; }

// ─── Stub (실제 음식명) ──────────────────────────────
const GROUPS: MenuGroup[] = [
  { id: 'set', name: 'SET' },
  { id: 'topping', name: 'Topping' },
  { id: 'noodle', name: '면류 (Mì)' },
  { id: 'rice', name: '밥류 (Cơm)' },
  { id: 'soup', name: '탕/찌개' },
  { id: 'stir-fry', name: '볶음 (Xào)' },
  { id: 'fried', name: '튀김 (Rán)' },
  { id: 'side', name: '사이드' },
  { id: 'drink', name: '음료' },
  { id: 'alcohol', name: '주류' },
];

const MENU_DATA: Record<string, MenuItem[]> = {
  set: [
    { id: 's1', name: 'Set bò (소고기세트)', price: 500000 },
    { id: 's2', name: 'Set heo (돼지세트)', price: 200000 },
    { id: 's3', name: 'Set gà (치킨세트)', price: 150000 },
    { id: 's4', name: 'Set hải sản (해산물세트)', price: 350000 },
    { id: 's5', name: 'Set gia đình (가족세트)', price: 650000 },
    { id: 's6', name: 'Set đôi (커플세트)', price: 400000 },
  ],
  topping: [
    { id: 't1', name: 'Trứng thêm (계란추가)', price: 10000 },
    { id: 't2', name: 'Phô mai (치즈추가)', price: 15000 },
    { id: 't3', name: 'Thịt bò thêm (소고기추가)', price: 40000 },
    { id: 't4', name: 'Nấm thêm (버섯추가)', price: 12000 },
    { id: 't5', name: 'Rau thêm (야채추가)', price: 8000 },
    { id: 't6', name: 'Cơm thêm (공기밥추가)', price: 5000 },
    { id: 't7', name: 'Kimchi thêm (김치추가)', price: 8000 },
    { id: 't8', name: 'Hành thêm (파추가)', price: 5000 },
  ],
  noodle: [
    { id: 'n1', name: 'Mì tonkotsu (돈코츠라멘)', price: 120000 },
    { id: 'n2', name: 'Mì cay (매운라멘)', price: 130000 },
    { id: 'n3', name: 'Japchae (잡채)', price: 90000 },
    { id: 'n4', name: 'Phở bò (소고기쌀국수)', price: 85000 },
    { id: 'n5', name: 'Bún bò Huế (분보후에)', price: 95000 },
    { id: 'n6', name: 'Mì Quảng (미꽝)', price: 80000 },
    { id: 'n7', name: 'Naengmyeon (냉면)', price: 100000 },
    { id: 'n8', name: 'Kalguksu (칼국수)', price: 85000 },
    { id: 'n9', name: 'Jjajangmyeon (짜장면)', price: 75000 },
    { id: 'n10', name: 'Jjamppong (짬뽕)', price: 85000 },
    { id: 'n11', name: 'Mì tương đen (짜장면VN)', price: 70000 },
    { id: 'n12', name: 'Udon (우동)', price: 90000 },
  ],
  rice: [
    { id: 'r1', name: 'Cơm chiên kimchi (김치볶음밥)', price: 80000 },
    { id: 'r2', name: 'Bibimbap (비빔밥)', price: 95000 },
    { id: 'r3', name: 'Cơm cuộn (김밥)', price: 50000 },
    { id: 'r4', name: 'Cơm sườn (돈까스덮밥)', price: 110000 },
    { id: 'r5', name: 'Cơm chiên (볶음밥)', price: 70000 },
    { id: 'r6', name: 'Cơm trộn HQ (한국비빔밥)', price: 100000 },
    { id: 'r7', name: 'Cơm cá (생선구이덮밥)', price: 120000 },
    { id: 'r8', name: 'Omurice (오므라이스)', price: 90000 },
    { id: 'r9', name: 'Donburi (덮밥)', price: 100000 },
  ],
  soup: [
    { id: 'sp1', name: 'Kimchi jjigae (김치찌개)', price: 85000 },
    { id: 'sp2', name: 'Doenjang (된장찌개)', price: 80000 },
    { id: 'sp3', name: 'Sundubu (순두부찌개)', price: 85000 },
    { id: 'sp4', name: 'Budae jjigae (부대찌개)', price: 110000 },
    { id: 'sp5', name: 'Samgyetang (삼계탕)', price: 180000 },
    { id: 'sp6', name: 'Galbitang (갈비탕)', price: 150000 },
    { id: 'sp7', name: 'Seolleongtang (설렁탕)', price: 100000 },
    { id: 'sp8', name: 'Canh kim chi (김치국)', price: 60000 },
    { id: 'sp9', name: 'Lẩu HQ (한국식샤브)', price: 200000 },
    { id: 'sp10', name: 'Yukgaejang (육개장)', price: 95000 },
  ],
  'stir-fry': [
    { id: 'sf1', name: 'Dak galbi (닭갈비)', price: 130000 },
    { id: 'sf2', name: 'Tteokbokki (떡볶이)', price: 60000 },
    { id: 'sf3', name: 'Jeyuk bokkeum (제육볶음)', price: 100000 },
    { id: 'sf4', name: 'Ojingeo bokkeum (오징어볶음)', price: 110000 },
    { id: 'sf5', name: 'Bò xào (소고기볶음)', price: 120000 },
    { id: 'sf6', name: 'Gà xào sả ớt (레몬그라스닭볶음)', price: 100000 },
    { id: 'sf7', name: 'Rau xào (야채볶음)', price: 50000 },
    { id: 'sf8', name: 'Mực xào (오징어볶음VN)', price: 130000 },
  ],
  fried: [
    { id: 'f1', name: 'Gà rán HQ (한국치킨)', price: 180000 },
    { id: 'f2', name: 'Gà rán cay (양념치킨)', price: 190000 },
    { id: 'f3', name: 'Tonkatsu (돈까스)', price: 110000 },
    { id: 'f4', name: 'Tôm tempura (새우튀김)', price: 90000 },
    { id: 'f5', name: 'Mandu chiên (군만두)', price: 60000 },
    { id: 'f6', name: 'Khoai tây chiên (감자튀김)', price: 45000 },
    { id: 'f7', name: 'Cá chiên (생선까스)', price: 100000 },
    { id: 'f8', name: 'Nem rán (스프링롤)', price: 50000 },
    { id: 'f9', name: 'Gà bắp ngô (콘치킨)', price: 150000 },
  ],
  side: [
    { id: 'sd1', name: 'Bánh xèo (전)', price: 80000 },
    { id: 'sd2', name: 'Pajeon (파전)', price: 70000 },
    { id: 'sd3', name: 'Haemul pajeon (해물파전)', price: 100000 },
    { id: 'sd4', name: 'Gỏi cuốn (월남쌈)', price: 40000 },
    { id: 'sd5', name: 'Gyeranmari (계란말이)', price: 50000 },
    { id: 'sd6', name: 'Salad HQ (한국샐러드)', price: 45000 },
    { id: 'sd7', name: 'Đậu phụ chiên (두부구이)', price: 40000 },
    { id: 'sd8', name: 'Eomuk (어묵)', price: 35000 },
  ],
  drink: [
    { id: 'd1', name: 'Coca Cola', price: 20000 },
    { id: 'd2', name: 'Sprite', price: 20000 },
    { id: 'd3', name: 'Nước cam (오렌지주스)', price: 35000 },
    { id: 'd4', name: 'Trà đá (아이스티)', price: 15000 },
    { id: 'd5', name: 'Cà phê đá (아이스커피)', price: 30000 },
    { id: 'd6', name: 'Nước suối (생수)', price: 10000 },
    { id: 'd7', name: 'Trà xanh (녹차)', price: 25000 },
    { id: 'd8', name: 'Sinh tố (스무디)', price: 40000 },
    { id: 'd9', name: 'Sữa đậu nành (두유)', price: 20000 },
    { id: 'd10', name: 'Nước chanh (레몬에이드)', price: 30000 },
  ],
  alcohol: [
    { id: 'a1', name: 'Bia Saigon (사이공맥주)', price: 25000 },
    { id: 'a2', name: 'Bia Tiger', price: 30000 },
    { id: 'a3', name: 'Soju (소주)', price: 80000 },
    { id: 'a4', name: 'Makgeolli (막걸리)', price: 70000 },
    { id: 'a5', name: 'Rượu vang (와인)', price: 200000 },
    { id: 'a6', name: 'Sake (사케)', price: 150000 },
    { id: 'a7', name: 'Bia Huda', price: 20000 },
    { id: 'a8', name: 'Bia 333', price: 22000 },
    { id: 'a9', name: 'Highball (하이볼)', price: 90000 },
  ],
};

// ─── Menu options (일부 메뉴에 옵션 부여) ──────────────
const DEFAULT_BEVERAGE_OPTIONS: MenuOption[] = [
  { id: 'hot', name: 'HOT' },
  { id: 'ice', name: 'ICE' },
  { id: 'shot', name: '1샷 추가', price: 500 },
  { id: 'syrup', name: '시럽 추가', price: 300 },
  { id: 'whip', name: '휘핑', price: 500 },
  { id: 'sugar', name: '설탕 X' },
  { id: 'milk', name: '저지방우유', price: 500 },
  { id: 'deca', name: '디카페인', price: 500 },
];

// SET 카테고리 공통 옵션 (최소 6개)
const DEFAULT_SET_OPTIONS: MenuOption[] = [
  { id: 'set-rice', name: '공기밥 추가', price: 2000 },
  { id: 'set-soup', name: '국물 추가', price: 3000 },
  { id: 'set-side', name: '사이드 추가', price: 5000 },
  { id: 'set-drink', name: '음료 추가', price: 3000 },
  { id: 'set-spicy', name: '맵기 조절' },
  { id: 'set-salt', name: '덜 짜게' },
  { id: 'set-nogarlic', name: '마늘 X' },
  { id: 'set-takeout-box', name: '포장 박스', price: 1000 },
];

const MENU_OPTIONS: Record<string, MenuOption[]> = {
  // SET 전 항목에 공통 옵션 부여
  ...Object.fromEntries((MENU_DATA.set ?? []).map((m) => [m.id, DEFAULT_SET_OPTIONS])),
  // 음료 전체에 기본 옵션 부여
  ...Object.fromEntries((MENU_DATA.drink ?? []).map((m) => [m.id, DEFAULT_BEVERAGE_OPTIONS])),
  // 주류 일부
  a1: [
    { id: 'chilled', name: '차갑게' },
    { id: 'cup', name: '컵추가' },
  ],
  // 면류 일부
  n2: [
    { id: 'spicy-low', name: '덜 맵게' },
    { id: 'spicy-high', name: '더 맵게' },
    { id: 'extra-noodle', name: '면 추가', price: 3000 },
  ],
};

const getMenus = (gid: string): MenuItem[] =>
  (MENU_DATA[gid] ?? []).map((m) => (MENU_OPTIONS[m.id] ? { ...m, options: MENU_OPTIONS[m.id] } : m));

const getMenuOptions = (itemId: string): MenuOption[] => MENU_OPTIONS[itemId] ?? [];

// ─── Component ────────────────────────────────────────
export default function OrderScreen() {
  const { t } = usePosI18n();
  useSetPosShell({
    domain: t('order.header'),
    screen: `T-09 · HAM · ${t('order.peopleCount')} 2`,
    onMenu: () => {},
    onClose: () => {},
  });
  const [groupId, setGroupId] = useState(GROUPS[0].id);
  const [menuPage, setMenuPage] = useState(0);
  const [dineItems, setDineItems] = useState<OrderItem[]>([]);
  const [deliveryItems, setDeliveryItems] = useState<OrderItem[]>([]);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<'dine' | 'delivery'>('dine');
  const items = tab === 'dine' ? dineItems : deliveryItems;
  const setItems = tab === 'dine' ? setDineItems : setDeliveryItems;
  useEffect(() => { setSelIdx(null); }, [tab]);
  const [optPage, setOptPage] = useState(0);
  const [memoOpen, setMemoOpen] = useState(false);
  useEffect(() => { setOptPage(0); }, [selIdx, tab]);
  const OPT_PER_PAGE = 6;

  // 선택된 주문 아이템의 옵션 (없으면 빈 배열)
  const selectedOrderItem = selIdx != null ? items[selIdx] : null;
  const currentOptions: MenuOption[] = selectedOrderItem ? getMenuOptions(selectedOrderItem.id) : [];
  const optTotalPages = Math.max(1, Math.ceil(currentOptions.length / OPT_PER_PAGE));
  const safeOptPage = Math.min(optPage, optTotalPages - 1);
  const visibleOptions = currentOptions.slice(safeOptPage * OPT_PER_PAGE, (safeOptPage + 1) * OPT_PER_PAGE);
  const hasOptionPager = currentOptions.length > OPT_PER_PAGE;
  const canPrevOpt = hasOptionPager && safeOptPage > 0;
  const canNextOpt = hasOptionPager && safeOptPage < optTotalPages - 1;

  const toggleOption = (optId: string) => {
    if (selIdx == null) return;
    setItems((prev) => {
      const u = [...prev];
      const cur = u[selIdx];
      const map = { ...(cur.selectedOptions ?? {}) };
      if (map[optId]) delete map[optId]; else map[optId] = 1;
      u[selIdx] = { ...cur, selectedOptions: map };
      return u;
    });
  };

  const setOptionQty = (itemIdx: number, optId: string, qty: number) => {
    setItems((prev) => {
      const u = [...prev];
      const cur = u[itemIdx];
      const map = { ...(cur.selectedOptions ?? {}) };
      if (qty <= 0) delete map[optId]; else map[optId] = qty;
      u[itemIdx] = { ...cur, selectedOptions: map };
      return u;
    });
  };

  const [optQtyTarget, setOptQtyTarget] = useState<{ itemIdx: number; optId: string } | null>(null);

  // 주문 리스트 스크롤 힌트
  const orderScrollRef = useRef<HTMLDivElement>(null);
  const [scrollHint, setScrollHint] = useState<{ top: boolean; bottom: boolean }>({ top: false, bottom: false });
  const updateScrollHint = () => {
    const el = orderScrollRef.current;
    if (!el) return;
    const top = el.scrollTop > 2;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
    setScrollHint((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }));
  };
  useLayoutEffect(() => { updateScrollHint(); }, [items, tab]);
  useEffect(() => {
    const el = orderScrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => updateScrollHint());
    ro.observe(el);
    // 내부 자식 사이즈 변경도 감지
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [items.length]);

  // ── category paging ──
  const catRef = useRef<HTMLDivElement>(null);
  const [catPage, setCatPage] = useState(0);
  const [catPages, setCatPages] = useState<MenuGroup[][]>([GROUPS]);

  useLayoutEffect(() => {
    const el = catRef.current;
    if (!el) return;
    const W = el.offsetWidth - 16, GAP = 8, PAD = 48, MAX = 140; // -16 안전마진, PAD 48=px-5*2+여유
    const c = document.createElement('canvas').getContext('2d');
    if (!c) return;
    c.font = 'bold 12px -apple-system, sans-serif';
    const ws = GROUPS.map(g => Math.min(c.measureText(g.name).width + PAD, MAX));
    const ps: MenuGroup[][] = [];
    let p: MenuGroup[] = [], u = 0;
    for (let i = 0; i < GROUPS.length; i++) {
      const w = ws[i], n = p.length ? GAP + w : w;
      if (u + n > W && p.length) { ps.push(p); p = [GROUPS[i]]; u = w; }
      else { p.push(GROUPS[i]); u += n; }
    }
    if (p.length) ps.push(p);
    setCatPages(ps.length ? ps : [GROUPS]);
  }, []);

  const visCats = catPages[catPage] ?? [];
  const catTotal = catPages.length;
  useEffect(() => { if (catPage >= catTotal) setCatPage(Math.max(0, catTotal - 1)); }, [catPage, catTotal]);

  // ── menu ──
  const menus = getMenus(groupId);
  const C = 5, R = 4, PP = C * R;
  const mTotal = Math.max(1, Math.ceil(menus.length / PP));
  const pageMenus = menus.slice(menuPage * PP, (menuPage + 1) * PP);

  // ── computed ──
  const total = items.reduce((s, i) => s + (i.isService ? 0 : i.price * i.quantity - (i.discountAmount ?? 0)), 0);
  const qty = items.reduce((s, i) => s + i.quantity, 0);

  // ── handlers ──
  const add = (m: MenuItem) => {
    const i = items.findIndex(o => o.id === m.id);
    if (i >= 0) {
      setItems(prev => {
        const u = [...prev];
        u[i] = { ...u[i], quantity: u[i].quantity + 1 };
        return u;
      });
      setSelIdx(i);
    } else {
      setItems(prev => [...prev, { id: m.id, name: m.name, price: m.price, quantity: 1 }]);
      setSelIdx(items.length);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-pos-surface">

      {/* ═══ 메인 ═══ */}
      <div className="flex-1 flex min-h-0 gap-4 p-4">

        {/* ──── 좌측 ──── */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-4">

          {/* 카테고리 — 공용 Button 사용 */}
          <div className="shrink-0 flex items-center rounded-2xl bg-pos-bg shadow-pos-card">
            <div ref={catRef} className="flex-1 flex items-center gap-2 px-3 py-2 overflow-hidden">
              {visCats.map(g => (
                <Button key={g.id} size="sm"
                  variant={groupId === g.id ? 'primary' : 'ghost'}
                  onClick={() => { setGroupId(g.id); setMenuPage(0); }}
                  className={`shrink-0 max-w-[140px] whitespace-nowrap ${groupId !== g.id ? 'bg-pos-bg/60' : ''}`}
                >{g.name}</Button>
              ))}
            </div>
            <div className="shrink-0 flex pr-1 gap-0.5">
              <Button variant="ghost" size="sm" onClick={() => setCatPage(p => Math.max(0, p - 1))} disabled={catPage <= 0}>&lt;</Button>
              <Button variant="ghost" size="sm" onClick={() => setCatPage(p => Math.min(catTotal - 1, p + 1))} disabled={catPage >= catTotal - 1}>&gt;</Button>
            </div>
          </div>

          {/* 메뉴 그리드 */}
          <div className="flex-1 flex flex-col min-h-0 gap-3">
            <div className="flex-1 grid gap-1.5 min-h-0" style={{ gridTemplateColumns: `repeat(${C}, 1fr)`, gridTemplateRows: `repeat(${R}, minmax(0, 64px))` }}>
              {Array.from({ length: PP }).map((_, idx) => {
                const m = pageMenus[idx];
                if (!m) return <div key={`e-${idx}`} className="rounded-xl bg-pos-surface/60" />;
                return <MenuCard key={m.id} menu={m} onAdd={() => add(m)} compact />;
              })}
            </div>

            {/* 페이징 */}
            <div className="shrink-0 flex items-center h-8">
              <span className="flex-1 text-[11px] text-pos-text-muted tabular-nums pl-1">{menuPage + 1} / {mTotal}</span>
              <Button variant="secondary" size="sm" onClick={() => setMenuPage(p => Math.max(0, p - 1))} disabled={menuPage <= 0}>◄</Button>
              <Button variant="secondary" size="sm" onClick={() => setMenuPage(p => Math.min(mTotal - 1, p + 1))} disabled={menuPage >= mTotal - 1}>►</Button>
            </div>

            {/* 하단 옵션 버튼 영역 — 즐겨찾는 옵션 (그리드) */}
            <div className="shrink-0 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-pos-text-muted">
                {t('order.favoriteOptions')} {currentOptions.length > 0 ? `(${safeOptPage + 1}/${optTotalPages})` : ''}
                {selIdx == null && ` — ${t('order.selectItemPrompt')}`}
                {selIdx != null && currentOptions.length === 0 && ` — ${t('order.noOptions')}`}
              </span>

              {/* 1행: 옵션 3칸 + 주방/영수증/메모 */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 3 }).map((_, i) => {
                  const opt = visibleOptions[i];
                  if (!opt) {
                    return <div key={`opt-a-${i}`} className="h-10 rounded-lg bg-pos-bg/40 " />;
                  }
                  const selected = !!selectedOrderItem?.selectedOptions?.[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(opt.id)}
                      className={`h-10 rounded-lg text-[12px] font-bold cursor-pointer flex flex-col items-center justify-center leading-tight ${
                        selected ? 'bg-warn-500 text-pos-text' : 'bg-warn-50 text-pos-text'
                      }`}
                    >
                      <span>{opt.name}</span>
                      {opt.price ? <span className="text-[10px] opacity-90">({opt.price.toLocaleString()})</span> : null}
                    </button>
                  );
                })}
                <button type="button" className="h-10 rounded-lg bg-pos-bg text-pos-text text-[12px] font-bold cursor-pointer shadow-pos-card">{t('order.kitchen')}</button>
                <button type="button" className="h-10 rounded-lg bg-pos-bg text-pos-text text-[12px] font-bold cursor-pointer shadow-pos-card">{t('order.receipt')}</button>
                <button
                  type="button"
                  onClick={() => { if (selIdx != null) setMemoOpen(true); }}
                  disabled={selIdx == null}
                  className={`h-10 rounded-lg text-[12px] font-bold cursor-pointer ${
                    selIdx == null ? 'bg-pos-bg text-pos-text-muted cursor-not-allowed shadow-pos-card' : 'bg-pos-surface text-pos-text'
                  }`}
                >
                  {t('order.memo')}
                </button>
              </div>

              {/* 2행: 옵션 3칸 + 페이저(col-span-2) + 옵션 */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 3 }).map((_, i) => {
                  const opt = visibleOptions[i + 3];
                  if (!opt) {
                    return <div key={`opt-b-${i}`} className="h-10 rounded-lg bg-pos-bg/40 " />;
                  }
                  const selected = !!selectedOrderItem?.selectedOptions?.[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(opt.id)}
                      className={`h-10 rounded-lg text-[12px] font-bold cursor-pointer flex flex-col items-center justify-center leading-tight ${
                        selected ? 'bg-warn-500 text-pos-text' : 'bg-warn-50 text-pos-text'
                      }`}
                    >
                      <span>{opt.name}</span>
                      {opt.price ? <span className="text-[10px] opacity-90">({opt.price.toLocaleString()})</span> : null}
                    </button>
                  );
                })}
                <div className={`col-span-2 h-10 flex items-center rounded-lg bg-pos-bg shadow-pos-card ${hasOptionPager ? '' : 'opacity-60'}`}>
                  <button
                    type="button"
                    disabled={!canPrevOpt}
                    onClick={() => setOptPage((p) => Math.max(0, p - 1))}
                    className={`flex-1 h-full flex items-center justify-center text-[16px] cursor-pointer ${canPrevOpt ? 'text-pos-text' : 'text-pos-text-muted cursor-not-allowed'}`}
                  >‹</button>
                  <div className="w-px h-5 bg-pos-border" />
                  <button
                    type="button"
                    disabled={!canNextOpt}
                    onClick={() => setOptPage((p) => Math.min(optTotalPages - 1, p + 1))}
                    className={`flex-1 h-full flex items-center justify-center text-[16px] cursor-pointer ${canNextOpt ? 'text-pos-text' : 'text-pos-text-muted cursor-not-allowed'}`}
                  >›</button>
                </div>
                <button type="button" className="h-10 rounded-lg bg-pos-bg text-pos-text text-[12px] font-bold cursor-pointer shadow-pos-card">{t('order.optionsButton')}</button>
              </div>
            </div>
          </div>
        </div>

        {/* ──── 우측: 주문 패널 ──── */}
        <div className="w-[280px] min-w-[280px] max-w-[280px] shrink-0 flex flex-col min-h-0 rounded-2xl bg-pos-bg shadow-pos-card">

          {/* 탭(세그먼트 토글) + 전체취소 */}
          <div className="shrink-0 flex items-center justify-between gap-2 px-3 h-12">
            <div className="flex rounded-lg p-0.5 gap-0.5 bg-pos-surface shadow-pos-card">
              <button onClick={() => setTab('dine')}
                className={`min-w-[52px] px-3 h-7 rounded-md text-[11px] font-bold cursor-pointer transition-all ${tab === 'dine' ? 'bg-primary-500 text-pos-text-inverse shadow-pos-card' : 'text-pos-text-muted'}`}
              >{t('order.dineIn')}</button>
              <button onClick={() => setTab('delivery')}
                className={`min-w-[52px] px-3 h-7 rounded-md text-[11px] font-bold cursor-pointer transition-all ${tab === 'delivery' ? 'bg-primary-500 text-pos-text-inverse shadow-pos-card' : 'text-pos-text-muted'}`}
              >{t('order.deliveryTab')}</button>
            </div>
            <Button variant="danger" size="sm" onClick={() => { setItems([]); setSelIdx(null); }}>{t('order.cancelAll')}</Button>
          </div>

          {/* 구분선 */}
          <div className="h-px mx-4 bg-pos-border/60" />

          {/* 주문 리스트 (스크롤) */}
          {(() => {
            const visibleItems = items;
            return (
              <div className="flex-1 relative flex flex-col min-h-0">
                {/* 상단 스크롤 힌트 */}
                {scrollHint.top && (
                  <div
                    className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-20"
                    style={{ background: 'linear-gradient(to bottom, var(--color-pos-bg), transparent)' }}
                  />
                )}
                {/* 하단 스크롤 힌트 */}
                {scrollHint.bottom && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-20"
                    style={{ background: 'linear-gradient(to top, var(--color-pos-bg), transparent)' }}
                  />
                )}
                {/* 아이템 영역 */}
                <div ref={orderScrollRef} onScroll={updateScrollHint} className="flex-1 flex flex-col overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-pos-surface">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-pos-text-muted">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[13px] text-pos-text-muted">
                        {tab === 'dine' ? t('order.selectMenuPrompt') : t('order.selectDeliveryMenuPrompt')}
                      </span>
                    </div>
                  ) : (
                    visibleItems.map((item) => {
                      const realIdx = items.indexOf(item);
                      const selected = selIdx === realIdx;
                      return (
                        <div key={item.id} onClick={() => setSelIdx(realIdx)}
                          className={`relative px-3 py-2.5 border-b border-pos-border/40 cursor-pointer ${
                            selected ? 'bg-primary-50' : ''
                          }`}
                        >
                          {selected && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary-500" />}

                          {/* 1행: 번호 · 서비스/포장 · 삭제 */}
                          <div className="flex items-center gap-2">
                            <span className="min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-pos-text-inverse bg-pos-text rounded tabular-nums">
                              {realIdx + 1}
                            </span>
                            <div className="flex-1" />
                            <button
                              onClick={() => setItems(prev => { const u = [...prev]; u[realIdx] = { ...u[realIdx], isService: !u[realIdx].isService }; return u; })}
                              className={`min-h-[24px] px-1.5 text-[10px] font-medium rounded-md cursor-pointer ${
                                item.isService ? 'bg-primary-500 text-white' : 'text-pos-text-muted'
                              }`}
                            >
                              {t('order.applyService')}
                            </button>
                            {tab === 'dine' && (
                              <button
                                onClick={() => setItems(prev => { const u = [...prev]; u[realIdx] = { ...u[realIdx], isPacking: !u[realIdx].isPacking }; return u; })}
                                className={`min-h-[24px] px-1.5 text-[10px] font-medium rounded-md cursor-pointer ${
                                  item.isPacking ? 'bg-primary-500 text-white' : 'text-pos-text-muted'
                                }`}
                              >
                                {t('order.packing')}
                              </button>
                            )}
                            <div className="w-px h-4 bg-pos-border" />
                            <button
                              onClick={() => { setItems(prev => prev.filter((_, i) => i !== realIdx)); }}
                              aria-label={t('order.delete')}
                              className="min-h-[28px] px-2 text-[11px] font-medium text-pos-text-muted rounded-md cursor-pointer"
                            >
                              {t('order.delete')}
                            </button>
                          </div>

                          {/* 2행: 메뉴명 */}
                          <div className="mt-1.5 text-[13px] font-semibold text-pos-text truncate">
                            {item.name}
                          </div>

                          {/* 주방 메모 */}
                          {item.cookingMemo && (
                            <div className="mt-1 text-[11px] text-pos-text-muted italic truncate">
                              📝 {item.cookingMemo}
                            </div>
                          )}

                          {/* 선택된 옵션 뱃지 */}
                          {(() => {
                            const opts = getMenuOptions(item.id);
                            const selectedMap = item.selectedOptions ?? {};
                            const chosen = Object.entries(selectedMap)
                              .map(([oid, oqty]) => {
                                const o = opts.find((x) => x.id === oid);
                                return o ? { opt: o, qty: oqty } : null;
                              })
                              .filter((v): v is { opt: MenuOption; qty: number } => !!v);
                            if (chosen.length === 0) return null;
                            return (
                              <div className="mt-1.5 mb-2 flex flex-wrap gap-1.5">
                                {chosen.map(({ opt, qty }) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setOptQtyTarget({ itemIdx: realIdx, optId: opt.id }); }}
                                    className="inline-flex items-center gap-1 h-[20px] px-2 text-[10px] font-semibold text-primary-700 bg-primary-100 rounded-full cursor-pointer tabular-nums"
                                  >
                                    <span>{opt.name}</span>
                                    {qty > 1 && <span className="text-primary-600">×{qty}</span>}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}

                          {/* 3행: Stepper · 전체금액 */}
                          <div className="mt-1.5 flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
                            <Stepper value={item.quantity} min={1} size="sm"
                              onChange={v => { setSelIdx(realIdx); setItems(prev => { const u = [...prev]; u[realIdx] = { ...u[realIdx], quantity: v }; return u; }); }} />
                            <span className="text-[14px] font-bold tabular-nums text-pos-text shrink-0">
                              {(item.isService ? 0 : item.price * item.quantity - (item.discountAmount ?? 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* 하단 */}
          <div className="shrink-0 px-3 pt-2.5 pb-3 space-y-2">
            <Button variant="ghost" size="sm" fullWidth onClick={() => {}}>{t('order.payLater')} &gt;</Button>
            <Button variant="primary" size="lg" fullWidth>
              <span className="inline-flex items-center justify-center gap-2">
                {qty > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full bg-pos-error text-pos-text-inverse text-[13px] font-extrabold tabular-nums mr-0.5">
                    {qty}
                  </span>
                )}
                <span className="text-[15px] font-extrabold tracking-tight">
                  {t('order.checkout')} {total > 0 ? total.toLocaleString() : ''}
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* 옵션 수량 조절 다이얼로그 */}
      {(() => {
        if (!optQtyTarget) return null;
        const target = items[optQtyTarget.itemIdx];
        if (!target) return null;
        const opt = getMenuOptions(target.id).find((o) => o.id === optQtyTarget.optId);
        if (!opt) return null;
        const currentQty = target.selectedOptions?.[opt.id] ?? 1;
        return (
          <Modal
            open
            onClose={() => setOptQtyTarget(null)}
            title={`${opt.name} ${t('order.optionQtyTitleSuffix')}`}
            size="sm"
            footer={
              <>
                <Button variant="secondary" size="sm" onClick={() => { setOptionQty(optQtyTarget.itemIdx, opt.id, 0); setOptQtyTarget(null); }}>{t('order.optionQtyRemove')}</Button>
                <Button variant="primary" size="sm" onClick={() => setOptQtyTarget(null)}>{t('order.optionQtyConfirm')}</Button>
              </>
            }
          >
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="text-[15px] font-semibold text-pos-text-muted">{target.name}</div>
              <Stepper
                value={currentQty}
                min={1}
                max={99}
                size="lg"
                onChange={(v) => setOptionQty(optQtyTarget.itemIdx, opt.id, v)}
              />
              {opt.price ? (
                <div className="text-[16px] font-bold text-pos-text tabular-nums">
                  +{(opt.price * currentQty).toLocaleString()}
                </div>
              ) : null}
            </div>
          </Modal>
        );
      })()}

      {/* 메모 다이얼로그 */}
      <MemoDialog
        open={memoOpen}
        onClose={() => setMemoOpen(false)}
        title={selIdx != null ? `${items[selIdx]?.name ?? ''} ${t('order.memoTitleSuffix')}` : t('order.memo')}
        placeholder={t('order.memoPlaceholder')}
        initialMemo={selIdx != null ? items[selIdx]?.cookingMemo ?? '' : ''}
        onSave={(memo) => {
          if (selIdx != null) {
            setItems((prev) => {
              const u = [...prev];
              u[selIdx] = { ...u[selIdx], cookingMemo: memo };
              return u;
            });
          }
          setMemoOpen(false);
        }}
      />
    </div>
  );
}
