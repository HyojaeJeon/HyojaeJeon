'use client';

import { useState, useMemo, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// ─── Types ────────────────────────────────────────────
interface MoveOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface MenuMoveDialogProps {
  open: boolean;
  onClose: () => void;
  sourceTableName: string;
  targetTableName: string;
  sourceItems: MoveOrderItem[];
  onSave?: (movedItems: MoveOrderItem[]) => void;
}

// ─── MenuMoveDialog ───────────────────────────────────
export default function MenuMoveDialog({
  open,
  onClose,
  sourceTableName,
  targetTableName,
  sourceItems: initialSourceItems,
  onSave,
}: MenuMoveDialogProps) {
  const [sourceItems, setSourceItems] = useState<MoveOrderItem[]>(initialSourceItems);
  const [targetItems, setTargetItems] = useState<MoveOrderItem[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(new Set());
  const [selectedTargetIds, setSelectedTargetIds] = useState<Set<string>>(new Set());

  // --- Totals ---
  const sourceTotal = useMemo(
    () => sourceItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [sourceItems],
  );
  const targetTotal = useMemo(
    () => targetItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [targetItems],
  );

  // --- Selection handlers ---
  const toggleSourceSelection = useCallback((id: string) => {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleTargetSelection = useCallback((id: string) => {
    setSelectedTargetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // --- Move handlers ---
  const moveAllToTarget = useCallback(() => {
    setTargetItems((prev) => [...prev, ...sourceItems]);
    setSourceItems([]);
    setSelectedSourceIds(new Set());
  }, [sourceItems]);

  const moveSelectedToTarget = useCallback(() => {
    const toMove = sourceItems.filter((item) => selectedSourceIds.has(item.id));
    const remaining = sourceItems.filter((item) => !selectedSourceIds.has(item.id));
    setTargetItems((prev) => [...prev, ...toMove]);
    setSourceItems(remaining);
    setSelectedSourceIds(new Set());
  }, [sourceItems, selectedSourceIds]);

  const moveSelectedToSource = useCallback(() => {
    const toMove = targetItems.filter((item) => selectedTargetIds.has(item.id));
    const remaining = targetItems.filter((item) => !selectedTargetIds.has(item.id));
    setSourceItems((prev) => [...prev, ...toMove]);
    setTargetItems(remaining);
    setSelectedTargetIds(new Set());
  }, [targetItems, selectedTargetIds]);

  const moveAllToSource = useCallback(() => {
    // Hidden by default per spec, but implemented for completeness
    setSourceItems((prev) => [...prev, ...targetItems]);
    setTargetItems([]);
    setSelectedTargetIds(new Set());
  }, [targetItems]);

  const handleSave = useCallback(() => {
    // TODO: TABLE:MOVE bridge call
    onSave?.(targetItems);
    onClose();
  }, [targetItems, onSave, onClose]);

  // --- Render item list ---
  const renderItemList = (
    items: MoveOrderItem[],
    selectedIds: Set<string>,
    onToggle: (id: string) => void,
  ) => (
    <div className="flex-1 overflow-y-auto space-y-1 p-2" style={{ scrollbarWidth: 'none' }}>
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
          항목 없음
        </div>
      ) : (
        items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-pos-sm text-xs cursor-pointer
              transition-colors duration-fast
              ${selectedIds.has(item.id)
                ? 'bg-primary-100 text-primary-700'
                : 'bg-pos-surface text-pos-text'}
            `}
          >
            <span className="truncate flex-1 text-left">{item.name}</span>
            <span className="shrink-0 tabular-nums ml-2">{item.quantity}</span>
            <span className="shrink-0 tabular-nums ml-3 w-16 text-right">
              {(item.price * item.quantity).toLocaleString()}
            </span>
          </button>
        ))
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="주문 이동"
      size="lg"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSave}>
            저장
          </Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            취소
          </Button>
        </>
      }
    >
      <div className="flex gap-3 h-[400px]">
        {/* Source panel */}
        <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-pos-surface border-b border-pos-border shrink-0">
            <span className="text-xs font-semibold text-pos-text">{sourceTableName}</span>
            <span className="text-xs tabular-nums text-pos-text-secondary">
              {sourceTotal.toLocaleString()}
            </span>
          </div>
          {renderItemList(sourceItems, selectedSourceIds, toggleSourceSelection)}
        </div>

        {/* Move buttons (center) */}
        <div className="flex flex-col items-center justify-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={moveAllToTarget}>{'>>'}</Button>
          <Button variant="secondary" size="sm" onClick={moveSelectedToTarget}>{'>'}</Button>
          <Button variant="secondary" size="sm" onClick={moveSelectedToSource}>{'<'}</Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={moveAllToSource}
            className="opacity-30"
            disabled
          >
            {'<<'}
          </Button>
        </div>

        {/* Target panel */}
        <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-pos-surface border-b border-pos-border shrink-0">
            <span className="text-xs font-semibold text-pos-text">{targetTableName}</span>
            <span className="text-xs tabular-nums text-pos-text-secondary">
              {targetTotal.toLocaleString()}
            </span>
          </div>
          {renderItemList(targetItems, selectedTargetIds, toggleTargetSelection)}
        </div>
      </div>
    </Modal>
  );
}
