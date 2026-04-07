'use client';

/**
 * ZaloOAPaymentDialog (SET-ZALOOA-PAYMENT-DLG / ZALOOA_PAYMENT_DLG)
 *
 * Zalo OA 결제 알림 템플릿 필드 매핑 설정 모달.
 * 9개 필드: 주문코드, 날짜, 사용포인트, 추가포인트, 결제금액,
 * 고객이름, 설명, 총포인트, 잔여포인트.
 *
 * Legacy: IDD_ZALOOA_PAYMENT_DLG
 * Bridge: SETUP:ZALO_OA_PAYMENT:GET_CONFIG, SETUP:ZALO_OA_PAYMENT:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ───

interface PaymentTemplateMapping {
  orderCode: string;
  date: string;
  usedPoints: string;
  addedPoints: string;
  paymentAmount: string;
  customerName: string;
  description: string;
  totalPoints: string;
  remainingPoints: string;
}

interface ZaloOAPaymentDialogProps {
  open?: boolean;
  onClose: () => void;
  onSave?: (mapping: PaymentTemplateMapping) => void;
}

const INITIAL_MAPPING: PaymentTemplateMapping = {
  orderCode: '',
  date: '',
  usedPoints: '',
  addedPoints: '',
  paymentAmount: '',
  customerName: '',
  description: '',
  totalPoints: '',
  remainingPoints: '',
};

const FIELDS: { key: keyof PaymentTemplateMapping; label: string }[] = [
  { key: 'orderCode', label: '주문코드' },
  { key: 'date', label: '날짜' },
  { key: 'usedPoints', label: '사용포인트' },
  { key: 'addedPoints', label: '추가포인트' },
  { key: 'paymentAmount', label: '결제금액' },
  { key: 'customerName', label: '고객이름' },
  { key: 'description', label: '설명' },
  { key: 'totalPoints', label: '총포인트' },
  { key: 'remainingPoints', label: '잔여포인트' },
];

// ─── Component ───

export default function ZaloOAPaymentDialog({
  open = true,
  onClose,
  onSave,
}: ZaloOAPaymentDialogProps) {
  const [mapping, setMapping] = useState<PaymentTemplateMapping>(INITIAL_MAPPING);

  // TODO: RTK Query - setupApi.useGetZaloOAPaymentConfigQuery()
  // TODO: RTK Query - setupApi.useSaveZaloOAPaymentConfigMutation()

  const handleChange = useCallback((field: keyof PaymentTemplateMapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:ZALO_OA_PAYMENT:SAVE 호출
    onSave?.(mapping);
  }, [mapping, onSave]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="Zalo OA 결제 템플릿 매핑"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <TextInput
              key={f.key}
              label={f.label}
              value={mapping[f.key]}
              onChange={(v) => handleChange(f.key, v)}
              placeholder="Zalo 템플릿 변수명 입력"
            />
          ))}
        </div>
      </div>
    </FullScreenPanel>
  );
}
