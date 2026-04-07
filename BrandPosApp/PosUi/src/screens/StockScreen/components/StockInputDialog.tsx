'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';
import NumPad from '@shared/ui/molecules/NumPad';

// ─── Types ────────────────────────────────────────────
type InputType = 'purchase' | 'return' | 'transfer';

interface Supplier {
  id: string;
  name: string;
  phone: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface StockItem {
  id: string;
  name: string;
  barcode: string;
  unitPrice: number;
}

interface StockInputRow {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface StockInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_CATEGORIES: CategoryItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `cat-${i + 1}`,
  name: `분류 ${i + 1}`,
}));

const STUB_ITEMS: StockItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `item-${i + 1}`,
  name: `상품 ${i + 1}`,
  barcode: `880${String(i + 1).padStart(10, '0')}`,
  unitPrice: (i + 1) * 1000,
}));

// ─── Component ────────────────────────────────────────
export default function StockInputDialog({
  open,
  onClose,
  onSaved,
}: StockInputDialogProps) {
  // Local state
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [inputTime, setInputTime] = useState<string>('09:00');
  const [inputType, setInputType] = useState<InputType>('purchase');
  const [categories] = useState<CategoryItem[]>(STUB_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [items] = useState<StockItem[]>(STUB_ITEMS);
  const [inputRows, setInputRows] = useState<StockInputRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [numpadValue, setNumpadValue] = useState<string>('');

  const totalAmount = inputRows.reduce((sum, r) => sum + r.amount, 0);

  // ─── Handlers ─────────────────────────────────────
  const handleSelectSupplier = useCallback(() => {
    // TODO: PURCHASE:SEARCH bridge call to open supplier selection
    setSupplier({ id: 'sup-1', name: '(주)테스트거래처', phone: '02-1234-5678' });
  }, []);

  const handleLoadPurchase = useCallback(() => {
    // TODO: PURCHASE:GET_LIST bridge call to load purchase orders
  }, []);

  const handleSelectCategory = useCallback((catId: string) => {
    setSelectedCategoryId(catId);
    // TODO: filter items by category via stockApi.getItemsByCategory
  }, []);

  const handleSelectItem = useCallback((item: StockItem) => {
    const qty = parseInt(numpadValue, 10) || 1;
    const newRow: StockInputRow = {
      id: `row-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      qty,
      unitPrice: item.unitPrice,
      amount: qty * item.unitPrice,
    };
    setInputRows((prev) => [...prev, newRow]);
    setNumpadValue('');
  }, [numpadValue]);

  const handleDeleteRow = useCallback(() => {
    if (!selectedRowId) return;
    // TODO: STOCK:MODIFY bridge call for item removal
    setInputRows((prev) => prev.filter((r) => r.id !== selectedRowId));
    setSelectedRowId(null);
  }, [selectedRowId]);

  const handleSave = useCallback(() => {
    if (inputRows.length === 0) return;
    // TODO: STOCK:INPUT bridge call with idempotencyKey
    // Payload: { items: inputRows.map(r => ({ itemId, qty, unitPrice })), date, memo }
    onSaved?.();
    onClose();
  }, [inputRows, onSaved, onClose]);

  const handleNumpadInput = useCallback((key: string) => {
    if (key === 'BS') {
      setNumpadValue((prev) => prev.slice(0, -1));
    } else if (key === 'CLR') {
      setNumpadValue('');
    } else {
      setNumpadValue((prev) => prev + key);
    }
  }, []);

  const INPUT_TYPE_OPTIONS: { value: InputType; label: string }[] = [
    { value: 'purchase', label: '매입' },
    { value: 'return', label: '반품' },
    { value: 'transfer', label: '이동' },
  ];

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="재고 입고"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* ─── Top bar: supplier, date, actions ─── */}
        <div className="shrink-0 flex items-center gap-3 h-9 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-pos-text-muted shrink-0">거래처:</span>
            <span className="text-xs font-semibold text-pos-text truncate">
              {supplier?.name ?? '(선택 안 됨)'}
            </span>
            {supplier?.phone && (
              <span className="text-2xs text-pos-text-muted">{supplier.phone}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleSelectSupplier}>
              거래처 선택
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLoadPurchase}>
              발주 불러오기
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              저장
            </Button>
          </div>
        </div>

        {/* Date / Time */}
        <div className="shrink-0 flex items-center gap-3 h-9">
          <DatePicker value={inputDate} onChange={setInputDate} />
          <input
            type="time"
            value={inputTime}
            onChange={(e) => setInputTime(e.target.value)}
            className="border border-pos-border rounded-pos px-2 py-1 text-xs"
          />
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
                  onClick={() => handleSelectCategory(cat.id)}
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

          {/* Middle: Item grid */}
          <div className="w-36 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden shrink-0">
            <div className="px-2 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted">
              품목
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="w-full px-2 py-2 text-xs text-left text-pos-text cursor-pointer active:bg-gray-50 transition-colors"
                >
                  <div className="truncate">{item.name}</div>
                  <div className="text-2xs text-pos-text-muted tabular-nums">
                    {item.unitPrice.toLocaleString()}원
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: input type, numpad, detail grid */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* Input type radio */}
            <div className="flex items-center gap-3">
              {INPUT_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-1 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="inputType"
                    value={opt.value}
                    checked={inputType === opt.value}
                    onChange={() => setInputType(opt.value)}
                    className="accent-primary-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* NumPad + total */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-pos-border rounded-pos px-2 py-1 text-xs tabular-nums min-w-[80px]">
                {numpadValue || '0'}
              </div>
              <NumPad
                onInput={handleNumpadInput}
                onConfirm={() => {}}
                onClear={() => {}}
                onBackspace={() => {}}
              />
              <div className="ml-auto text-xs font-semibold text-pos-text">
                합계: <span className="tabular-nums">{totalAmount.toLocaleString()}</span>원
              </div>
            </div>

            {/* Detail grid */}
            <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
                <span>품목명</span>
                <span className="text-right">수량</span>
                <span className="text-right">단가</span>
                <span className="text-right">금액</span>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {inputRows.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                    입고 항목을 추가하세요
                  </div>
                ) : (
                  inputRows.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelectedRowId(row.id)}
                      className={`w-full grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                        selectedRowId === row.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-pos-text active:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{row.itemName}</span>
                      <span className="text-right tabular-nums">{row.qty}</span>
                      <span className="text-right tabular-nums">{row.unitPrice.toLocaleString()}</span>
                      <span className="text-right tabular-nums">{row.amount.toLocaleString()}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Row delete */}
            <div className="flex justify-end">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteRow}
                disabled={!selectedRowId}
              >
                행 삭제
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
