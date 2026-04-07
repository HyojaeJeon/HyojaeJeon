'use client';

import { useState } from 'react';

interface VoidReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface VoidReceiptData {
  no: string;
  date: string;
  amount: number;
  items: VoidReceiptItem[];
}

interface VoidReceiptProps {
  receipt: VoidReceiptData;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  reason?: string;
}

/**
 * VoidReceipt -- 거래 취소 UI
 *
 * 영수증 요약, 취소 사유 입력, 확인/취소 버튼을 표시한다.
 */
export default function VoidReceipt({
  receipt,
  onConfirm,
  onCancel,
  reason: initialReason = '',
}: VoidReceiptProps) {
  const [reason, setReason] = useState(initialReason);
  const fmt = (v: number) => v.toLocaleString('ko-KR');

  return (
    <div className="flex flex-col gap-4 p-4 bg-pos-bg rounded-pos-card border border-pos-error/30 max-w-[360px] mx-auto">
      {/* 제목 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-pos-full bg-pos-error/10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-pos-error">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-md font-bold text-pos-error">거래 취소</h3>
      </div>

      {/* 영수증 요약 */}
      <div className="flex flex-col gap-2 p-3 bg-pos-surface rounded-pos-sm">
        <div className="flex justify-between text-xs text-pos-text-muted">
          <span>영수증 번호</span>
          <span className="font-mono">{receipt.no}</span>
        </div>
        <div className="flex justify-between text-xs text-pos-text-muted">
          <span>거래 일시</span>
          <span>{receipt.date}</span>
        </div>

        <div className="border-t border-dashed border-pos-border my-1" />

        {/* 항목 */}
        {receipt.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs text-pos-text">
            <span className="truncate">{item.name} x{item.qty}</span>
            <span className="tabular-nums shrink-0 ml-2">{fmt(item.price * item.qty)}</span>
          </div>
        ))}

        <div className="border-t border-pos-border my-1" />

        <div className="flex justify-between text-sm font-bold text-pos-text">
          <span>취소 금액</span>
          <span className="text-pos-error tabular-nums">{fmt(receipt.amount)}</span>
        </div>
      </div>

      {/* 취소 사유 입력 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-pos-text">취소 사유</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="취소 사유를 입력하세요"
          className="h-20 px-3 py-2 text-sm rounded-pos-input border border-pos-border bg-pos-bg text-pos-text placeholder:text-pos-text-muted resize-none outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-touch rounded-pos-btn bg-pos-surface text-pos-text-secondary text-sm font-semibold active:bg-gray-300 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
        >
          돌아가기
        </button>
        <button
          type="button"
          onClick={() => onConfirm(reason)}
          className="flex-1 h-touch rounded-pos-btn bg-pos-error text-pos-text-inverse text-sm font-bold active:bg-red-700 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
        >
          취소 확인
        </button>
      </div>
    </div>
  );
}
