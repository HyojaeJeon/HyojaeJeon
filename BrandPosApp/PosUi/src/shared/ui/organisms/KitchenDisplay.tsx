'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

type KitchenOrderStatus = 'pending' | 'cooking' | 'done';

interface KitchenOrderItem {
  name: string;
  qty: number;
}

interface KitchenOrder {
  orderNo: string;
  tableName: string;
  items: KitchenOrderItem[];
  elapsedMin: number;
  status: KitchenOrderStatus;
}

interface KitchenDisplayProps {
  orders: KitchenOrder[];
  onStatusChange: (orderNo: string, status: KitchenOrderStatus) => void;
}

const STATUS_STYLES: Record<KitchenOrderStatus, string> = {
  pending: 'border-warn-300 bg-warn-50',
  cooking: 'border-primary-300 bg-primary-50',
  done: 'border-pos-success/30 bg-green-50',
};

const NEXT_STATUS: Record<KitchenOrderStatus, KitchenOrderStatus | null> = {
  pending: 'cooking',
  cooking: 'done',
  done: null,
};

/**
 * KitchenDisplay -- 주방 주문 디스플레이
 *
 * 주문 카드 그리드. 각 카드에 테이블명, 항목, 경과시간, 상태 변경 버튼을 표시한다.
 */
export default function KitchenDisplay({
  orders,
  onStatusChange,
}: KitchenDisplayProps) {
  const { t } = usePosI18n();
  return (
    <div className="grid grid-cols-3 gap-3">
      {orders.map((order) => {
        const nextStatus = NEXT_STATUS[order.status];
        return (
          <div
            key={order.orderNo}
            className={`
              flex flex-col rounded-pos-card border-2 overflow-hidden
              ${STATUS_STYLES[order.status]}
            `}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-pos-border">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-pos-text">{order.tableName}</span>
                <span className="text-2xs text-pos-text-muted tabular-nums">#{order.orderNo}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xs font-semibold text-pos-text-secondary tabular-nums">
                  {order.elapsedMin}분
                </span>
                <span
                  className={`
                    text-2xs font-bold px-2 py-0.5 rounded-pos-full
                    ${order.status === 'pending' ? 'bg-warn-300 text-pos-text' : ''}
                    ${order.status === 'cooking' ? 'bg-primary-500 text-pos-text-inverse' : ''}
                    ${order.status === 'done' ? 'bg-pos-success text-pos-text-inverse' : ''}
                  `}
                >
                  {order.status === 'pending'
                    ? t('common.kitchenPending')
                    : order.status === 'cooking'
                      ? t('common.kitchenCooking')
                      : t('common.kitchenDone')}
                </span>
              </div>
            </div>

            {/* 항목 목록 */}
            <div className="flex-1 px-3 py-2 space-y-0.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-pos-text">
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0 tabular-nums font-semibold ml-2">x{item.qty}</span>
                </div>
              ))}
            </div>

            {/* 상태 변경 버튼 */}
            {nextStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(order.orderNo, nextStatus)}
                className="h-touch mx-2 mb-2 rounded-pos-btn bg-primary-500 text-pos-text-inverse text-sm font-bold active:bg-primary-700 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
              >
                {nextStatus === 'cooking' ? t('common.startCooking') : t('common.finishCooking')}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
