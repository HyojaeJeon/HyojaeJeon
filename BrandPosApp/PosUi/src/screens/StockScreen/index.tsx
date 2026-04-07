'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import StockInputDialog from './components/StockInputDialog';
import StockViewDialog from './components/StockViewDialog';
import PurchaseManagerDialog from './components/PurchaseManagerDialog';
import PurchaseModifyDialog from './components/PurchaseModifyDialog';
import GetItemServerDialog from './components/GetItemServerDialog';
import GroupSelectDialog from './components/GroupSelectDialog';

// ─── Types ────────────────────────────────────────────
type StockDialog =
  | 'stockInput'
  | 'stockView'
  | 'purchaseManager'
  | 'purchaseModify'
  | 'getItemServer'
  | 'groupSelect'
  | null;

// ─── StockScreen Hub ──────────────────────────────────
interface StockScreenProps {
  onClose?: () => void;
}

export default function StockScreen({ onClose }: StockScreenProps) {
  const [activeDialog, setActiveDialog] = useState<StockDialog>(null);

  const openDialog = useCallback((dialog: StockDialog) => {
    setActiveDialog(dialog);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  const handleStockInputSaved = useCallback(() => {
    // TODO: invalidate stock-related RTK Query tags
  }, []);

  const handlePurchaseSaved = useCallback(() => {
    // TODO: invalidate purchase-related RTK Query tags
  }, []);

  const handleItemSynced = useCallback((count: number) => {
    // TODO: show toast notification for synced item count
  }, []);

  const handleGroupSelected = useCallback(
    (group: { code: string; name: string; parentCode: string | null }) => {
      // TODO: propagate selected group to calling context
    },
    [],
  );

  return (
    <div className="flex flex-col h-full bg-pos-bg">
      {/* ─── Header ─── */}
      <div className="h-header flex items-center justify-between px-5 border-b border-pos-border shrink-0">
        <h1 className="text-md font-bold text-pos-text">재고/발주 관리</h1>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-pos-sm border border-pos-border bg-pos-surface text-pos-text-muted transition active:scale-[0.97]"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {/* ─── Action grid ─── */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openDialog('stockInput')}
          >
            재고 입고
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openDialog('stockView')}
          >
            재고 조회
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openDialog('purchaseManager')}
          >
            발주 관리
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openDialog('purchaseModify')}
          >
            재고 수정
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openDialog('getItemServer')}
          >
            서버 상품 가져오기
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => openDialog('groupSelect')}
          >
            분류 선택
          </Button>
        </div>
      </div>

      {/* ─── Dialogs ─── */}
      <StockInputDialog
        open={activeDialog === 'stockInput'}
        onClose={closeDialog}
        onSaved={handleStockInputSaved}
      />
      <StockViewDialog
        open={activeDialog === 'stockView'}
        onClose={closeDialog}
      />
      <PurchaseManagerDialog
        open={activeDialog === 'purchaseManager'}
        onClose={closeDialog}
        onSaved={handlePurchaseSaved}
      />
      <PurchaseModifyDialog
        open={activeDialog === 'purchaseModify'}
        onClose={closeDialog}
        onSaved={handlePurchaseSaved}
      />
      <GetItemServerDialog
        open={activeDialog === 'getItemServer'}
        onClose={closeDialog}
        onSynced={handleItemSynced}
      />
      <GroupSelectDialog
        open={activeDialog === 'groupSelect'}
        onClose={closeDialog}
        onSelect={handleGroupSelected}
      />
    </div>
  );
}
