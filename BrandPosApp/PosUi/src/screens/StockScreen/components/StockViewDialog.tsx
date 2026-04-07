'use client';

import { useState, useCallback, useMemo } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';
import Checkbox from '@shared/ui/atoms/Checkbox';

// ─── Types ────────────────────────────────────────────
interface CategoryItem {
  id: string;
  name: string;
}

interface StockViewRecord {
  id: string;
  itemName: string;
  barcode: string;
  categoryName: string;
  inputQty: number;
  saleQty: number;
  stockQty: number;
  unitPrice: number;
}

interface StockViewDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_CATEGORIES: CategoryItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `cat-${i + 1}`,
  name: `분류 ${i + 1}`,
}));

const STUB_RECORDS: StockViewRecord[] = Array.from({ length: 15 }, (_, i) => ({
  id: `rec-${i + 1}`,
  itemName: `상품 ${i + 1}`,
  barcode: `880${String(i + 1).padStart(10, '0')}`,
  categoryName: `분류 ${(i % 4) + 1}`,
  inputQty: Math.floor(Math.random() * 100) + 10,
  saleQty: Math.floor(Math.random() * 50),
  stockQty: Math.floor(Math.random() * 80) + 5,
  unitPrice: (i + 1) * 1000,
}));

// ─── Component ────────────────────────────────────────
export default function StockViewDialog({
  open,
  onClose,
}: StockViewDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [filterInput, setFilterInput] = useState<boolean>(true);
  const [filterSale, setFilterSale] = useState<boolean>(true);
  const [categories] = useState<CategoryItem[]>(STUB_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [records] = useState<StockViewRecord[]>(STUB_RECORDS);

  const filteredRecords = useMemo(() => {
    let result = records;
    if (selectedCategoryId) {
      result = result.filter((r) => r.categoryName === categories.find((c) => c.id === selectedCategoryId)?.name);
    }
    return result;
  }, [records, selectedCategoryId, categories]);

  const handleSearch = useCallback(() => {
    // TODO: STOCK:VIEW bridge call with { startDate, endDate, filterInput, filterSale }
  }, [startDate, endDate, filterInput, filterSale]);

  const handleExportExcel = useCallback(() => {
    // TODO: STOCK:GET_HISTORY bridge call with { startDate, endDate, format: "excel" }
  }, [startDate, endDate]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="재고 조회"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* ─── Filter bar ─── */}
        <div className="shrink-0 flex items-center gap-3 h-9 flex-wrap">
          <DatePicker value={startDate} onChange={setStartDate} />
          <span className="text-xs text-pos-text-muted">~</span>
          <DatePicker value={endDate} onChange={setEndDate} />

          <div className="flex items-center gap-3 ml-2">
            <Checkbox
              checked={filterInput}
              onChange={setFilterInput}
              label="입고"
            />
            <Checkbox
              checked={filterSale}
              onChange={setFilterSale}
              label="판매"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="primary" size="sm" onClick={handleSearch}>
              조회
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportExcel}>
              엑셀
            </Button>
          </div>
        </div>

        {/* ─── Main body ─── */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Left: Category grid */}
          <div className="w-28 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden shrink-0">
            <div className="px-2 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted">
              카테고리
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full px-2 py-2 text-xs text-left cursor-pointer transition-colors ${
                    selectedCategoryId === cat.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Stock detail grid */}
          <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_70px_70px_70px_80px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
              <span>상품명</span>
              <span className="text-right">입고수량</span>
              <span className="text-right">판매수량</span>
              <span className="text-right">재고수량</span>
              <span className="text-right">단가</span>
              <span className="text-right">바코드</span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {filteredRecords.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                  조회 결과가 없습니다
                </div>
              ) : (
                filteredRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="grid grid-cols-[1fr_80px_70px_70px_70px_80px] gap-2 px-3 py-2 text-xs text-pos-text"
                  >
                    <span className="truncate">{rec.itemName}</span>
                    <span className="text-right tabular-nums">{rec.inputQty}</span>
                    <span className="text-right tabular-nums">{rec.saleQty}</span>
                    <span className="text-right tabular-nums">{rec.stockQty}</span>
                    <span className="text-right tabular-nums">{rec.unitPrice.toLocaleString()}</span>
                    <span className="text-right tabular-nums text-2xs">{rec.barcode}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
