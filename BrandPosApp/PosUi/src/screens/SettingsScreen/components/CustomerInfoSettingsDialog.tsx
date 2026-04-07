'use client';

/**
 * CustomerInfoSettingsDialog (SET-CUSTINFOSET)
 *
 * 고객정보 설정 화면. 그리드 CRUD 패턴 (GridCrudScreen 공유).
 * 고객 관리에 필요한 필드/항목 정의.
 *
 * Legacy: IDD_CUSTINFOSET (리소스 176)
 * Bridge: SETUP:CUSTOMER_INFO:GET_CONFIG, SETUP:CUSTOMER_INFO:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import EditableDataGrid from '@shared/ui/organisms/EditableDataGrid';

// ─── Types ───

interface CustomerInfoItem {
  id: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
  description: string;
}

interface CustomerInfoSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const columns = [
  { key: 'fieldName', label: '항목명', editable: true },
  { key: 'fieldType', label: '유형', editable: true },
  { key: 'required', label: '필수', editable: true },
  { key: 'description', label: '설명', editable: true },
];

// ─── Component ───

export default function CustomerInfoSettingsDialog({
  open,
  onClose,
}: CustomerInfoSettingsDialogProps) {
  const [rows, setRows] = useState<CustomerInfoItem[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // TODO: RTK Query - setupApi.useGetCustomerInfoConfigQuery()
  // TODO: RTK Query - setupApi.useSaveCustomerInfoConfigMutation()

  const handleAdd = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        fieldName: '',
        fieldType: '',
        required: false,
        description: '',
      },
    ]);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:CUSTOMER_INFO:SAVE 호출
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
      title="고객정보 설정"
      subtitle="SET-CUSTINFOSET"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex flex-col h-full gap-3 min-h-0">
        <div className="shrink-0 flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleAdd}>추가</Button>
          <Button size="sm" variant="danger" onClick={handleDeleteSelected}>선택삭제</Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 rounded-xl bg-pos-surface shadow-pos-card overflow-hidden">
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
