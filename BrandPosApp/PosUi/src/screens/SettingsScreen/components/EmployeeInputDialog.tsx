'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Checkbox from '@shared/ui/atoms/Checkbox';
import EditableDataGrid from '@shared/ui/organisms/EditableDataGrid';

/**
 * EmployeeInputDialog -- Employee CRUD with inline grid editing
 *
 * Design doc: set-empinput.md (SCR-SET-EMPINPUT)
 * Legacy: IDD_EMPINPUT (resource 137)
 *
 * Single grid with inline editing for employee info (code, name, rank, password, resigned).
 * Filter: include/exclude resigned employees.
 * Admin action: Reset resigned employee password.
 *
 * Bridge Commands:
 *   SETUP:EMPLOYEE:SAVE, SETUP:EMPLOYEE:DELETE,
 *   SETUP:EMPLOYEE:GET_LIST, SETUP:EMPLOYEE:RESET_PASSWORD
 *
 * RTK Query: setupEmployeeApi.getEmployeeList, saveEmployee, deleteEmployee, resetPassword
 * UseCase: SaveEmployeeUseCase, GetEmployeeListUseCase
 */

interface EmployeeInputDialogProps {
  open?: boolean;
  onClose: () => void;
}

const COLUMNS = [
  { key: 'employeeCode', label: '직원코드', editable: true },
  { key: 'name', label: '이름', editable: true },
  { key: 'rank', label: '직급', editable: true },
  { key: 'password', label: '비밀번호', editable: true },
  { key: 'resignedYn', label: '퇴직', editable: true },
];

export default function EmployeeInputDialog({ open = true, onClose }: EmployeeInputDialogProps) {
  const [includeResigned, setIncludeResigned] = useState(false);
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // TODO: Load employees with setupEmployeeApi.getEmployeeList({ includeResigned })

  const handleAdd = useCallback(() => {
    // TODO: Add new empty row to grid for employee creation
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), employeeCode: '', name: '', rank: '', password: '', resignedYn: 'N' },
    ]);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Call setupEmployeeApi.saveEmployee mutation (batch save)
  }, []);

  const handleDeleteSelected = useCallback(() => {
    // TODO: Call setupEmployeeApi.deleteEmployee mutation with selected IDs
    setRows((prev) => prev.filter((r) => !selectedRowIds.has(r.id)));
    setSelectedRowIds(new Set());
  }, [selectedRowIds]);

  const handleResetPassword = useCallback(() => {
    // TODO: Show admin auth dialog, then call setupEmployeeApi.resetPassword
  }, []);

  const handleRowChange = useCallback((rowId: string, key: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [key]: value } : r)));
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="직원 설정"
      subtitle="SCR-SET-EMPINPUT"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex h-full flex-col gap-3 min-h-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleAdd}>추가</Button>
            <Button size="sm" variant="danger" onClick={handleDeleteSelected}>선택삭제</Button>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={includeResigned}
              onChange={() => setIncludeResigned(!includeResigned)}
              label="퇴직자 포함 표시"
            />
            <Button size="sm" variant="outline" onClick={handleResetPassword}>
              퇴직자 비밀번호 초기화
            </Button>
          </div>
        </div>

        {/* Grid area */}
        <div className="flex-1 min-h-0 rounded-xl bg-pos-surface shadow-pos-card overflow-hidden">
          <EditableDataGrid
            columns={COLUMNS}
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
