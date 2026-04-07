'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ────────────────────────────────────────────

interface StockAccountRow {
  id: string;
  itemName: string;
  currentQty: number;
  countedQty: number;
  diff: number;
}

interface StockAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub data ────────────────────────────────────────

const STUB_CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'cat-1', label: '식재료' },
  { value: 'cat-2', label: '음료' },
  { value: 'cat-3', label: '소모품' },
  { value: 'cat-4', label: '포장재' },
];

const STUB_ROWS: StockAccountRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: `row-${i + 1}`,
  itemName: `재고 품목 ${i + 1}`,
  currentQty: 50 + i * 3,
  countedQty: 50 + i * 3,
  diff: 0,
}));

// ─── Component ────────────────────────────────────────

export default function StockAccountDialog({ open, onClose }: StockAccountDialogProps) {
  const [accountDate, setAccountDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [rows, setRows] = useState<StockAccountRow[]>(STUB_ROWS);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // ─── Handlers ─────────────────────────────────────

  const handleCountedChange = useCallback((id: string, counted: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, countedQty: counted, diff: counted - r.currentQty } : r,
      ),
    );
  }, []);

  const handleSave = useCallback(() => {
    // TODO: STOCK:ACCOUNT_SAVE bridge call with idempotencyKey
    // Payload: { date: accountDate, items: rows.map(r => ({ itemId: r.id, countedQty: r.countedQty })) }
    onClose();
  }, [accountDate, rows, onClose]);

  const handlePrint = useCallback(() => {
    // TODO: STOCK:ACCOUNT_PRINT bridge call
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="재고 정산/실사"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handlePrint}>인쇄</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex flex-col h-full">
        {/* ─── Filter bar ─── */}
        <div className="shrink-0 flex items-center gap-3 flex-wrap">
          <DatePicker value={accountDate} onChange={setAccountDate} label="정산일" />
          <Dropdown
            options={STUB_CATEGORIES}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="분류 선택"
          />
        </div>

        {/* ─── Grid ─── */}
        <div className="flex-1 min-h-0 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden mt-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            <span>품목명</span>
            <span className="text-right">현재고</span>
            <span className="text-right">실사수량</span>
            <span className="text-right">차이</span>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedRowId(row.id)}
                className={`w-full grid grid-cols-[1fr_80px_80px_80px] gap-2 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                  selectedRowId === row.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-pos-text active:bg-gray-50'
                }`}
              >
                <span className="truncate">{row.itemName}</span>
                <span className="text-right tabular-nums">{row.currentQty}</span>
                <span className="text-right">
                  <input
                    type="number"
                    value={row.countedQty}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleCountedChange(row.id, parseInt(e.target.value, 10) || 0)}
                    className="w-full text-right text-xs border border-pos-border rounded-pos px-1 py-0.5 tabular-nums"
                  />
                </span>
                <span className={`text-right tabular-nums ${row.diff !== 0 ? 'text-pos-error font-semibold' : ''}`}>
                  {row.diff > 0 ? `+${row.diff}` : row.diff}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
