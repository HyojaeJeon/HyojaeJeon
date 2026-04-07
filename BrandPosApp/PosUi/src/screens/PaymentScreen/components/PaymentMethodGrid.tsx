'use client';

import { useState } from 'react';

// -------------------------------------------------------------------
// PaymentMethodGrid -- ABTN 1~15 동적 결제수단 그리드
// account-bselect.md ABS-F50 / 서버 설정 기반 동적 배치
// -------------------------------------------------------------------

interface PaymentMethodButton {
  id: string;
  label: string;
  methodId: string;
  visible: boolean;
}

interface PaymentMethodGridProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

// Stub: 서버 설정 기반 결제수단 버튼 (to be replaced by RTK Query systemApi.getPaymentButtonLayout)
const STUB_BUTTONS: PaymentMethodButton[] = Array.from({ length: 15 }, (_, i) => ({
  id: `abtn-${i + 1}`,
  label: `BTN ${i + 1}`,
  methodId: `btn-${i + 1}`,
  visible: i < 6, // stub: first 6 visible
}));

export default function PaymentMethodGrid({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodGridProps) {
  // TODO: Replace with RTK Query (systemApi: getPaymentButtonLayout)
  const [buttons] = useState<PaymentMethodButton[]>(STUB_BUTTONS);

  const visibleButtons = buttons.filter((b) => b.visible);

  return (
    <div>
      <div className="text-xs text-pos-text-muted mb-2 font-semibold">결제수단</div>
      <div className="grid grid-cols-5 gap-1">
        {visibleButtons.map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => {
              onSelectMethod(btn.methodId);
              // TODO: PAYMENT:EXECUTE bridge command with paymentMethodId
              console.log('[PaymentMethodGrid] selected:', btn.methodId);
            }}
            className={`
              h-touch rounded-pos-btn text-xs font-semibold
              transition-transform duration-fast select-none cursor-pointer
              active:scale-[0.95]
              ${selectedMethod === btn.methodId
                ? 'border-2 border-primary-500 bg-primary-50 text-primary-500'
                : 'border border-pos-border bg-pos-bg text-pos-text'}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
