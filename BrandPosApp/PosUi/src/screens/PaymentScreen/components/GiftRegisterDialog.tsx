'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import DatePicker from '@shared/ui/molecules/DatePicker';

// ─── Types ────────────────────────────────────────────

interface GiftRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

// ─── Component ────────────────────────────────────────

export default function GiftRegisterDialog({ open, onClose, onSaved }: GiftRegisterDialogProps) {
  const [giftCode, setGiftCode] = useState('');
  const [amount, setAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [customerName, setCustomerName] = useState('');

  const handleSave = useCallback(() => {
    if (!giftCode.trim() || !amount.trim()) return;
    // TODO: GIFT:REGISTER bridge call with idempotencyKey
    // Payload: { code: giftCode, amount: parseInt(amount), expiryDate, customerName }
    onSaved?.();
    onClose();
  }, [giftCode, amount, expiryDate, customerName, onSaved, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="상품권 등록"
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!giftCode.trim() || !amount.trim()}
          >
            저장
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextInput
          label="상품권 코드"
          value={giftCode}
          onChange={setGiftCode}
          placeholder="상품권 코드를 입력하세요"
          fullWidth
        />
        <TextInput
          label="금액"
          value={amount}
          onChange={setAmount}
          placeholder="금액을 입력하세요"
          fullWidth
        />
        <div>
          <DatePicker
            value={expiryDate}
            onChange={setExpiryDate}
            label="유효기한"
          />
        </div>
        <TextInput
          label="고객명"
          value={customerName}
          onChange={setCustomerName}
          placeholder="고객명 (선택)"
          fullWidth
        />
      </div>
    </Modal>
  );
}
