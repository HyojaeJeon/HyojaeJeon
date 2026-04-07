'use client';

import { useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

/**
 * TableMessageSettingsDialog -- Table message CRUD
 *
 * Design doc: set-tablemsg.md (SET-TABLEMSG)
 * Legacy: IDD_TABLEMSG (resource 174)
 */

interface TableMessageSettingsDialogProps {
  onClose: () => void;
}

export default function TableMessageSettingsDialog({ onClose }: TableMessageSettingsDialogProps) {
  const handleAdd = useCallback(() => {}, []);
  const handleSave = useCallback(() => {}, []);
  const handleDeleteSelected = useCallback(() => {}, []);

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="테이블 메시지 설정"
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
              테이블 메시지 그리드 (인라인 편집)
            </p>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
