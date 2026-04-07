'use client';

import { useEffect, useState } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

export interface MemoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (memo: string) => void;
  initialMemo?: string;
  title?: string;
  placeholder?: string;
  maxLength?: number;
}

/**
 * 공용 메모 입력 다이얼로그.
 * 주방 메모, 주문 메모, 결제 메모 등 범용으로 사용.
 */
export default function MemoDialog({
  open,
  onClose,
  onSave,
  initialMemo = '',
  title = '메모',
  placeholder = '메모를 입력하세요...',
  maxLength = 200,
}: MemoDialogProps) {
  const [memo, setMemo] = useState<string>(initialMemo);

  useEffect(() => {
    if (open) setMemo(initialMemo);
  }, [open, initialMemo]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(memo)}>저장</Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          rows={5}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-pos-text placeholder:text-pos-text-muted focus:outline-none focus:border-primary-500"
        />
        <div className="text-right text-[11px] text-pos-text-muted tabular-nums">
          {memo.length} / {maxLength}
        </div>
      </div>
    </Modal>
  );
}
