'use client';

/**
 * AutoWorkDialog (SCR-AUTOWORK)
 *
 * Daily close / settlement screen.
 * Shows sales summary, payment breakdown, pending items, cash status,
 * denomination input (5 notes + 4 coins), and auto-calculated total.
 *
 * Legacy: IDD_AUTOWORK (132), 509x403 DLU, 29 controls
 * Shared UI: DataTable x4, NumberInput x9, AmountLabel, Button
 */

import { useState, useMemo } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import NumberInput from '@shared/ui/atoms/NumberInput';

// --- Types ---

interface AutoWorkDialogProps {
  open: boolean;
  onClose: () => void;
}

// Denomination definitions (Korean currency)
const NOTE_DENOMINATIONS = [
  { label: '50,000', value: 50000 },
  { label: '10,000', value: 10000 },
  { label: '5,000', value: 5000 },
  { label: '1,000', value: 1000 },
  { label: '100', value: 100 },
];

const COIN_DENOMINATIONS = [
  { label: '500', value: 500 },
  { label: '100', value: 100 },
  { label: '50', value: 50 },
  { label: '10', value: 10 },
];

// --- Component ---

export default function AutoWorkDialog({ open, onClose }: AutoWorkDialogProps) {
  // Denomination counts (local state)
  const [noteCounts, setNoteCounts] = useState<number[]>(new Array(NOTE_DENOMINATIONS.length).fill(0));
  const [coinCounts, setCoinCounts] = useState<number[]>(new Array(COIN_DENOMINATIONS.length).fill(0));

  // Stub metadata -- will be replaced by systemApi.getConfig / accountingApi
  const staffName = ''; // TODO: systemApi.getConfig (logged-in staff)
  const businessDate = ''; // TODO: systemApi.getConfig
  const closeTime = ''; // TODO: systemApi.getConfig
  const adjustmentNo = ''; // TODO: accountingApi.getAdjustmentNo

  // Auto-calculated total
  const totalAmount = useMemo(() => {
    const noteTotal = noteCounts.reduce(
      (sum, count, idx) => sum + count * NOTE_DENOMINATIONS[idx].value,
      0,
    );
    const coinTotal = coinCounts.reduce(
      (sum, count, idx) => sum + count * COIN_DENOMINATIONS[idx].value,
      0,
    );
    return noteTotal + coinTotal;
  }, [noteCounts, coinCounts]);

  // --- Handlers (stubs) ---

  const handleSave = () => {
    // TODO: Bridge SYSTEM:AUTO_CLOSE { closeDate, cashAmount, cardAmount }
    //       -> AutoCloseBusinessUseCase -> Outbox sync
  };

  const handlePrint = () => {
    // TODO: Bridge SYSTEM:GET_CONTENT -> Device/Printer (close receipt)
  };

  const handleCashDeposit = () => {
    // TODO: Bridge ACCOUNTING:CASH_IN { amount, reason, staffId }
    //       -> CashInOutUseCase
  };

  const updateNoteCount = (index: number, value: number) => {
    setNoteCounts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const updateCoinCount = (index: number, value: number) => {
    setCoinCounts((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // --- Render ---

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="accounting.autoClose.title"
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
          <Button variant="secondary" size="sm" onClick={handleCashDeposit}>Cash Deposit</Button>
          <Button variant="secondary" size="sm" onClick={handlePrint}>Close Print</Button>
          <div className="flex-1" />
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Header info */}
        <div className="shrink-0 flex items-center gap-4 text-sm">
          <span>{/* i18n: accounting.staff */}Staff: {staffName || '-'}</span>
          <span>{/* i18n: accounting.date */}Date: {businessDate || '-'}</span>
          <span>{/* i18n: accounting.time */}Time: {closeTime || '-'}</span>
          <span>{/* i18n: accounting.adjustmentNo */}No: {adjustmentNo || '-'}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex min-h-0 gap-4">
          {/* Left column: Grids */}
          <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
            {/* Sales summary grid */}
            <div className="border border-pos-border rounded p-2">
              <h3 className="text-xs font-bold mb-1">{/* i18n: accounting.salesSummary */}Sales Summary</h3>
              <div className="h-24 flex items-center justify-center text-pos-text-secondary text-sm">
                {/* TODO: accountingApi.getDailySummary -> DataTable */}
                No data
              </div>
            </div>

            {/* Payment breakdown grid */}
            <div className="border border-pos-border rounded p-2">
              <h3 className="text-xs font-bold mb-1">{/* i18n: accounting.paymentBreakdown */}Payment Breakdown</h3>
              <div className="h-24 flex items-center justify-center text-pos-text-secondary text-sm">
                {/* TODO: accountingApi.getPaymentBreakdown -> DataTable */}
                No data
              </div>
            </div>

            {/* Cash status grid */}
            <div className="border border-pos-border rounded p-2">
              <h3 className="text-xs font-bold mb-1">{/* i18n: accounting.cashStatus */}Cash Status</h3>
              <div className="h-24 flex items-center justify-center text-pos-text-secondary text-sm">
                {/* TODO: accountingApi.getCashStatus -> DataTable */}
                No data
              </div>
            </div>

            {/* Pending items grid */}
            <div className="border border-pos-border rounded p-2">
              <h3 className="text-xs font-bold mb-1">{/* i18n: accounting.pendingItems */}Pending Items</h3>
              <div className="h-24 flex items-center justify-center text-pos-text-secondary text-sm">
                {/* TODO: accountingApi.getPendingItems -> DataTable */}
                No data
              </div>
            </div>
          </div>

          {/* Right column: Denomination input */}
          <div className="w-64 shrink-0 flex flex-col gap-3 min-h-0 overflow-y-auto">
            {/* Notes */}
            <div className="border border-pos-border rounded p-2">
              <h3 className="text-xs font-bold mb-2">{/* i18n: accounting.notes */}Notes</h3>
              <div className="flex flex-col gap-1">
                {NOTE_DENOMINATIONS.map((denom, idx) => (
                  <div key={denom.label} className="flex items-center gap-2">
                    <span className="w-16 text-right text-sm">{denom.label}</span>
                    <NumberInput
                      value={String(noteCounts[idx])}
                      onChange={(val) => updateNoteCount(idx, Number(val))}
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Coins */}
            <div className="border border-pos-border rounded p-2">
              <h3 className="text-xs font-bold mb-2">{/* i18n: accounting.coins */}Coins</h3>
              <div className="flex flex-col gap-1">
                {COIN_DENOMINATIONS.map((denom, idx) => (
                  <div key={denom.label} className="flex items-center gap-2">
                    <span className="w-16 text-right text-sm">{denom.label}</span>
                    <NumberInput
                      value={String(coinCounts[idx])}
                      onChange={(val) => updateCoinCount(idx, Number(val))}
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Total (read-only) */}
            <div className="border border-pos-border rounded p-3 text-center">
              <span className="text-xs text-pos-text-secondary">{/* i18n: accounting.total */}Total</span>
              <div className="text-lg font-bold">{totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
