'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

/**
 * ItemInputDialog -- Item/Group master-detail CRUD
 *
 * Design doc: set-iteminput.md (SCR-SET-ITEMINPUT)
 * Legacy: IDD_ITEMINPUT (resource 129)
 *
 * Bridge Commands:
 *   SETUP:ITEM:SAVE, SETUP:ITEM:DELETE, SETUP:ITEM:GET_LIST,
 *   SETUP:ITEM:GET_DETAIL, SETUP:ITEM:BARCODE, SETUP:ITEM:MOVE_GROUP,
 *   SETUP:ITEM:REORDER, SETUP:ITEM:BACKUP
 *
 * RTK Query: setupItemApi.getGroupList, getItemList, saveItem, deleteItem
 * UseCase: SaveItemUseCase, DeleteItemUseCase, GetItemListUseCase
 */

interface ItemInputDialogProps {
  onClose: () => void;
  onDetailOpen: () => void;
  onSetOpen: () => void;
}

export default function ItemInputDialog({ onClose, onDetailOpen, onSetOpen }: ItemInputDialogProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [, setSelectedGroupCode] = useState<string | null>(null);

  // TODO: Load groups with setupItemApi.getGroupList
  // TODO: Load items with setupItemApi.getItemList({ groupCode, filter })

  const handleGroupAdd = useCallback(() => {}, []);
  const handleGroupSave = useCallback(() => {}, []);
  const handleGroupDelete = useCallback(() => {}, []);
  const handleItemAdd = useCallback(() => {}, []);
  const handleItemSave = useCallback(() => {}, []);
  const handleItemDelete = useCallback(() => {}, []);
  const handleSearch = useCallback(() => {}, [searchFilter]);
  const handleBarcode = useCallback(() => {}, []);
  const handleGroupMove = useCallback(() => {}, []);

  return (
    <FullScreenPanel open onClose={onClose} title="상품 입력" subtitle="상품/그룹 관리">
      <div className="flex h-full flex-col gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <TextInput
            value={searchFilter}
            onChange={(v) => setSearchFilter(v)}
            placeholder="상품 검색..."
            className="w-48"
          />
          <Button size="sm" variant="secondary" onClick={handleSearch}>상품조회</Button>
        </div>

        {/* Group/Item action bars */}
        <div className="flex gap-4">
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" onClick={handleGroupAdd}>그룹추가</Button>
            <Button size="sm" variant="secondary" onClick={handleGroupSave}>그룹저장</Button>
            <Button size="sm" variant="danger" onClick={handleGroupDelete}>그룹삭제</Button>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="secondary" onClick={handleItemAdd}>상품추가</Button>
            <Button size="sm" variant="primary" onClick={handleItemSave}>저장</Button>
            <Button size="sm" variant="danger" onClick={handleItemDelete}>삭제</Button>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left: Group list */}
          <div className="flex w-1/3 flex-col rounded-xl bg-pos-bg shadow-pos-card">
            <div className="px-3 py-2 text-sm font-semibold text-pos-text">
              그룹 목록
            </div>
            <div className="flex-1 overflow-auto p-2">
              <p className="text-sm text-pos-text-muted">그룹 목록이 여기에 표시됩니다.</p>
            </div>
          </div>

          {/* Right: Item list */}
          <div className="flex w-2/3 flex-col rounded-xl bg-pos-bg shadow-pos-card">
            <div className="px-3 py-2 text-sm font-semibold text-pos-text">
              상품 목록
            </div>
            <div className="flex-1 overflow-auto p-2">
              <p className="text-sm text-pos-text-muted">상품 목록이 여기에 표시됩니다.</p>
            </div>
            <div className="flex gap-2 p-2">
              <Button size="sm" variant="secondary" onClick={onDetailOpen}>상세설정</Button>
              <Button size="sm" variant="secondary" onClick={onSetOpen}>세트설정</Button>
              <Button size="sm" variant="secondary" onClick={handleBarcode}>바코드</Button>
              <Button size="sm" variant="secondary" onClick={handleGroupMove}>그룹변경</Button>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
