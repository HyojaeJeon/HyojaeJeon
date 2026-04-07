'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Dropdown from '@shared/ui/molecules/Dropdown';

// -------------------------------------------------------------------
// SalesViewSelectDialog -- 매출 조회 조건 설정 모달 (sellview-select.md)
//
// SELLVIEW의 조회 조건 설정 모달.
// POS번호, 테이블명 선택, 영수증번호/금액 입력, 판매타입 체크박스 필터.
// 신규 구조: SalesScreen 내부 필터 모달/패널로 통합.
// -------------------------------------------------------------------

interface SalesFilterValues {
  posNo: string;
  tableName: string;
  receiptNo: string;
  amount: string;
  sellTypes: boolean[];
}

interface SalesViewSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (filters: SalesFilterValues) => void;
}

const SELL_TYPE_LABELS = [
  '일반판매',
  '포장판매',
  '배달판매',
  '반품',
  '미수',
  '기타',
];

// Stub POS list (to be replaced by RTK Query systemApi.getPosList)
const STUB_POS_LIST = [
  { value: '', label: '전체' },
  { value: 'POS01', label: 'POS 1' },
  { value: 'POS02', label: 'POS 2' },
  { value: 'POS03', label: 'POS 3' },
];

// Stub table list (to be replaced by RTK Query tableApi.getTableList)
const STUB_TABLE_LIST = [
  { value: '', label: '전체' },
  { value: 'T-01', label: 'T-01' },
  { value: 'T-02', label: 'T-02' },
  { value: 'T-03', label: 'T-03' },
  { value: 'T-05', label: 'T-05' },
];

export default function SalesViewSelectDialog({
  open,
  onClose,
  onConfirm,
}: SalesViewSelectDialogProps) {
  const [posNo, setPosNo] = useState<string>('');
  const [tableName, setTableName] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [sellTypes, setSellTypes] = useState<boolean[]>(new Array(6).fill(true));

  const handleToggleSellType = useCallback((index: number) => {
    setSellTypes((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const filters: SalesFilterValues = {
      posNo,
      tableName,
      receiptNo,
      amount,
      sellTypes,
    };
    // TODO: triggers SALES:SEARCH bridge command in parent SalesScreen
    onConfirm(filters);
    console.log('[SalesViewSelectDialog] confirm filters:', filters);
  }, [posNo, tableName, receiptNo, amount, sellTypes, onConfirm]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="매출 조회 조건"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleConfirm}>확인</Button>
          <Button variant="secondary" size="sm" onClick={handleCancel}>취소</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* POS number dropdown */}
        <div className="shrink-0 flex flex-col gap-1">
          <label className="text-xs font-semibold text-pos-text-secondary">POS 번호</label>
          <Dropdown
            options={STUB_POS_LIST}
            value={posNo}
            onChange={setPosNo}
          />
        </div>

        {/* Table name dropdown */}
        <div className="shrink-0 flex flex-col gap-1">
          <label className="text-xs font-semibold text-pos-text-secondary">테이블명</label>
          <Dropdown
            options={STUB_TABLE_LIST}
            value={tableName}
            onChange={setTableName}
          />
        </div>

        {/* Receipt number / Amount input */}
        <div className="shrink-0 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-pos-text-secondary">영수증번호</label>
            <input
              type="text"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              className="h-touch rounded-pos-btn border border-pos-border px-3 text-sm text-pos-text bg-pos-bg"
              placeholder="영수증번호"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-pos-text-secondary">금액</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-touch rounded-pos-btn border border-pos-border px-3 text-sm text-pos-text bg-pos-bg tabular-nums"
              placeholder="금액"
            />
          </div>
        </div>

        {/* Sell type checkboxes */}
        <div className="shrink-0 flex flex-col gap-2">
          <label className="text-xs font-semibold text-pos-text-secondary">판매타입</label>
          <div className="grid grid-cols-3 gap-2">
            {SELL_TYPE_LABELS.map((label, idx) => (
              <Checkbox
                key={label}
                checked={sellTypes[idx]}
                onChange={() => handleToggleSellType(idx)}
                label={label}
              />
            ))}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
