'use client';

/**
 * CashManagementDialog (SCR-CATCASHMGR)
 *
 * Cash receipt category management screen.
 * Card payment amount display, receipt type selection (consumer deduction / business expense),
 * card number input, sign pad / manual approval number input (conditional).
 * Card approval uses synchronous-wait pattern. NOT Outbox target.
 *
 * Legacy: IDD_CATCASHMGR_DLG (222), 450x337 DLU, 18 controls
 * Shared UI: TextInput (card number), Checkbox (item print, customer save), DataGrid (conditional)
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Checkbox from '@shared/ui/atoms/Checkbox';

// --- Types ---

interface CashManagementDialogProps {
  open: boolean;
  onClose: () => void;
  receivedAmount?: number;
  changeAmount?: number;
  cardAmount?: number;
}

type ReceiptType = 'CONSUMER' | 'BUSINESS';

interface CashCategoryState {
  receiptType: ReceiptType | null;
  cardNumber: string;
  itemPrint: boolean;
  selfAuth: boolean;
  customerSaveNum: boolean;
  approvalNumber: string;
  originalCardNumber: string;
  approvalDetails: string;
  deviceStatus: string;
}

// --- Component ---

export default function CashManagementDialog({
  open,
  onClose,
  receivedAmount = 0,
  changeAmount = 0,
  cardAmount = 0,
}: CashManagementDialogProps) {
  const [state, setState] = useState<CashCategoryState>({
    receiptType: null,
    cardNumber: '',
    itemPrint: false,
    selfAuth: false,
    customerSaveNum: false,
    approvalNumber: '',
    originalCardNumber: '',
    approvalDetails: '',
    deviceStatus: '',
  });

  // Conditional visibility (feature flags / device presence)
  const showSignPad = false; // TODO: systemApi.getDeviceStatus -> sign pad connected
  const showManualApproval = false; // TODO: config-based
  const showSelfAuth = false; // TODO: config-based
  const showCustomerSave = false; // TODO: config-based
  const showItemGrid = false; // TODO: special mode only

  const updateState = <K extends keyof CashCategoryState>(field: K, value: CashCategoryState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  // --- Handlers (stubs) ---

  const handleSave = () => {
    // TODO: Bridge CASH:UPDATE_CATEGORY { categoryId, name, type }
    //       -> UpdateCashCategoryUseCase
    //       -> requestId + idempotencyKey check
    //       -> If card approval needed: synchronous wait for external API
    //       -> AccountingMgr.UpdateCashCategory() -> SQLite TX
    //       -> Ledger SUCCEEDED + Outbox (non-card data only)
    //       -> PosRealTimeSender: CASH:CATEGORY_UPDATED
  };

  const handleConsumerDeduction = () => {
    updateState('receiptType', 'CONSUMER');
    // TODO: Bridge CASH:UPDATE_CATEGORY with type=CONSUMER
  };

  const handleBusinessExpense = () => {
    updateState('receiptType', 'BUSINESS');
    // TODO: Bridge CASH:UPDATE_CATEGORY with type=BUSINESS
  };

  const handleSignPad = () => {
    // TODO: Device/CardReader sign pad interaction
    //       Async device I/O, Device Error rules apply (code-based fields)
  };

  const handleManualApproval = () => {
    // TODO: Open manual approval number input dialog
  };

  const handleSelfAuth = () => {
    updateState('selfAuth', true);
    // TODO: Bridge CASH:UPDATE_CATEGORY with selfAuth flag
  };

  // --- Render ---

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="Cash Receipt Management"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Top bar: item print checkbox */}
        <div className="shrink-0 flex items-center gap-2 h-9">
          <label className="flex items-center gap-1 text-sm">
            <Checkbox
              checked={state.itemPrint}
              onChange={() => updateState('itemPrint', !state.itemPrint)}
            />
            Item Print
          </label>
        </div>

        {/* Item grid (conditional) */}
        {showItemGrid && (
          <div className="shrink-0">
            <div className="border border-pos-border rounded h-24 flex items-center justify-center text-pos-text-secondary text-sm">
              {/* TODO: shared/ui/organisms/DataGrid */}
              Item grid (conditional)
            </div>
          </div>
        )}

        {/* Amount display */}
        <div className="shrink-0 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-pos-text-secondary">Received</div>
            <div className="text-lg font-bold">{receivedAmount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-pos-text-secondary">Change</div>
            <div className="text-lg font-bold">{changeAmount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-pos-text-secondary">Card Amount</div>
            <div className="text-lg font-bold text-pos-primary">{cardAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Card number input */}
        <div className="shrink-0 flex items-center gap-3 h-9">
          <label className="text-sm font-medium w-24">Card No.</label>
          <TextInput
            value={state.cardNumber}
            onChange={(v: string) => updateState('cardNumber', v)}
            className="flex-1"
            placeholder="Enter card number"
          />
        </div>

        {/* Conditional action buttons */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          {showSignPad && (
            <Button onClick={handleSignPad}>Sign Pad</Button>
          )}
          {showManualApproval && (
            <Button onClick={handleManualApproval}>Manual Approval</Button>
          )}
          {showSelfAuth && (
            <Button onClick={handleSelfAuth}>Self Auth</Button>
          )}
        </div>

        {/* Receipt type buttons */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <Button
            onClick={handleConsumerDeduction}
            className={`w-full py-3 ${state.receiptType === 'CONSUMER' ? 'bg-pos-primary text-white' : ''}`}
          >
            {/* i18n: cash.consumerDeduction */}
            Consumer Deduction
          </Button>
          <Button
            onClick={handleBusinessExpense}
            className={`w-full py-3 ${state.receiptType === 'BUSINESS' ? 'bg-pos-primary text-white' : ''}`}
          >
            {/* i18n: cash.businessExpense */}
            Business Expense
          </Button>
          {showCustomerSave && (
            <label className="flex items-center gap-2 text-sm pt-1">
              <Checkbox
                checked={state.customerSaveNum}
                onChange={() => updateState('customerSaveNum', !state.customerSaveNum)}
              />
              Save Customer Number
            </label>
          )}
        </div>

        {/* Status footer */}
        <div className="shrink-0 text-xs text-pos-text-secondary flex flex-col gap-1">
          <div>Original Card: {state.originalCardNumber || '-'}</div>
          <div>Approval Details: {state.approvalDetails || '-'}</div>
          <div>Approval No: {state.approvalNumber || '-'}</div>
          <div>Device: {state.deviceStatus || '-'}</div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
