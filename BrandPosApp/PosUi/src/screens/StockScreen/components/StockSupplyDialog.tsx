'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Dropdown from '@shared/ui/molecules/Dropdown';
import { DateRangePicker } from '@shared/ui/molecules/DatePicker';

// ─── Types ────────────────────────────────────────────

interface SupplyItem {
  id: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  amount: number;
  supplyDate: string;
}

interface StockSupplyDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub data ────────────────────────────────────────

const STUB_SUPPLIERS = [
  { value: '', label: '전체' },
  { value: 'sup-1', label: '(주)테스트거래처' },
  { value: 'sup-2', label: '신선식품' },
  { value: 'sup-3', label: '음료유통' },
];

const STUB_ITEMS: SupplyItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `supply-${i + 1}`,
  itemName: `입고 품목 ${i + 1}`,
  qty: (i + 1) * 5,
  unitPrice: (i + 1) * 2000,
  amount: (i + 1) * 5 * (i + 1) * 2000,
  supplyDate: '2026-04-01',
}));

// ─── Component ────────────────────────────────────────

export default function StockSupplyDialog({ open, onClose }: StockSupplyDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [supplierId, setSupplierId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [items] = useState<SupplyItem[]>(STUB_ITEMS);

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSearch = useCallback(() => {
    // TODO: STOCK:SUPPLY_SEARCH bridge call
    // Payload: { supplierId, startDate, endDate }
  }, [supplierId, startDate, endDate]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="공급자별 입고"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
      }
    >
      <div className="flex flex-col h-full">
        {/* ─── Filter bar ─── */}
        <div className="shrink-0 flex items-center gap-3 flex-wrap">
          <Dropdown
            options={STUB_SUPPLIERS}
            value={supplierId}
            onChange={setSupplierId}
            placeholder="공급자 선택"
          />
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onSearch={handleSearch}
            searchLabel="조회"
          />
        </div>

        {/* ─── Grid ─── */}
        <div className="flex-1 min-h-0 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden mt-3">
          {/* Header */}
          <div className="grid grid-cols-[90px_1fr_60px_80px_100px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            <span>입고일</span>
            <span>품목명</span>
            <span className="text-right">수량</span>
            <span className="text-right">단가</span>
            <span className="text-right">금액</span>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                입고 내역이 없습니다
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[90px_1fr_60px_80px_100px] gap-2 px-3 py-2 text-xs text-pos-text border-b border-pos-border/50 last:border-b-0"
                >
                  <span className="tabular-nums">{item.supplyDate}</span>
                  <span className="truncate">{item.itemName}</span>
                  <span className="text-right tabular-nums">{item.qty}</span>
                  <span className="text-right tabular-nums">{item.unitPrice.toLocaleString()}</span>
                  <span className="text-right tabular-nums">{item.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Total summary ─── */}
        <div className="shrink-0 flex items-center justify-end gap-2 pt-2">
          <span className="text-xs text-pos-text-muted">총 금액:</span>
          <span className="text-sm font-bold text-pos-text tabular-nums">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
      </div>
    </FullScreenPanel>
  );
}
