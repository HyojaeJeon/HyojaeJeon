'use client';

import { useState, useCallback, useEffect } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ────────────────────────────────────────────
type ModifyType = 'increase' | 'decrease' | 'adjust';
type ModifyStatus = 'draft' | 'confirmed' | 'deleted';

interface ModifyHeader {
  id: string;
  date: string;
  modifyType: ModifyType;
  totalAmount: number;
  status: ModifyStatus;
}

interface ModifyDetailRow {
  id: string;
  itemId: string;
  itemName: string;
  barcode: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface TaxSummary {
  tax: number;
  vat: number;
  taxFree: number;
  totalPurchase: number;
}

interface PurchaseModifyDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_MODIFY_HEADERS: ModifyHeader[] = Array.from({ length: 5 }, (_, i) => ({
  id: `mod-${i + 1}`,
  date: `2026-04-0${i + 1}`,
  modifyType: (['increase', 'decrease', 'adjust'] as ModifyType[])[i % 3],
  totalAmount: (i + 1) * 30000,
  status: i === 0 ? 'draft' : 'confirmed',
}));

const STATUS_LABEL: Record<ModifyStatus, string> = {
  draft: '작성중',
  confirmed: '확정',
  deleted: '삭제',
};

const STATUS_COLOR: Record<ModifyStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  deleted: 'bg-red-100 text-red-800',
};

const MODIFY_TYPE_OPTIONS: { value: ModifyType; label: string }[] = [
  { value: 'increase', label: '증가' },
  { value: 'decrease', label: '감소' },
  { value: 'adjust', label: '조정' },
];

// ─── Component ────────────────────────────────────────
export default function PurchaseModifyDialog({
  open,
  onClose,
  onSaved,
}: PurchaseModifyDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  // Filter state
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [modifyDate, setModifyDate] = useState<string>(today);

  // Form state
  const [modifyType, setModifyType] = useState<ModifyType>('increase');
  const [memo, setMemo] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Grid state
  const [modifyHeaders] = useState<ModifyHeader[]>(STUB_MODIFY_HEADERS);
  const [selectedModifyId, setSelectedModifyId] = useState<string | null>(null);
  const [detailRows, setDetailRows] = useState<ModifyDetailRow[]>([]);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  const selectedHeader = modifyHeaders.find((h) => h.id === selectedModifyId);

  // Computed
  const taxSummary: TaxSummary = {
    tax: detailRows.reduce((s, r) => s + Math.floor(r.amount * 0.1), 0),
    vat: detailRows.reduce((s, r) => s + Math.floor(r.amount * 0.1), 0),
    taxFree: 0,
    totalPurchase: detailRows.reduce((s, r) => s + r.amount, 0),
  };

  // ─── Handlers ─────────────────────────────────────
  const handleNew = useCallback(() => {
    // TODO: reset form for new stock modify
    setSelectedModifyId(null);
    setDetailRows([]);
    setMemo('');
    setBarcodeInput('');
  }, []);

  const handleSave = useCallback(() => {
    // TODO: STOCK:MODIFY bridge call with idempotencyKey
    // Payload: { modifyType, items, date, memo }
    onSaved?.();
  }, [onSaved]);

  const handleDelete = useCallback(() => {
    if (!selectedModifyId) return;
    // TODO: STOCK:MODIFY bridge call for deletion
  }, [selectedModifyId]);

  const handleSearch = useCallback(() => {
    // TODO: PURCHASE:GET_LIST bridge call with { startDate, endDate }
  }, [startDate, endDate]);

  const handleItemSearch = useCallback(() => {
    // TODO: PURCHASE:SEARCH bridge call with { type: "item", keyword: barcodeInput }
    if (!barcodeInput.trim()) return;
    const newRow: ModifyDetailRow = {
      id: `det-${Date.now()}`,
      itemId: 'item-stub',
      itemName: barcodeInput,
      barcode: barcodeInput,
      qty: 1,
      unitPrice: 10000,
      amount: 10000,
    };
    setDetailRows((prev) => [...prev, newRow]);
    setBarcodeInput('');
  }, [barcodeInput]);

  const handleItemCancel = useCallback(() => {
    if (!selectedDetailId) return;
    // TODO: STOCK:MODIFY bridge call for item removal
    setDetailRows((prev) => prev.filter((r) => r.id !== selectedDetailId));
    setSelectedDetailId(null);
  }, [selectedDetailId]);

  const handleSelectModify = useCallback((modifyId: string) => {
    setSelectedModifyId(modifyId);
    // TODO: fetch modify detail via purchaseApi.getModifyDetail
    setDetailRows([
      { id: 'det-1', itemId: 'i1', itemName: '상품 A', barcode: '8801234', qty: 10, unitPrice: 2000, amount: 20000 },
      { id: 'det-2', itemId: 'i2', itemName: '상품 B', barcode: '8801235', qty: 5, unitPrice: 4000, amount: 20000 },
    ]);
  }, []);

  // F5 shortcut for barcode lookup
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        handleItemSearch();
      }
    };
    if (open) {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [open, handleItemSearch]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="재고 수정"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* ─── Top action bar ─── */}
        <div className="shrink-0 flex items-center gap-2 h-9 justify-end">
          <Button variant="secondary" size="sm" onClick={handleNew}>신규</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={!selectedModifyId}>삭제</Button>
        </div>

        {/* ─── Filter / Form section ─── */}
        <div className="shrink-0 flex flex-col gap-2 text-xs">
          {/* Row 1: dates + status */}
          <div className="flex items-center gap-3 h-9 flex-wrap">
            <DatePicker value={startDate} onChange={setStartDate} />
            <span className="text-pos-text-muted">~</span>
            <DatePicker value={endDate} onChange={setEndDate} />
            <DatePicker value={modifyDate} onChange={setModifyDate} />
            {selectedHeader && (
              <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${STATUS_COLOR[selectedHeader.status]}`}>
                {STATUS_LABEL[selectedHeader.status]}
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={handleSearch} className="ml-auto">조회</Button>
          </div>

          {/* Row 2: modify type radio */}
          <div className="flex items-center gap-3">
            <span className="text-pos-text-muted">수정유형:</span>
            {MODIFY_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="modifyType"
                  value={opt.value}
                  checked={modifyType === opt.value}
                  onChange={() => setModifyType(opt.value)}
                  className="accent-primary-600"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Row 3: memo */}
          <div className="flex items-center gap-3">
            <span className="text-pos-text-muted">메모:</span>
            <TextInput value={memo} onChange={setMemo} placeholder="메모 입력" />
          </div>

          {/* Row 4: tax summary */}
          <div className="flex items-center gap-4 text-2xs text-pos-text-muted">
            <span>세액: <span className="font-semibold text-pos-text tabular-nums">{taxSummary.tax.toLocaleString()}</span></span>
            <span>부가세: <span className="font-semibold text-pos-text tabular-nums">{taxSummary.vat.toLocaleString()}</span></span>
            <span>면세: <span className="font-semibold text-pos-text tabular-nums">{taxSummary.taxFree.toLocaleString()}</span></span>
            <span>총매입액: <span className="font-bold text-pos-text tabular-nums">{taxSummary.totalPurchase.toLocaleString()}</span></span>
          </div>
        </div>

        {/* ─── Grids ─── */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Left: modify list */}
          <div className="w-40 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden shrink-0">
            <div className="grid grid-cols-[1fr_80px] gap-1 px-2 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
              <span>유형</span>
              <span className="text-right">금액</span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {modifyHeaders.map((hdr) => (
                <button
                  key={hdr.id}
                  type="button"
                  onClick={() => handleSelectModify(hdr.id)}
                  className={`w-full grid grid-cols-[1fr_80px] gap-1 px-2 py-2 text-xs text-left cursor-pointer transition-colors ${
                    selectedModifyId === hdr.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  <span className="truncate">
                    {MODIFY_TYPE_OPTIONS.find((o) => o.value === hdr.modifyType)?.label ?? hdr.modifyType}
                  </span>
                  <span className="text-right tabular-nums">{hdr.totalAmount.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: detail section */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {/* Barcode input + actions */}
            <div className="flex items-center gap-2">
              <TextInput
                value={barcodeInput}
                onChange={setBarcodeInput}
                placeholder="바코드/상품명 (F5)"
              />
              <Button variant="secondary" size="sm" onClick={handleItemSearch}>상품조회</Button>
              <Button variant="danger" size="sm" onClick={handleItemCancel} disabled={!selectedDetailId}>상품취소</Button>
            </div>

            {/* Detail grid */}
            <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
                <span>상품명</span>
                <span className="text-right">수량</span>
                <span className="text-right">단가</span>
                <span className="text-right">금액</span>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {detailRows.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                    수정 항목이 없습니다
                  </div>
                ) : (
                  detailRows.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelectedDetailId(row.id)}
                      className={`w-full grid grid-cols-[1fr_60px_80px_80px] gap-2 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                        selectedDetailId === row.id
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
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
