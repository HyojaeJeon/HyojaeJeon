'use client';

/**
 * ContentView2Dialog (SCR-CONTENTVIEW2)
 *
 * MERGED into contentview.md. This is the compact variant of ContentViewer.
 * Uses shared/ui/organisms/ContentViewer with size="compact" prop.
 *
 * Legacy: IDD_CONTENTVIEW2 (164), 414x327 DLU, 30 controls
 * The compact version does NOT have ActiveX WebBrowser.
 * Same data flow as ContentView (PosRealTimeSender -> props).
 *
 * This dialog is a thin wrapper that opens ContentViewer in compact mode.
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

// --- Types ---

interface ContentView2DialogProps {
  open: boolean;
  onClose: () => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ContentViewData {
  storeName: string;
  customerName: string;
  orderItems: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  receivedAmount: number;
  changeAmount: number;
  customerInfo?: {
    name: string;
    lastVisit: string;
    points: number;
  };
}

// --- Component ---

export default function ContentView2Dialog({ open, onClose }: ContentView2DialogProps) {
  // Data received from PosRealTimeSender (C++ -> UI broadcast)
  // In production, this is populated by PosRealTimeReceiver subscription
  const [viewData] = useState<ContentViewData>({
    storeName: '',
    customerName: '',
    orderItems: [],
    totalAmount: 0,
    discountAmount: 0,
    payableAmount: 0,
    receivedAmount: 0,
    changeAmount: 0,
  });

  // --- Handlers (stubs) ---

  const handleCustomerConfirm = () => {
    // TODO: Bridge SYSTEM:GET_CONTENT (customer confirm callback)
  };

  // --- Render ---
  // This renders the compact variant of ContentViewer.
  // In production, replace with: <ContentViewer size="compact" data={viewData} />

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title={viewData.storeName || 'Content View'}
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Store & Customer header */}
        <div className="shrink-0 flex justify-between text-sm">
          <span className="font-bold">{viewData.storeName || '-'}</span>
          <span>{viewData.customerName || '-'}</span>
        </div>

        {/* Order items grid (compact) */}
        <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded overflow-hidden">
          <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-pos-surface sticky top-0">
              <tr>
                <th className="text-left px-2 py-1">Item</th>
                <th className="text-right px-2 py-1">Qty</th>
                <th className="text-right px-2 py-1">Price</th>
              </tr>
            </thead>
            <tbody>
              {viewData.orderItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-pos-text-secondary text-xs">
                    No items
                  </td>
                </tr>
              ) : (
                viewData.orderItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1">{item.name}</td>
                    <td className="px-2 py-1 text-right">{item.quantity}</td>
                    <td className="px-2 py-1 text-right">{item.price.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Amount summary (compact layout) */}
        <div className="shrink-0 grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-pos-text-secondary">Total</span>
            <span className="font-bold">{viewData.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-pos-text-secondary">Discount</span>
            <span>{viewData.discountAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-pos-text-secondary">Payable</span>
            <span className="font-bold">{viewData.payableAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-pos-text-secondary">Received</span>
            <span>{viewData.receivedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-pos-text-secondary">Change</span>
            <span className="font-bold text-pos-primary">
              {viewData.changeAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Customer info (conditional) */}
        {viewData.customerInfo && (
          <div className="border border-pos-border rounded p-2 text-xs">
            <div>Name: {viewData.customerInfo.name}</div>
            <div>Last Visit: {viewData.customerInfo.lastVisit}</div>
            <div>Points: {viewData.customerInfo.points.toLocaleString()}</div>
          </div>
        )}

        {/* Customer confirm button */}
        <div className="shrink-0 flex justify-center">
          <Button variant="primary" size="sm" onClick={handleCustomerConfirm}>
            {/* i18n: content.customerConfirm */}
            Customer Confirm
          </Button>
        </div>
      </div>
    </FullScreenPanel>
  );
}
