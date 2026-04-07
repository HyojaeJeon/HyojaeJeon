'use client';

import { useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

/**
 * ItemGroupPosDialog -- Item group POS display toggle
 *
 * Design doc: set-item-grpos.md (IDD_ITEM_GRPOS)
 * Legacy: IDD_ITEM_GRPOS (resource 245)
 */

interface ItemGroupPosDialogProps {
  onClose: () => void;
}

export default function ItemGroupPosDialog({ onClose }: ItemGroupPosDialogProps) {
  const handleSave = useCallback(() => {}, []);

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="그룹별 POS 표시 설정"
      footer={
        <Button size="sm" variant="primary" onClick={handleSave}>저장</Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        <p className="text-xs text-pos-text-muted">
          그룹별로 해당상품을 주문창에서 안 보이도록 설정할 수 있습니다
        </p>

        {/* Grid area */}
        <div className="flex-1 overflow-auto rounded-xl bg-pos-bg shadow-pos-card">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-pos-text-muted">
              상품그룹 POS 표시 그리드 (토글 컬럼 포함)
            </p>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
