'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Tabs from '@shared/ui/molecules/Tabs';

/**
 * FavoritesDialog -- Menu favorites configuration
 *
 * Design doc: set-favorites.md (IDD_FAVORITES)
 * Legacy: IDD_FAVORITES (resource 193)
 */

interface FavoritesDialogProps {
  onClose: () => void;
}

export default function FavoritesDialog({ onClose }: FavoritesDialogProps) {
  const [selectedGroupTab, setSelectedGroupTab] = useState('grp0');

  const handleSave = useCallback(() => {}, []);
  const handleGroupDelete = useCallback(() => {}, []);
  const handleMenuDelete = useCallback(() => {}, []);
  const handleMenuItemClick = useCallback((_itemCode: string) => {}, []);

  const groupTabs = Array.from({ length: 5 }).map((_, i) => ({
    id: `grp${i}`,
    label: `GRP${String(i + 1).padStart(2, '0')}`,
  }));

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="메뉴 즐겨찾기"
      footer={
        <>
          <Button size="sm" variant="danger" onClick={handleGroupDelete}>그룹삭제</Button>
          <Button size="sm" variant="danger" onClick={handleMenuDelete}>메뉴삭제</Button>
          <Button size="sm" variant="primary" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {/* Two-panel layout */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Favorites grid */}
          <div className="flex w-2/5 flex-col rounded-xl bg-pos-bg shadow-pos-card">
            <div className="px-3 py-2 text-sm font-semibold text-pos-text">
              즐겨찾기 목록
            </div>
            <div className="flex-1 overflow-auto p-2">
              <p className="text-sm text-pos-text-muted">즐겨찾기 목록이 여기에 표시됩니다.</p>
            </div>
          </div>

          {/* Right: Menu group tabs + button matrix */}
          <div className="flex w-3/5 flex-col rounded-xl bg-pos-bg shadow-pos-card">
            <div className="p-2">
              <Tabs tabs={groupTabs} activeId={selectedGroupTab} onSelect={setSelectedGroupTab} />
            </div>
            <div className="flex-1 overflow-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMenuItemClick(`item_${i}`)}
                  >
                    --
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
