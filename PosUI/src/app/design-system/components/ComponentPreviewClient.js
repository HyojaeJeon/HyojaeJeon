'use client';

import { useState } from 'react';
import TableCard from '../../../design-system/organisms/TableCard';
import MenuCard from '../../../design-system/organisms/MenuCard';
import TakeoutBar from '../../../design-system/organisms/TakeoutBar';
import OrderSidebar from '../../../design-system/organisms/OrderSidebar';

const mockTables = {
  empty: { id: 'T1', label: '1번', status: 'EMPTY', orderSummary: '', totalAmount: 0, guests: 0, elapsedTimeMin: 0 },
  occupied: { id: 'T2', label: '2번', status: 'OCCUPIED', orderSummary: '김치찌개 외 2건', totalAmount: 465000, guests: 3, elapsedTimeMin: 45 },
  paying: { id: 'T3', label: '3번', status: 'PAYING', orderSummary: '삼겹살 외 5건', totalAmount: 1635000, guests: 4, elapsedTimeMin: 70 },
};

const mockMenus = {
  normal: { id: 'M1', name: '김치찌개', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=400&h=400&q=80', isSoldOut: false },
  soldOut: { id: 'M2', name: '감자탕', price: 475000, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&h=400&q=80', isSoldOut: true },
};

const mockOrder = [
  { name: '김치찌개', price: 150000, quantity: 2 },
  { name: '제육볶음', price: 190000, quantity: 1 },
];

const noop = () => {};

export default function ComponentPreviewClient({ slug }) {
  const [activeTab, setActiveTab] = useState('hall');

  const configs = {
    'table-card': {
      title: 'TableCard',
      desc: '테이블 상태를 표시하는 가변형 카드 (EMPTY / OCCUPIED / PAYING)',
      content: (
        <div className="flex gap-5 items-start">
          {Object.entries(mockTables).map(([key, table]) => (
            <div key={key} className="flex flex-col items-center gap-3">
              <div className="w-[220px] h-[180px]">
                <TableCard table={table} onClick={noop} />
              </div>
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{key}</span>
            </div>
          ))}
        </div>
      ),
    },
    'menu-card': {
      title: 'MenuCard',
      desc: 'Frosted glass 메뉴명 오버레이 + VND 가격 (5×4 그리드 최적화)',
      content: (
        <div className="flex gap-5 items-start">
          {Object.entries(mockMenus).map(([key, menu]) => (
            <div key={key} className="flex flex-col items-center gap-3">
              <div className="w-[140px] h-[170px]">
                <MenuCard menu={menu} onAdd={noop} />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">
                {key === 'normal' ? 'Normal' : 'Sold Out'}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    'takeout-bar': {
      title: 'TakeoutBar',
      desc: '홀/포장/배달 전환 탭 바 (터치 인터랙션)',
      content: (
        <div className="w-full max-w-[640px]">
          <TakeoutBar activeTab={activeTab} onTabSelect={setActiveTab} counts={{ takeout: 1, delivery: 3 }} />
        </div>
      ),
    },
    'order-sidebar': {
      title: 'OrderSidebar',
      desc: '주문 내역 + 상하 네비게이션 + VND 결제',
      content: (
        <div className="flex gap-6 h-[520px]">
          <div className="flex flex-col items-center gap-3">
            <OrderSidebar orderItems={[]} totalAmount={0} onCheckout={noop} isLoading={false} />
            <span className="text-[11px] text-gray-400 font-medium">Empty</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <OrderSidebar orderItems={mockOrder} totalAmount={490000} onCheckout={noop} isLoading={false} />
            <span className="text-[11px] text-gray-400 font-medium">With Items</span>
          </div>
        </div>
      ),
    },
  };

  const config = configs[slug];

  if (!config) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 capitalize mb-2">{slug?.replace(/-/g, ' ')}</h1>
          <p className="text-sm text-gray-400">준비 중인 컴포넌트입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <div className="px-10 pt-8 pb-0 shrink-0">
        <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
        <p className="text-sm text-gray-400 mt-1">{config.desc}</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        {config.content}
      </div>
    </div>
  );
}
