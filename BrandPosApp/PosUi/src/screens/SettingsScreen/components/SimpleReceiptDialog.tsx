'use client';

/**
 * SimpleReceiptDialog (SET-SIMPLERECEIPT)
 *
 * 간이영수증 양식 설정 화면. 그리드 CRUD 패턴 (GridCrudScreen 공유).
 * 결제 후 출력되는 영수증 항목 구성 편집.
 *
 * Legacy: IDD_SIMPLERECEIPT (리소스 175)
 * Bridge: SETUP:RECEIPT:GET_CONFIG, SETUP:RECEIPT:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import EditableDataGrid from '@shared/ui/organisms/EditableDataGrid';

// ─── Types ───

interface ReceiptItem {
  id: string;
  itemName: string;
  displayOrder: number;
  visible: boolean;
  format: string;
}

interface SimpleReceiptDialogProps {
  open: boolean;
  onClose: () => void;
}

const columns = [
  { key: 'itemName', label: '항목명', editable: true },
  { key: 'displayOrder', label: '순서', editable: true },
  { key: 'visible', label: '표시', editable: true },
  { key: 'format', label: '포맷', editable: true },
];

// ─── Component ───

export default function SimpleReceiptDialog({
  open,
  onClose,
}: SimpleReceiptDialogProps) {
  const [rows, setRows] = useState<ReceiptItem[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // TODO: RTK Query - setupApi.useGetSimpleReceiptConfigQuery()
  // TODO: RTK Query - setupApi.useSaveSimpleReceiptConfigMutation()

  const handleAdd = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        itemName: '',
        displayOrder: prev.length + 1,
        visible: true,
        format: '',
      },
    ]);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:RECEIPT:SAVE 호출
  }, [rows]);

  const handleDeleteSelected = useCallback(() => {
    setRows((prev) => prev.filter((r) => !selectedRowIds.has(r.id)));
    setSelectedRowIds(new Set());
  }, [selectedRowIds]);

  const handleRowChange = useCallback((rowId: string, key: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [key]: value } : r))
    );
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="간이영수증 설정"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="shrink-0 flex items-center gap-2">
        <Button size="sm" onClick={handleAdd}>추가</Button>
        <Button size="sm" onClick={handleDeleteSelected}>선택삭제</Button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-pos-surface shadow-pos-card overflow-hidden">
        <EditableDataGrid
          columns={columns}
          rows={rows}
          selectedRowIds={selectedRowIds}
          onSelectedRowIdsChange={setSelectedRowIds}
          onRowChange={handleRowChange}
        />
      </div>
    </FullScreenPanel>
  );
}
