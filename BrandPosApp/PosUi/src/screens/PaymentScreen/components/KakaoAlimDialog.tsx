'use client';

/**
 * KakaoAlimDialog (SCR-KAKAOTALK-ALIM)
 *
 * KakaoTalk notification (Alim) management modal.
 * Queue list, send (call), select/all delete, refresh, filtering.
 * Online required for sending. NOT Outbox target (real-time external transaction).
 *
 * Legacy: IDD_KAKAOTALK_ALIM (331), 450x337 DLU, 14 controls
 * Shared UI: Modal (KakaoAlimModal), DataTable, Checkbox, Button
 */

import { useState, useMemo } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Checkbox from '@shared/ui/atoms/Checkbox';

// --- Types ---

interface KakaoAlimDialogProps {
  open: boolean;
  onClose: () => void;
}

interface AlimQueueItem {
  id: string;
  name: string;
  phone: string;
  orderDetails: string;
  status: 'WAITING' | 'SENT' | 'FAILED';
  sellType: 1 | 2 | 3;
  selected: boolean;
}

// --- Component ---

export default function KakaoAlimDialog({ open, onClose }: KakaoAlimDialogProps) {
  const [filterSell1, setFilterSell1] = useState(true);
  const [filterSell2, setFilterSell2] = useState(true);
  const [filterSell3, setFilterSell3] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Stub data -- will be replaced by notificationApi RTK Query hooks
  const queueItems: AlimQueueItem[] = [];
  const waitCount = 0; // TODO: notificationApi.getKakaoQueue -> count
  const remainingQuota = 0; // TODO: notificationApi.getKakaoQuota

  // Filter
  const filteredItems = useMemo(() => {
    return queueItems.filter((item) => {
      if (item.sellType === 1 && !filterSell1) return false;
      if (item.sellType === 2 && !filterSell2) return false;
      if (item.sellType === 3 && !filterSell3) return false;
      return true;
    });
  }, [queueItems, filterSell1, filterSell2, filterSell3]);

  // --- Handlers (stubs) ---

  const handleSend = () => {
    // TODO: Bridge NOTIFICATION:SEND_KAKAO { customerIds: [...selectedIds], templateType }
    //       -> SendKakaoAlimUseCase -> ExternalBridge/Fooding
    //       Online required. NOT Outbox target.
  };

  const handleRefresh = () => {
    // TODO: Re-fetch notificationApi.getKakaoQueue
  };

  const handleDeleteSelected = () => {
    // TODO: Bridge NOTIFICATION:SEND_KAKAO (delete mode) -> CustMgr.DeleteFromQueue
  };

  const handleDeleteAll = () => {
    // TODO: Bridge NOTIFICATION:SEND_KAKAO (delete all) -> CustMgr.DeleteFromQueue
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- Render ---

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="KakaoTalk Alim"
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="danger" size="sm" onClick={handleDeleteSelected} disabled={selectedIds.size === 0}>
            Delete Selected
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteAll}>
            Delete All
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-pos-text-secondary">
            Remaining: {remainingQuota}
          </span>
          <Button variant="secondary" size="sm" onClick={handleRefresh}>Refresh</Button>
          <Button variant="primary" size="sm" onClick={handleSend}>Send</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Top bar */}
        <div className="shrink-0 flex items-center gap-3 h-9">
          <span className="text-sm">
            {/* i18n: notification.kakao.waitCount */}
            Waiting: <strong>{waitCount}</strong>
          </span>
          <div className="flex-1" />
          <label className="flex items-center gap-1 text-xs">
            <Checkbox checked={filterSell1} onChange={() => setFilterSell1(!filterSell1)} />
            Sell 1
          </label>
          <label className="flex items-center gap-1 text-xs">
            <Checkbox checked={filterSell2} onChange={() => setFilterSell2(!filterSell2)} />
            Sell 2
          </label>
          <label className="flex items-center gap-1 text-xs">
            <Checkbox checked={filterSell3} onChange={() => setFilterSell3(!filterSell3)} />
            Sell 3
          </label>
        </div>

        {/* Queue list grid */}
        <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-pos-surface sticky top-0">
              <tr>
                <th className="w-8 px-2 py-2" />
                <th className="text-left px-2 py-2">#</th>
                <th className="text-left px-2 py-2">Name</th>
                <th className="text-left px-2 py-2">Phone</th>
                <th className="text-left px-2 py-2">Order</th>
                <th className="text-left px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-pos-text-secondary">
                    {/* TODO: notificationApi.getKakaoQueue */}
                    No items in queue
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-pos-surface">
                    <td className="px-2 py-1">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="px-2 py-1">{idx + 1}</td>
                    <td className="px-2 py-1">{item.name}</td>
                    <td className="px-2 py-1">{item.phone}</td>
                    <td className="px-2 py-1 truncate max-w-32">{item.orderDetails}</td>
                    <td className="px-2 py-1">{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FullScreenPanel>
  );
}
