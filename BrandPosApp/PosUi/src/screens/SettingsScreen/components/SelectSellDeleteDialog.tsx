'use client';

/**
 * SelectSellDeleteDialog (SET-SELECTSELLDEL-DLG)
 *
 * 매출매입 선택 삭제 화면 (Maintenance mode).
 * 기간 검색 후 매출 목록을 표시, 선택/일괄 삭제.
 *
 * Legacy: IDD_SELECTSELLDEL_DLG (리소스 182)
 * Bridge: SETUP:SALES:GET_LIST, SETUP:SALES:DELETE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Checkbox from '@shared/ui/atoms/Checkbox';

// ─── Types ───

interface SalesRecord {
  id: string;
  date: string;
  amount: number;
  type: string;
  description: string;
}

interface SelectSellDeleteDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ───

export default function SelectSellDeleteDialog({
  open,
  onClose,
}: SelectSellDeleteDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // TODO: RTK Query - setupApi.useGetSalesListQuery({ startDate, endDate })
  // TODO: RTK Query - setupApi.useDeleteSalesRecordMutation()

  const handleSearch = useCallback(() => {
    // TODO: Bridge SETUP:SALES:GET_LIST 호출
  }, [startDate, endDate]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    // TODO: 확인 후 Bridge SETUP:SALES:DELETE 호출 (선택 삭제)
  }, [selectedIds]);

  const handleDeleteAll = useCallback(() => {
    // TODO: 확인 후 Bridge SETUP:SALES:DELETE 호출 (일괄 삭제)
  }, [records]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="매출매입 선택 삭제"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={handleDeleteSelected}>선택 삭제</Button>
          <Button variant="danger" size="sm" onClick={handleDeleteAll}>일괄 삭제</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full gap-3">
        {/* 기간 검색 */}
        <div className="shrink-0 flex items-end gap-2">
          <TextInput
            label="시작일"
            value={startDate}
            onChange={setStartDate}
            placeholder="YYYY-MM-DD"
          />
          <span className="pb-2 text-pos-text">~</span>
          <TextInput
            label="종료일"
            value={endDate}
            onChange={setEndDate}
            placeholder="YYYY-MM-DD"
          />
          <Button size="sm" variant="secondary" onClick={handleSearch}>검색</Button>
        </div>

        {/* 매출 목록 */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl bg-pos-bg shadow-pos-card">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-pos-surface text-pos-text">
              <tr>
                <th className="w-8 p-2" />
                <th className="p-2 text-left">날짜</th>
                <th className="p-2 text-left">유형</th>
                <th className="p-2 text-right">금액</th>
                <th className="p-2 text-left">설명</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className={`text-pos-text ${
                    selectedIds.has(r.id) ? 'bg-primary-500/10' : ''
                  }`}
                  onClick={() => handleToggleSelect(r.id)}
                >
                  <td className="p-2 text-center">
                    <Checkbox
                      checked={selectedIds.has(r.id)}
                      onChange={() => handleToggleSelect(r.id)}
                    />
                  </td>
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2 text-right">{r.amount.toLocaleString()}</td>
                  <td className="p-2">{r.description}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-pos-text-muted">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FullScreenPanel>
  );
}
