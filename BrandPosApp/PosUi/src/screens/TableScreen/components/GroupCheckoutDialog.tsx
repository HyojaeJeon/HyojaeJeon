'use client';

/**
 * GroupCheckoutDialog (TBL-05 / CTableGrpCheckout)
 *
 * 테이블 그룹 일괄 정산 팝업.
 * 여러 테이블을 선택하여 한 번에 체크아웃(정산) 처리.
 * 선택된 테이블 목록, 합산 금액, 일괄 정산 확인.
 *
 * Legacy: CTableGrpCheckout
 * Bridge: TABLE:GROUP_CHECKOUT:GET_LIST, TABLE:GROUP_CHECKOUT:EXECUTE
 */

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// ─── Types ───

interface TableCheckoutItem {
  tableId: number;
  tableCode: string;
  tableName: string;
  orderCount: number;
  totalAmount: number;
  selected: boolean;
}

interface GroupCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  floorId?: number;
  onCheckoutComplete?: (tableIds: number[]) => void;
}

// ─── Component ───

export default function GroupCheckoutDialog({
  open,
  onClose,
  floorId,
  onCheckoutComplete,
}: GroupCheckoutDialogProps) {
  const [tables, setTables] = useState<TableCheckoutItem[]>([]);

  // TODO: RTK Query - tableApi.useGetCheckoutTablesQuery({ floorId })
  // TODO: RTK Query - tableApi.useExecuteGroupCheckoutMutation()

  const handleToggleSelect = useCallback((tableId: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.tableId === tableId ? { ...t, selected: !t.selected } : t
      )
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setTables((prev) => {
      const allSelected = prev.every((t) => t.selected);
      return prev.map((t) => ({ ...t, selected: !allSelected }));
    });
  }, []);

  const selectedTables = tables.filter((t) => t.selected);
  const totalAmount = selectedTables.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalOrders = selectedTables.reduce((sum, t) => sum + t.orderCount, 0);

  const handleExecuteCheckout = useCallback(() => {
    if (selectedTables.length === 0) return;
    // TODO: Bridge TABLE:GROUP_CHECKOUT:EXECUTE 호출
    // 성공 시 onCheckoutComplete 콜백
    const tableIds = selectedTables.map((t) => t.tableId);
    onCheckoutComplete?.(tableIds);
  }, [selectedTables, onCheckoutComplete]);

  return (
    <Modal open={open} onClose={onClose} title="그룹 체크아웃">
      <div className="flex flex-col gap-3 p-4">
        {/* 전체 선택 */}
        <div className="flex items-center justify-between">
          <Button size="sm" variant="secondary" onClick={handleSelectAll}>
            전체 선택/해제
          </Button>
          <span className="text-sm text-pos-text-muted">
            {selectedTables.length}개 테이블 선택
          </span>
        </div>

        {/* 테이블 목록 */}
        <div className="max-h-56 overflow-auto rounded border border-pos-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-pos-surface-alt">
              <tr>
                <th className="w-8 p-1" />
                <th className="p-1 text-left">테이블</th>
                <th className="p-1 text-right">주문수</th>
                <th className="p-1 text-right">금액</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr
                  key={t.tableId}
                  className={`cursor-pointer border-t border-pos-border ${
                    t.selected ? 'bg-pos-primary/10' : ''
                  }`}
                  onClick={() => handleToggleSelect(t.tableId)}
                >
                  <td className="p-1 text-center">
                    <input type="checkbox" checked={t.selected} readOnly />
                  </td>
                  <td className="p-1">{t.tableName}</td>
                  <td className="p-1 text-right">{t.orderCount}</td>
                  <td className="p-1 text-right">{t.totalAmount.toLocaleString()}</td>
                </tr>
              ))}
              {tables.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-pos-text-muted">
                    정산 가능한 테이블이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 합산 요약 */}
        <div className="rounded bg-pos-surface-alt p-3 text-sm">
          <div className="flex justify-between">
            <span>선택 테이블</span>
            <span className="font-bold">{selectedTables.length}개</span>
          </div>
          <div className="flex justify-between">
            <span>총 주문수</span>
            <span className="font-bold">{totalOrders}건</span>
          </div>
          <div className="flex justify-between border-t border-pos-border pt-1">
            <span>합산 금액</span>
            <span className="text-lg font-bold text-pos-primary">
              {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 액션 */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExecuteCheckout}
            disabled={selectedTables.length === 0}
          >
            일괄 정산
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>닫기</Button>
        </div>
      </div>
    </Modal>
  );
}
