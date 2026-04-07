'use client';

/**
 * BasicCodeDialog (SET-BASIC-CODE / BASIC_CODE)
 *
 * 기본 코드 관리: 5개 탭(저울코드/회원코드/할인금액/카드사 구간/주문프린터층).
 * 탭별 편집 가능 그리드로 코드 CRUD.
 *
 * Legacy: IDD_BASIC_CODE
 * Bridge: SETUP:BASIC_CODE:GET_LIST, SETUP:BASIC_CODE:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Tabs from '@shared/ui/molecules/Tabs';
import EditableDataGrid from '@shared/ui/organisms/EditableDataGrid';

// ─── Types ───

type CodeTab = 'scale' | 'member' | 'discount' | 'cardRange' | 'printerFloor';

interface CodeRow {
  id: string;
  code: string;
  name: string;
  value: string;
  note: string;
}

interface BasicCodeDialogProps {
  open: boolean;
  onClose: () => void;
}

const TAB_CONFIG: { key: CodeTab; label: string }[] = [
  { key: 'scale', label: '저울코드' },
  { key: 'member', label: '회원코드' },
  { key: 'discount', label: '할인금액' },
  { key: 'cardRange', label: '카드사 구간' },
  { key: 'printerFloor', label: '주문프린터층' },
];

const columns = [
  { key: 'code', label: '코드', editable: true },
  { key: 'name', label: '코드명', editable: true },
  { key: 'value', label: '값', editable: true },
  { key: 'note', label: '비고', editable: true },
];

// ─── Component ───

export default function BasicCodeDialog({
  open,
  onClose,
}: BasicCodeDialogProps) {
  const [activeTab, setActiveTab] = useState<CodeTab>('scale');
  const [rows, setRows] = useState<CodeRow[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // TODO: RTK Query - setupApi.useGetBasicCodeListQuery({ codeType: activeTab })
  // TODO: RTK Query - setupApi.useSaveBasicCodeMutation()

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:BASIC_CODE:SAVE 호출
  }, [rows, activeTab]);

  const handleDelete = useCallback(() => {
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
      title="기본 코드 관리"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button size="sm" onClick={handleDelete}>삭제</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full gap-3">
        {/* 탭 버튼 */}
        <Tabs
          tabs={TAB_CONFIG.map((t) => ({ id: t.key, label: t.label }))}
          activeId={activeTab}
          onSelect={(id) => setActiveTab(id as CodeTab)}
        />

        {/* 코드 유형 라벨 + 그리드 */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="mb-2 text-sm font-medium text-pos-text">
            {TAB_CONFIG.find((t) => t.key === activeTab)?.label} 목록
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <EditableDataGrid
              columns={columns}
              rows={rows}
              selectedRowIds={selectedRowIds}
              onSelectedRowIdsChange={setSelectedRowIds}
              onRowChange={handleRowChange}
            />
            {activeTab === 'printerFloor' && (
              <p className="mt-2 text-xs text-pos-text-muted">
                주문프린터층 설정은 프린터 설정과 연동됩니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
