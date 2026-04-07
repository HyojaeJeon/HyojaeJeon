'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import NumberInput from '@shared/ui/atoms/NumberInput';
import Radio from '@shared/ui/atoms/Radio';

/**
 * ItemSettingsDialog -- Set menu configuration
 *
 * Design doc: set-itemset.md (SCR-SET-ITEMSET)
 * Legacy: IDD_ITEMSET (resource 133)
 */

interface ItemSettingsDialogProps {
  onClose: () => void;
}

type SetType = 'A' | 'B' | 'C' | 'D';

export default function ItemSettingsDialog({ onClose }: ItemSettingsDialogProps) {
  const [setType, setSetType] = useState<SetType>('A');
  const [setCount, setSetCount] = useState(1);
  const [, setSelectedGroupTab] = useState(0);

  const handleSave = useCallback(() => {}, []);
  const handleDeleteSelected = useCallback(() => {}, []);
  const handleAddEmpty = useCallback(() => {}, []);
  const handleMenuItemSelect = useCallback((_itemCode: string) => {}, []);

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="세트 설정"
      footer={
        <Button size="sm" variant="primary" onClick={handleSave}>저장</Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {/* Item info + set type */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 text-sm text-pos-text">
            <span>상품코드: --</span>
            <span>상품명: --</span>
            <span>판매가: --</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-pos-text-muted">
            <span>그룹: --</span>
            <span>원가: --</span>
            <span>이익금: --</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-pos-text">세트타입:</span>
            {(['A', 'B', 'C', 'D'] as const).map((type) => (
              <Radio
                key={type}
                name="setType"
                checked={setType === type}
                onChange={() => setSetType(type)}
                label={type}
              />
            ))}
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Menu group tabs + 5x5 menu grid */}
          <div className="flex w-1/2 flex-col rounded-xl bg-pos-bg shadow-pos-card">
            <div className="flex gap-1 p-2">
              <span className="text-xs text-pos-text-muted">메뉴 그룹 탭</span>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMenuItemSelect(`item_${i}`)}
                  >
                    --
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 p-2">
              <Button size="sm" variant="ghost">{'<<'}</Button>
              <Button size="sm" variant="ghost">{'>>'}</Button>
            </div>
          </div>

          {/* Right: Set composition grid */}
          <div className="flex w-1/2 flex-col rounded-xl bg-pos-bg shadow-pos-card">
            <div className="px-3 py-2 text-sm font-semibold text-pos-text">
              세트 구성
            </div>
            <div className="flex-1 overflow-auto p-2">
              <p className="text-sm text-pos-text-muted">세트 구성 목록이 여기에 표시됩니다.</p>
            </div>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-pos-text">세트수량:</span>
                <NumberInput
                  value={String(setCount)}
                  onChange={(val) => setSetCount(Number(val) || 1)}
                  min={1}
                  className="w-16"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" onClick={handleDeleteSelected}>선택삭제</Button>
                <Button size="sm" variant="ghost" onClick={handleAddEmpty}>빈자리추가</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
