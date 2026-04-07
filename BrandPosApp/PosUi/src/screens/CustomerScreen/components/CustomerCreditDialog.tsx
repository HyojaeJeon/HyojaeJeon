'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import TextInput from '@shared/ui/atoms/TextInput';
import Button from '@shared/ui/atoms/Button';

/**
 * CustomerCreditDialog -- 킵 상품 관리 모달 (레거시 IDD_CUST_KEEP)
 *
 * 킵(보관) 상품 현금/카드 등록, 사용/취소/환불, 보유 목록과 이력 조회.
 * CUSTINPUT(고객 관리 메인)에서 호출.
 *
 * Bridge Commands: CUSTOMER:ADD_KEEP, CUSTOMER:USE_KEEP, CUSTOMER:GET_KEEP_ITEMS
 * UseCases: AddKeepItemUseCase, UseKeepItemUseCase, GetCustomerKeepItemsUseCase
 */

// ─── Types ───

interface KeepItem {
  keepId: string;
  itemName: string;
  qty: number;
  amount: number;
  balance: number;
}

interface KeepHistory {
  date: string;
  type: string;
  itemName: string;
  amount: number;
}

interface KeepPayment {
  date: string;
  payType: string;
  amount: number;
}

interface CustomerCreditDialogProps {
  open: boolean;
  customerId: string;
  onClose: () => void;
}

// ─── Stub Data ───

const STUB_KEEP_ITEMS: KeepItem[] = [
  { keepId: 'K001', itemName: '소주', qty: 3, amount: 15000, balance: 10000 },
  { keepId: 'K002', itemName: '맥주', qty: 5, amount: 25000, balance: 25000 },
];

const STUB_HISTORY: KeepHistory[] = [
  { date: '2026-04-01', type: '등록', itemName: '소주', amount: 15000 },
  { date: '2026-04-02', type: '사용', itemName: '소주', amount: -5000 },
];

const STUB_PAYMENTS: KeepPayment[] = [
  { date: '2026-04-01', payType: '현금', amount: 15000 },
  { date: '2026-04-01', payType: '카드', amount: 25000 },
];

// ─── Keypad Keys ───

const KEYPAD_KEYS = [
  ['7', '8', '9', 'BS'],
  ['4', '5', '6', 'CLR'],
  ['1', '2', '3', '0'],
  ['만', '천', '확인', ''],
];

// ─── Component ───

export default function CustomerCreditDialog({
  open,
  customerId,
  onClose,
}: CustomerCreditDialogProps) {
  const [keepAmount, setKeepAmount] = useState('');
  const [keepItems] = useState<KeepItem[]>(STUB_KEEP_ITEMS);
  const [history] = useState<KeepHistory[]>(STUB_HISTORY);
  const [payments] = useState<KeepPayment[]>(STUB_PAYMENTS);
  const [selectedKeepId, setSelectedKeepId] = useState<string | null>(null);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Keypad Handler ───

  const handleKeypad = useCallback((key: string) => {
    if (key === 'BS') {
      setKeepAmount((prev) => prev.slice(0, -1));
    } else if (key === 'CLR') {
      setKeepAmount('');
    } else if (key === '만') {
      setKeepAmount((prev) => String(Number(prev || '0') + 10000));
    } else if (key === '천') {
      setKeepAmount((prev) => String(Number(prev || '0') + 1000));
    } else if (key === '확인') {
      // No-op: confirm handled by register buttons
    } else if (key) {
      setKeepAmount((prev) => prev + key);
    }
  }, []);

  // ─── Action Handlers ───

  const handleCashRegister = useCallback(async () => {
    const amount = Number(keepAmount);
    if (!amount || amount <= 0) return;
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // TODO: CUSTOMER:ADD_KEEP Bridge command via RTK Query useAddKeepItemMutation
      // - idempotencyKey: `CUSTOMER:ADD_KEEP:<uuid>`
      // - params: { customerId, amount, payType: 'CASH' }
      console.log('[CustomerCreditDialog] CUSTOMER:ADD_KEEP (CASH)', { customerId, amount });
      setKeepAmount('');
    } catch {
      // TODO: handle INVALID_AMOUNT error
    } finally {
      setIsProcessing(false);
    }
  }, [keepAmount, customerId, isProcessing]);

  const handleCardRegister = useCallback(async () => {
    const amount = Number(keepAmount);
    if (!amount || amount <= 0) return;
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // TODO: CUSTOMER:ADD_KEEP Bridge command via RTK Query useAddKeepItemMutation
      // - idempotencyKey: `CUSTOMER:ADD_KEEP:<uuid>`
      // - params: { customerId, amount, payType: 'CARD' }
      // - Note: card payment requires external sync wait
      console.log('[CustomerCreditDialog] CUSTOMER:ADD_KEEP (CARD)', { customerId, amount });
      setKeepAmount('');
    } catch {
      // TODO: handle INVALID_AMOUNT or card approval error
    } finally {
      setIsProcessing(false);
    }
  }, [keepAmount, customerId, isProcessing]);

  const handleVoidSale = useCallback(async () => {
    if (selectedHistoryIdx === null) return;
    // TODO: CUSTOMER:USE_KEEP Bridge command -> UseKeepItemUseCase (void)
    // - idempotencyKey: `CUSTOMER:USE_KEEP:<uuid>`
    console.log('[CustomerCreditDialog] void sale', selectedHistoryIdx);
  }, [selectedHistoryIdx]);

  const handleCashRefund = useCallback(async () => {
    const amount = Number(keepAmount);
    if (!amount || amount <= 0) return;
    // TODO: CUSTOMER:USE_KEEP Bridge command -> UseKeepItemUseCase (refund)
    // - idempotencyKey: `CUSTOMER:USE_KEEP:<uuid>`
    // - params: { customerId, keepItemId, useAmount }
    console.log('[CustomerCreditDialog] cash refund', { customerId, amount });
  }, [keepAmount, customerId]);

  const handleReprint = useCallback(() => {
    // TODO: Device/Printer async print
    console.log('[CustomerCreditDialog] reprint receipt');
  }, []);

  const handleClose = useCallback(() => {
    setKeepAmount('');
    setSelectedKeepId(null);
    setSelectedHistoryIdx(null);
    onClose();
  }, [onClose]);

  // ─── Helpers ───

  const fmt = (n: number) => n.toLocaleString();

  // ─── Render ───

  return (
    <FullScreenPanel
      open={open}
      onClose={handleClose}
      title="킵 상품 관리"
      footer={
        <div className="flex items-center gap-2 w-full">
          {/* TODO: P2 - 현금영수증, 미수금 (conditional) */}
          <div className="flex-1" />
          <Button variant="ghost" size="md" onClick={handleClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Top: Keep Items + Amount Input + Keypad */}
        <div className="shrink-0 flex gap-3">
          {/* Left: Keep Items Grid */}
          <div className="flex-1 border border-pos-border rounded-pos-sm overflow-hidden">
            <div className="bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
              보유 킵 목록
            </div>
            <div className="max-h-[140px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {keepItems.map((item) => (
                <div
                  key={item.keepId}
                  onClick={() => setSelectedKeepId(item.keepId)}
                  className={`flex items-center justify-between px-2 py-1 border-b border-pos-border cursor-pointer
                    ${selectedKeepId === item.keepId ? 'bg-primary-50' : 'active:bg-pos-surface'}
                  `}
                >
                  <span className="text-sm text-pos-text">{item.itemName}</span>
                  <span className="text-sm text-pos-text tabular-nums">{item.qty}개</span>
                  <span className="text-sm text-pos-text tabular-nums">{fmt(item.balance)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Amount + Actions + Keypad */}
          <div className="w-[200px] flex flex-col gap-2">
            <TextInput
              label="킵 금액"
              value={keepAmount}
              onChange={setKeepAmount}
              placeholder="0"
              fullWidth
            />
            <div className="grid grid-cols-2 gap-1">
              <Button variant="primary" size="sm" onClick={handleCashRegister} disabled={isProcessing}>
                현금등록
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCardRegister} disabled={isProcessing}>
                카드등록
              </Button>
              <Button variant="outline" size="sm" onClick={handleCashRefund}>
                현금환불
              </Button>
              {/* TODO: P2 - 일괄등록 (conditional) */}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-4 gap-1">
              {KEYPAD_KEYS.flat().map((key, i) =>
                key ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleKeypad(key)}
                    className="h-touch rounded-pos-btn bg-pos-surface border border-pos-border text-sm font-semibold text-pos-text cursor-pointer active:bg-pos-border active:scale-[0.95]"
                  >
                    {key}
                  </button>
                ) : (
                  <div key={i} />
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom: History Grids */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Keep History */}
          <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
            <div className="bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border flex items-center justify-between">
              <span>등록/사용 이력</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleVoidSale}>매출취소</Button>
                <Button variant="ghost" size="sm" onClick={handleReprint}>재인쇄</Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {history.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedHistoryIdx(idx)}
                  className={`flex items-center justify-between px-2 py-1 border-b border-pos-border cursor-pointer
                    ${selectedHistoryIdx === idx ? 'bg-primary-50' : 'active:bg-pos-surface'}
                  `}
                >
                  <span className="text-xs text-pos-text-muted">{h.date}</span>
                  <span className="text-xs text-pos-text">{h.type}</span>
                  <span className="text-xs text-pos-text">{h.itemName}</span>
                  <span className="text-xs text-pos-text tabular-nums">{fmt(h.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="w-[200px] flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
            <div className="bg-pos-surface px-2 py-1 text-xs font-semibold text-pos-text-muted border-b border-pos-border">
              결제 이력
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {payments.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1 border-b border-pos-border"
                >
                  <span className="text-xs text-pos-text-muted">{p.date}</span>
                  <span className="text-xs text-pos-text">{p.payType}</span>
                  <span className="text-xs text-pos-text tabular-nums">{fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
