'use client';

/**
 * InOutSettingsDialog (SET-INOUTSET)
 *
 * 입출력 항목 그리드 기반 CRUD 설정 화면.
 * GridCrudScreen 패턴 공유 (set-tablemsg, set-simplereceipt, set-custinfoset).
 *
 * Legacy: IDD_INOUTSET (리소스 165)
 * Bridge: SETUP:INOUT:GET_CONFIG, SETUP:INOUT:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import EditableDataGrid from '@shared/ui/organisms/EditableDataGrid';

// ─── Types ───

interface InOutItem {
  id: string;
  itemName: string;
  itemType: string;
  description: string;
}

interface InOutSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Columns ───

const columns = [
  { key: 'itemName', label: '항목명', editable: true },
  { key: 'itemType', label: '유형', editable: true },
  { key: 'description', label: '설명', editable: true },
];

// ─── Component ───

export default function InOutSettingsDialog({
  open,
  onClose,
}: InOutSettingsDialogProps) {
  const [rows, setRows] = useState<InOutItem[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // TODO: RTK Query - setupApi.useGetInOutConfigQuery()
  // TODO: RTK Query - setupApi.useSaveInOutConfigMutation()

  const handleAdd = useCallback(() => {
    const newItem: InOutItem = {
      id: crypto.randomUUID(),
      itemName: '',
      itemType: '',
      description: '',
    };
    setRows((prev) => [...prev, newItem]);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:INOUT:SAVE 호출
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
      title="입출력 설정"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full gap-3">
        <div className="shrink-0 flex items-center gap-2">
          <Button size="sm" onClick={handleAdd}>추가</Button>
          <Button size="sm" onClick={handleDeleteSelected}>선택삭제</Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <EditableDataGrid
            columns={columns}
            rows={rows}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={setSelectedRowIds}
            onRowChange={handleRowChange}
          />
        </div>
      </div>
    </FullScreenPanel>
  );
}
