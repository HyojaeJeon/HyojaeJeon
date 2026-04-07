'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import NumPad from '@shared/ui/molecules/NumPad';

// ─── Types ────────────────────────────────────────────

interface GiftUseDialogProps {
  open: boolean;
  onClose: () => void;
  onApply?: (giftCode: string, amount: number) => void;
}

// ─── Component ────────────────────────────────────────

export default function GiftUseDialog({ open, onClose, onApply }: GiftUseDialogProps) {
  const [giftCode, setGiftCode] = useState('');
  const [displayAmount, setDisplayAmount] = useState<number | null>(null);

  const handleNumpadInput = useCallback((key: string) => {
    setGiftCode((prev) => prev + key);
  }, []);

  const handleClear = useCallback(() => {
    setGiftCode('');
    setDisplayAmount(null);
  }, []);

  const handleBackspace = useCallback(() => {
    setGiftCode((prev) => prev.slice(0, -1));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!giftCode.trim()) return;
    // TODO: GIFT:VALIDATE bridge call to check code and get amount
    // Stub: simulate validation result
    setDisplayAmount(50000);
  }, [giftCode]);

  const handleApply = useCallback(() => {
    if (!giftCode.trim() || displayAmount === null) return;
    // TODO: GIFT:USE bridge call with idempotencyKey
    // Payload: { code: giftCode, amount: displayAmount }
    onApply?.(giftCode, displayAmount);
    onClose();
  }, [giftCode, displayAmount, onApply, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="상품권 사용"
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={!giftCode.trim() || displayAmount === null}
          >
            적용
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Gift code display */}
        <div>
          <label className="text-xs font-medium text-pos-text mb-1 block">상품권 코드</label>
          <div className="border border-pos-border rounded-pos px-3 py-2 text-sm tabular-nums font-mono min-h-[36px] bg-white">
            {giftCode || <span className="text-pos-text-muted">코드를 입력하세요</span>}
          </div>
        </div>

        {/* Amount display */}
        {displayAmount !== null && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-pos-lg">
            <span className="text-xs text-pos-text-muted">금액:</span>
            <span className="text-sm font-bold text-primary-700 tabular-nums">
              {displayAmount.toLocaleString()}원
            </span>
          </div>
        )}

        {/* NumPad */}
        <div className="flex justify-center">
          <NumPad
            onInput={handleNumpadInput}
            onConfirm={handleConfirm}
            onClear={handleClear}
            onBackspace={handleBackspace}
          />
        </div>
      </div>
    </Modal>
  );
}
