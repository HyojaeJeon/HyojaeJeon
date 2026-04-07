'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ────────────────────────────────────────────

interface PaymentMemoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (memo: string) => void;
  initialMemo?: string;
}

// ─── Component ────────────────────────────────────────

export default function PaymentMemoDialog({
  open,
  onClose,
  onSave,
  initialMemo = '',
}: PaymentMemoDialogProps) {
  const [memo, setMemo] = useState<string>(initialMemo);

  const handleSave = useCallback(() => {
    // TODO: PAYMENT:SET_MEMO bridge call
    // Payload: { memo }
    onSave(memo);
  }, [memo, onSave]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="결제 메모"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="space-y-3">
        <TextInput
          value={memo}
          onChange={setMemo}
          placeholder="메모를 입력하세요..."
          fullWidth
        />
      </div>
    </Modal>
  );
}
