'use client';

import { useState, useCallback, useEffect } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ────────────────────────────────────────────
type PurchaseType = 'general' | 'consignment';
type SettlementType = 'cash' | 'credit';
type PurchaseStatus = 'draft' | 'confirmed' | 'deleted';

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseHeader {
  id: string;
  date: string;
  supplierName: string;
  totalAmount: number;
  status: PurchaseStatus;
}

interface PurchaseDetailRow {
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

interface PurchaseManagerDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_PURCHASES: PurchaseHeader[] = Array.from({ length: 6 }, (_, i) => ({
  id: `pur-${i + 1}`,
  date: `2026-04-0${i + 1}`,
  supplierName: `거래처 ${(i % 3) + 1}`,
  totalAmount: (i + 1) * 50000,
  status: i === 0 ? 'draft' : 'confirmed',
}));

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  draft: '작성중',
  confirmed: '확정',
  deleted: '삭제',
};

const STATUS_COLOR: Record<PurchaseStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  deleted: 'bg-red-100 text-red-800',
};

// ─── Component ────────────────────────────────────────
export default function PurchaseManagerDialog({
  open,
  onClose,
  onSaved,
}: PurchaseManagerDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  // Filter state
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [purchaseDate, setPurchaseDate] = useState<string>(today);

  // Form state
  const [supplier1, setSupplier1] = useState<Supplier | null>(null);
  const [supplier2, setSupplier2] = useState<Supplier | null>(null);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('general');
  const [settlementType, setSettlementType] = useState<SettlementType>('cash');
  const [memo, setMemo] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  // Grid state
  const [purchases] = useState<PurchaseHeader[]>(STUB_PURCHASES);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [detailRows, setDetailRows] = useState<PurchaseDetailRow[]>([]);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  // Computed
  const taxSummary: TaxSummary = {
    tax: detailRows.reduce((s, r) => s + Math.floor(r.amount * 0.1), 0),
    vat: detailRows.reduce((s, r) => s + Math.floor(r.amount * 0.1), 0),
    taxFree: 0,
    totalPurchase: detailRows.reduce((s, r) => s + r.amount, 0),
  };

  const selectedPurchase = purchases.find((p) => p.id === selectedPurchaseId);

  // ─── Handlers ─────────────────────────────────────
  const handleNew = useCallback(() => {
    // TODO: reset form for new purchase
    setSelectedPurchaseId(null);
    setDetailRows([]);
    setMemo('');
    setBarcodeInput('');
    setSupplier1(null);
    setSupplier2(null);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: PURCHASE:CREATE bridge call with idempotencyKey
    // Payload: { supplierId, items, date, purchaseType, settlementType, memo }
    onSaved?.();
  }, [onSaved]);

  const handleDelete = useCallback(() => {
    if (!selectedPurchaseId) return;
    // TODO: PURCHASE:MODIFY bridge call for deletion
  }, [selectedPurchaseId]);

  const handleSearch = useCallback(() => {
    // TODO: PURCHASE:GET_LIST bridge call with { startDate, endDate }
  }, [startDate, endDate]);

  const handleSelectSupplier1 = useCallback(() => {
    // TODO: PURCHASE:SEARCH bridge call for supplier selection
    setSupplier1({ id: 'sup-1', name: '(주)테스트거래처' });
  }, []);

  const handleSelectSupplier2 = useCallback(() => {
    // TODO: PURCHASE:SEARCH bridge call for supplier2 selection
    setSupplier2({ id: 'sup-2', name: '부거래처' });
  }, []);

  const handleItemSearch = useCallback(() => {
    // TODO: PURCHASE:SEARCH bridge call with { type: "item", keyword: barcodeInput }
    if (!barcodeInput.trim()) return;
    const newRow: PurchaseDetailRow = {
      id: `det-${Date.now()}`,
      itemId: `item-stub`,
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
    // TODO: PURCHASE:MODIFY bridge call for item removal
    setDetailRows((prev) => prev.filter((r) => r.id !== selectedDetailId));
    setSelectedDetailId(null);
  }, [selectedDetailId]);

  const handleBarcodePrint = useCallback(() => {
    // TODO: barcode print via Device/Printer (async post-process)
  }, []);

  const handleSelectPurchase = useCallback((purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    // TODO: fetch purchase detail via purchaseApi.getPurchaseDetail
    setDetailRows([
      { id: 'det-1', itemId: 'i1', itemName: '상품 A', barcode: '8801234', qty: 5, unitPrice: 3000, amount: 15000 },
      { id: 'det-2', itemId: 'i2', itemName: '상품 B', barcode: '8801235', qty: 3, unitPrice: 5000, amount: 15000 },
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

  const PURCHASE_TYPE_OPTIONS: { value: PurchaseType; label: string }[] = [
    { value: 'general', label: '일반' },
    { value: 'consignment', label: '위탁' },
  ];

  const SETTLEMENT_TYPE_OPTIONS: { value: SettlementType; label: string }[] = [
    { value: 'cash', label: '현금' },
    { value: 'credit', label: '외상' },
  ];

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="발주 관리"
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
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={!selectedPurchaseId}>삭제</Button>
        </div>

        {/* ─── Filter / Form section ─── */}
        <div className="shrink-0 flex flex-col gap-2 text-xs">
          {/* Row 1: dates + status */}
          <div className="flex items-center gap-3 h-9 flex-wrap">
            <DatePicker value={startDate} onChange={setStartDate} />
            <span className="text-pos-text-muted">~</span>
            <DatePicker value={endDate} onChange={setEndDate} />
            <DatePicker value={purchaseDate} onChange={setPurchaseDate} />
            {selectedPurchase && (
              <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${STATUS_COLOR[selectedPurchase.status]}`}>
                {STATUS_LABEL[selectedPurchase.status]}
              </span>
            )}
          </div>

          {/* Row 2: suppliers */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-pos-text-muted">거래처1:</span>
            <span className="font-semibold">{supplier1?.name ?? '-'}</span>
            <Button variant="secondary" size="sm" onClick={handleSelectSupplier1}>선택</Button>
            <Button variant="secondary" size="sm" onClick={handleSearch}>조회</Button>
            <span className="text-pos-text-muted ml-4">거래처2:</span>
            <span className="font-semibold">{supplier2?.name ?? '-'}</span>
            <Button variant="secondary" size="sm" onClick={handleSelectSupplier2}>선택</Button>
          </div>

          {/* Row 3: type radios */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-pos-text-muted">매출유형:</span>
              {PURCHASE_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="purchaseType"
                    value={opt.value}
                    checked={purchaseType === opt.value}
                    onChange={() => setPurchaseType(opt.value)}
                    className="accent-primary-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-pos-text-muted">정산:</span>
              {SETTLEMENT_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="settlementType"
                    value={opt.value}
                    checked={settlementType === opt.value}
                    onChange={() => setSettlementType(opt.value)}
                    className="accent-primary-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Row 4: memo + tax summary */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-pos-text-muted">메모:</span>
            <TextInput value={memo} onChange={setMemo} placeholder="메모 입력" />
          </div>
          <div className="flex items-center gap-4 text-2xs text-pos-text-muted">
            <span>세액: <span className="font-semibold text-pos-text tabular-nums">{taxSummary.tax.toLocaleString()}</span></span>
            <span>부가세: <span className="font-semibold text-pos-text tabular-nums">{taxSummary.vat.toLocaleString()}</span></span>
            <span>면세: <span className="font-semibold text-pos-text tabular-nums">{taxSummary.taxFree.toLocaleString()}</span></span>
            <span>총매입액: <span className="font-bold text-pos-text tabular-nums">{taxSummary.totalPurchase.toLocaleString()}</span></span>
          </div>
        </div>

        {/* ─── Grids ─── */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Left: purchase list */}
          <div className="w-40 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden shrink-0">
            <div className="grid grid-cols-[1fr_80px] gap-1 px-2 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
              <span>거래처</span>
              <span className="text-right">금액</span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {purchases.map((pur) => (
                <button
                  key={pur.id}
                  type="button"
                  onClick={() => handleSelectPurchase(pur.id)}
                  className={`w-full grid grid-cols-[1fr_80px] gap-1 px-2 py-2 text-xs text-left cursor-pointer transition-colors ${
                    selectedPurchaseId === pur.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{pur.supplierName}</span>
                  <span className="text-right tabular-nums">{pur.totalAmount.toLocaleString()}</span>
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
              <Button variant="secondary" size="sm" onClick={handleBarcodePrint}>바코드인쇄</Button>
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
                    발주 항목이 없습니다
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
