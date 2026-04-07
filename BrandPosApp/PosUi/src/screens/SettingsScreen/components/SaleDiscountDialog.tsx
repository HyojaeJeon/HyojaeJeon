'use client';

import { useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

/**
 * SaleDiscountDialog -- Discount rule CRUD
 *
 * Design doc: set-saledc.md (SCR-SET-SALEDC)
 * Legacy: IDD_SALEDC (resource 135)
 */

interface SaleDiscountDialogProps {
  onClose: () => void;
}

export default function SaleDiscountDialog({ onClose }: SaleDiscountDialogProps) {
  const handleAdd = useCallback(() => {}, []);
  const handleSave = useCallback(() => {}, []);
  const handleDeleteSelected = useCallback(() => {}, []);
  const handleItemSelect = useCallback(() => {}, []);

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="할인 설정"
      footer={
        <Button size="sm" variant="primary" onClick={handleSave}>저장</Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {/* Action bar */}
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleAdd}>추가</Button>
          <Button size="sm" variant="danger" onClick={handleDeleteSelected}>선택삭제</Button>
          <Button size="sm" variant="secondary" onClick={handleItemSelect}>상품선택</Button>
        </div>

        {/* Grid area */}
        <div className="flex-1 overflow-auto rounded-xl bg-pos-bg shadow-pos-card">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-pos-text-muted">
              할인규칙 목록 그리드 (인라인 편집)
            </p>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
