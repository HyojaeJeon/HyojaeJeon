'use client';

/**
 * PrintReceiptDialog (SET-PRINTRECE-DLG / PRINTRECE_DLG)
 *
 * 일반 영수증 인쇄 양식 설정.
 *
 * Legacy: IDD_PRINTRECE_DLG
 * Bridge: SETUP:PRINT_RECEIPT:GET_CONFIG, SETUP:PRINT_RECEIPT:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Radio from '@shared/ui/atoms/Radio';

// ─── Types ───

type FontSize = 'small' | 'medium' | 'large';

interface ReceiptPrintItem {
  key: string;
  label: string;
  visible: boolean;
  fontSize: FontSize;
}

interface PrintReceiptDialogProps {
  open: boolean;
  onClose: () => void;
}

const RECEIPT_ITEMS: { key: string; label: string }[] = [
  { key: 'logoBarcode', label: '로고/바코드' },
  { key: 'title', label: '타이틀' },
  { key: 'slipNumber', label: '전표번호' },
  { key: 'tableName', label: '테이블명' },
  { key: 'salesTime', label: '판매시간' },
  { key: 'staffNumber', label: '담당번호' },
  { key: 'productMenu', label: '상품메뉴' },
  { key: 'subtotal', label: '합계' },
  { key: 'discount', label: '할인금액' },
  { key: 'laborCost', label: '인건비' },
  { key: 'bottomMargin', label: '하단여백' },
];

const FONT_LABEL: Record<FontSize, string> = { small: '소', medium: '중', large: '대' };

// ─── Component ───

export default function PrintReceiptDialog({
  open,
  onClose,
}: PrintReceiptDialogProps) {
  const [items, setItems] = useState<ReceiptPrintItem[]>(
    RECEIPT_ITEMS.map((ri) => ({
      key: ri.key,
      label: ri.label,
      visible: true,
      fontSize: 'medium',
    }))
  );

  // TODO: RTK Query - setupApi.useGetPrintReceiptConfigQuery()
  // TODO: RTK Query - setupApi.useSavePrintReceiptConfigMutation()

  const handleToggleVisible = useCallback((key: string) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, visible: !it.visible } : it))
    );
  }, []);

  const handleFontChange = useCallback((key: string, fontSize: FontSize) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, fontSize } : it))
    );
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:PRINT_RECEIPT:SAVE 호출
  }, [items]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="일반 영수증 인쇄 설정"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-4">
              <Checkbox
                checked={item.visible}
                onChange={() => handleToggleVisible(item.key)}
              />
              <span className="w-28 text-sm text-pos-text">{item.label}</span>
              <div className="flex gap-3">
                {(['small', 'medium', 'large'] as const).map((fs) => (
                  <Radio
                    key={fs}
                    name={`receipt-font-${item.key}`}
                    checked={item.fontSize === fs}
                    onChange={() => handleFontChange(item.key, fs)}
                    label={FONT_LABEL[fs]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FullScreenPanel>
  );
}
