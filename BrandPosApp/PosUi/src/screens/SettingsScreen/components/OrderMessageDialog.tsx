'use client';

import { useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

/**
 * OrderMessageDialog -- Order message CRUD
 *
 * Design doc: set-ordermsg.md (SCR-SET-ORDERMSG)
 * Legacy: IDD_ORDERMSG (resource 136)
 */

interface OrderMessageDialogProps {
  onClose: () => void;
}

export default function OrderMessageDialog({ onClose }: OrderMessageDialogProps) {
  const handleAdd = useCallback(() => {}, []);
  const handleSave = useCallback(() => {}, []);
  const handleDeleteSelected = useCallback(() => {}, []);

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="주문 메시지"
      footer={
        <Button size="sm" variant="primary" onClick={handleSave}>저장</Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {/* Action bar */}
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleAdd}>추가</Button>
          <Button size="sm" variant="danger" onClick={handleDeleteSelected}>선택삭제</Button>
        </div>

        {/* Grid area */}
        <div className="flex-1 overflow-auto rounded-xl bg-pos-bg shadow-pos-card">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-pos-text-muted">
              주문메시지 목록 그리드 (인라인 편집)
            </p>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
