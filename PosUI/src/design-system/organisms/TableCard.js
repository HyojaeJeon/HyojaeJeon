'use client';

import { TABLE_STATUS } from '../../screens/constants';

export default function TableCard({ table, onClick }) {
  const { id, label, status, orderSummary, totalAmount, guests, elapsedTimeMin } = table;
  const isEmpty = status === TABLE_STATUS.EMPTY;
  const isPaying = status === TABLE_STATUS.PAYING;

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`
        relative w-full h-full rounded-2xl transition-transform duration-150
        flex flex-col overflow-hidden cursor-pointer select-none
        active:scale-[0.97]
        ${isEmpty
          ? 'bg-gray-50 border-2 border-dashed border-gray-200'
          : isPaying
            ? 'bg-white border-2 border-warm-yellow-300 shadow-pos-card'
            : 'bg-white border border-gray-200 shadow-pos-card'}
      `}
    >
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-400">빈 테이블</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 leading-tight">{label}</span>
              <span className="text-[11px] text-gray-400 mt-0.5 tabular-nums">{guests}명 · {elapsedTimeMin}분</span>
            </div>
            {isPaying && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-warm-yellow-100 text-warm-yellow-700 leading-none">
                결제중
              </span>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-xs text-gray-400 truncate mb-1.5">{orderSummary}</p>
            <p className="text-base font-bold text-gray-900 tabular-nums">{totalAmount.toLocaleString()}₫</p>
          </div>
        </div>
      )}
    </button>
  );
}
