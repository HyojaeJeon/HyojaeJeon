'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

/**
 * EventSettingsDialog -- Event/Promotion rule management
 *
 * Design doc: set-eventset.md (SCR-SET-EVENTSET)
 * Legacy: IDD_EVENTSET (resource 134)
 */

interface EventSettingsDialogProps {
  onClose: () => void;
}

export default function EventSettingsDialog({ onClose }: EventSettingsDialogProps) {
  const [selectedEventId] = useState<string | null>(null);

  const handleAdd = useCallback(() => {}, []);
  const handleSave = useCallback(() => {}, []);
  const handleDelete = useCallback(() => {}, []);
  const handleDeleteSelected = useCallback(() => {}, []);
  const handleResetAll = useCallback(() => {}, []);
  const handleApply = useCallback((_scope: 'selected' | 'group' | 'all') => {}, [selectedEventId]);

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="행사 설정"
      footer={
        <Button size="sm" variant="primary" onClick={handleSave}>저장</Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {/* Action bar */}
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleAdd}>추가</Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>삭제</Button>
          <Button size="sm" variant="danger" onClick={handleDeleteSelected}>선택삭제</Button>
          <Button size="sm" variant="danger" onClick={handleResetAll}>전체초기화</Button>
        </div>

        {/* 3-panel layout */}
        <div className="flex flex-1 gap-2 overflow-hidden">
          {/* Left: Event list grid */}
          <div className="flex w-2/5 flex-col rounded-xl bg-pos-bg shadow-pos-card">
            <div className="px-3 py-2 text-sm font-semibold text-pos-text">
              행사 목록
            </div>
            <div className="flex-1 overflow-auto p-2">
              <p className="text-sm text-pos-text-muted">행사 목록이 여기에 표시됩니다.</p>
            </div>
          </div>

          {/* Center: Apply scope buttons */}
          <div className="flex w-20 flex-col items-center justify-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-center text-[10px] text-pos-text-muted">선택상품</span>
              <Button size="sm" variant="secondary" onClick={() => handleApply('selected')}>적용</Button>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-center text-[10px] text-pos-text-muted">그룹상품</span>
              <Button size="sm" variant="secondary" onClick={() => handleApply('group')}>적용</Button>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-center text-[10px] text-pos-text-muted">전체상품</span>
              <Button size="sm" variant="secondary" onClick={() => handleApply('all')}>적용</Button>
            </div>
          </div>

          {/* Right: Applied groups + items */}
          <div className="flex w-2/5 flex-col gap-2">
            <div className="flex flex-1 flex-col rounded-xl bg-pos-bg shadow-pos-card">
              <div className="px-3 py-2 text-sm font-semibold text-pos-text">
                적용 그룹
              </div>
              <div className="flex-1 overflow-auto p-2">
                <p className="text-xs text-pos-text-muted">적용 그룹 목록</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col rounded-xl bg-pos-bg shadow-pos-card">
              <div className="px-3 py-2 text-sm font-semibold text-pos-text">
                적용 상품
              </div>
              <div className="flex-1 overflow-auto p-2">
                <p className="text-xs text-pos-text-muted">적용 상품 목록</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
