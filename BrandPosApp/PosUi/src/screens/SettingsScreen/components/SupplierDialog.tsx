'use client';

/**
 * SupplierDialog (SET-SUPPLY-DLG)
 *
 * 공급처(거래처) 관리 CRUD 설정 화면.
 * 그리드 기반 인라인 편집, 추가, 선택 삭제, 전체 저장.
 * 모달 모드(mode="select")에서는 공급처 선택 후 콜백 반환.
 *
 * Legacy: IDD_SUPPLY_DLG (리소스 168)
 * Bridge: SETUP:SUPPLY:GET_LIST, SETUP:SUPPLY:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import EditableDataGrid from '@shared/ui/organisms/EditableDataGrid';

// ─── Types ───

interface SupplierRow {
  id: string;
  supplierName: string;
  contactName: string;
  phone: string;
  address: string;
  note: string;
}

interface SupplierDialogProps {
  open?: boolean;
  onClose: () => void;
  mode?: 'edit' | 'select';
  onSelectSupplier?: (supplier: SupplierRow) => void;
}

// ─── Columns ───

const columns = [
  { key: 'supplierName', label: '공급처명', editable: true },
  { key: 'contactName', label: '담당자', editable: true },
  { key: 'phone', label: '전화번호', editable: true },
  { key: 'address', label: '주소', editable: true },
  { key: 'note', label: '비고', editable: true },
];

// ─── Component ───

export default function SupplierDialog({
  open = true,
  onClose,
  mode = 'edit',
  onSelectSupplier,
}: SupplierDialogProps) {
  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // TODO: RTK Query - setupApi.useGetSupplyListQuery()
  // TODO: RTK Query - setupApi.useSaveSupplyInfoMutation()

  const handleAdd = useCallback(() => {
    const newRow: SupplierRow = {
      id: crypto.randomUUID(),
      supplierName: '',
      contactName: '',
      phone: '',
      address: '',
      note: '',
    };
    setRows((prev) => [...prev, newRow]);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:SUPPLY:SAVE 호출
  }, [rows]);

  const handleDeleteSelected = useCallback(() => {
    setRows((prev) => prev.filter((r) => !selectedRowIds.has(r.id)));
    setSelectedRowIds(new Set());
  }, [selectedRowIds]);

  const handleSelect = useCallback(() => {
    const selectedRow = rows.find((r) => selectedRowIds.has(r.id));
    if (selectedRow && onSelectSupplier) {
      onSelectSupplier(selectedRow);
    }
    onClose();
  }, [rows, selectedRowIds, onSelectSupplier, onClose]);

  const handleRowChange = useCallback((rowId: string, key: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [key]: value } : r))
    );
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="공급처 관리"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          {mode === 'select' && (
            <Button variant="primary" size="sm" onClick={handleSelect}>선택</Button>
          )}
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      {/* 헤더 버튼 영역 */}
      <div className="shrink-0 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={handleAdd}>추가</Button>
        <Button size="sm" variant="secondary" onClick={handleDeleteSelected}>선택삭제</Button>
      </div>

      {/* 공급처 목록 그리드 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl bg-pos-bg shadow-pos-card">
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
