'use client';

/**
 * MartSellDialog (SCR-MARTSELL-DLG)
 *
 * Mart/retail sales main screen. Barcode scan-based sales + instant payment.
 * Unlike restaurant flow (table->order->payment), this is barcode->order->instant-pay.
 * May be OrderScreen mart-mode variant or standalone MartSellScreen.
 *
 * Legacy: IDD_MARTSELL_DLG (175), 512x383 DLU, 33 controls
 * Shared UI: ScrollableList, Button, TextInput, NumberInput
 */

import { useState, useMemo, useRef } from 'react';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import NumberInput from '@shared/ui/atoms/NumberInput';

// --- Types ---

interface MartSellDialogProps {
  onClose: () => void;
}

interface OrderItem {
  itemId: string;
  barcode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderSummary {
  orderAmount: number;
  discountAmount: number;
  totalAmount: number;
  receivedAmount: number;
  changeAmount: number;
  itemCount: number;
}

// --- Component ---

export default function MartSellDialog({ onClose }: MartSellDialogProps) {
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [quantityValue, setQuantityValue] = useState(1);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);

  // Stub data -- will be replaced by orderApi / salesApi RTK Query hooks
  const orderItems: OrderItem[] = [];
  const summary: OrderSummary = {
    orderAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    receivedAmount: 0,
    changeAmount: 0,
    itemCount: 0,
  };

  // Stub metadata
  const dateStr = ''; // TODO: systemApi.getConfig
  const timeStr = ''; // TODO: systemApi.getConfig
  const posNo = ''; // TODO: systemApi.getConfig
  const staffName = ''; // TODO: systemApi.getStaffList
  const salesCount = 0; // TODO: salesApi.getSalesSummary

  // --- Handlers (stubs) ---

  const handleBarcodeSubmit = () => {
    if (!barcodeValue.trim()) return;
    // TODO: Bridge ORDER:COMPLETE { orderSlipId, barcode, quantity }
    //       -> CompleteOrderUseCase -> ItemMgr barcode lookup -> OrderMgr add item
    //       -> SQLite TX -> PosRealTimeSender ORDER_ITEM_CHANGED
    //       Error: BARCODE_NOT_FOUND
    setBarcodeValue('');
    barcodeInputRef.current?.focus();
  };

  const handleQuantityIncrease = () => {
    // TODO: Bridge ORDER:COMPLETE (increase quantity for selected item)
  };

  const handleCustomerSearch = () => {
    // TODO: Bridge CUSTOMER:SEARCH { phone, searchType: "INDIVIDUAL" }
    //       -> SearchCustomerUseCase -> CustMgr
  };

  const handleItemSearch = () => {
    // TODO: Bridge ORDER:COMPLETE (item search mode) -> ItemMgr search
  };

  const handleTeamSearch = () => {
    // TODO: Bridge CUSTOMER:SEARCH { phone, searchType: "TEAM" }
    //       -> SearchCustomerUseCase (P2, conditional)
  };

  const handlePrintReceipt = () => {
    // TODO: Bridge SALES:REPRINT { sellSlipId, printType: "RECEIPT" }
    //       -> Device/Printer (async post-processing)
  };

  const handleAttendance = () => {
    // TODO: Open AttendanceDialog (admin/authorized staff only)
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-full bg-pos-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-pos-border bg-pos-surface">
        <span className="text-xs">{dateStr || '--/--/----'}</span>
        <span className="text-xs">{timeStr || '--:--'}</span>
        <span className="text-xs">POS: {posNo || '-'}</span>
        <span className="text-xs">Staff: {staffName || '-'}</span>
        <span className="text-xs">Sales: {salesCount}</span>
        <div className="flex-1" />
        <Button onClick={handleAttendance}>Attendance</Button>
        <Button onClick={onClose}>Close</Button>
      </div>

      {/* Barcode input row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-pos-border">
        <TextInput
          value={barcodeValue}
          onChange={(v) => setBarcodeValue(v)}
          placeholder="Scan barcode..."
          className="flex-1"
        />
        <NumberInput value={String(quantityValue)} onChange={(v) => setQuantityValue(Number(v) || 1)} min={1} />
        <Button onClick={handleBarcodeSubmit}>Enter</Button>
        <Button onClick={handleCustomerSearch}>Customer</Button>
        <Button onClick={handleItemSearch}>Item Search</Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Order items grid */}
        <div className="flex-1 overflow-y-auto border-r border-pos-border">
          <table className="w-full text-sm">
            <thead className="bg-pos-surface sticky top-0">
              <tr>
                <th className="text-left px-3 py-2">Item</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-pos-text-secondary">
                    Scan a barcode to start
                  </td>
                </tr>
              ) : (
                orderItems.map((item, idx) => (
                  <tr
                    key={item.itemId}
                    className={`cursor-pointer hover:bg-pos-surface ${selectedItemIdx === idx ? 'bg-pos-primary/10' : ''}`}
                    onClick={() => setSelectedItemIdx(idx)}
                  >
                    <td className="px-3 py-2">{item.itemName}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{item.unitPrice.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right side panels */}
        <div className="w-56 flex flex-col shrink-0">
          {/* Order summary */}
          <div className="p-3 border-b border-pos-border space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Order Amount</span>
              <span className="font-bold">{summary.orderAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>{summary.discountAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{summary.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Received</span>
              <span>{summary.receivedAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-pos-primary font-bold">
              <span>Change</span>
              <span>{summary.changeAmount.toLocaleString()}</span>
            </div>
            <div className="text-xs text-pos-text-secondary">
              Items: {summary.itemCount}
            </div>
          </div>

          {/* Payment quick view (stub) */}
          <div className="flex-1 overflow-y-auto p-2 border-b border-pos-border">
            <h4 className="text-xs font-bold mb-1">Payment History</h4>
            <div className="text-xs text-pos-text-secondary text-center py-4">
              {/* TODO: salesApi.getSellDetails -> PaymentQuickView */}
              No payment records
            </div>
          </div>

          {/* Customer quick view (stub) */}
          <div className="p-2">
            <h4 className="text-xs font-bold mb-1">Customer Info</h4>
            <div className="text-xs text-pos-text-secondary text-center py-2">
              {/* TODO: customerApi.getCustomer -> CustomerQuickView */}
              No customer selected
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-pos-border">
        <Button onClick={handleQuantityIncrease} disabled={selectedItemIdx === null}>
          +Qty
        </Button>
        <Button onClick={handlePrintReceipt}>
          Receipt
        </Button>
        <div className="flex-1" />
      </div>
    </div>
  );
}
