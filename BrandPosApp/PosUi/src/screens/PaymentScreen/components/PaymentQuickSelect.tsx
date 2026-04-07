'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import PaymentMethodSelector from '@shared/ui/organisms/PaymentMethodSelector';

// -------------------------------------------------------------------
// PaymentQuickSelect -- 결제수단 버튼 선택/설정 (account-bselect.md)
//
// ACCOUNT_BSELECT: 65개 버튼 전부 결제 관련 기능.
// BTN 1~15 동적 매핑, QR/더치페이 포함.
// 국가별 결제수단 설정 기반 단일 PaymentMethodGrid로 통합.
// -------------------------------------------------------------------

interface PaymentQuickSelectProps {
  onPaymentMethodSelect: (methodId: string) => void;
  onClose: () => void;
}

// Stub payment methods (to be replaced by RTK Query systemApi.getPaymentMethods)
const PAYMENT_METHODS_KR = [
  { id: 'cash', label: '현금' },
  { id: 'card', label: '카드' },
  { id: 'card2', label: '카드/소비' },
  { id: 'cashbill', label: '현금영수증' },
  { id: 'coupon', label: '쿠폰' },
  { id: 'point', label: '포인트' },
  { id: 'nocash', label: '무현금' },
  { id: 'deposit', label: '예치금' },
  { id: 'payco', label: 'PAYCO' },
  { id: 'kakao', label: '카카오페이' },
  { id: 'zeropay', label: '제로페이' },
];

const DISCOUNT_METHODS = [
  { id: 'discount', label: '할인' },
  { id: 'discount-amount', label: '금액할인' },
  { id: 'discount-percent', label: '%할인' },
  { id: 'service', label: '서비스' },
  { id: 'item-discount', label: '상품할인' },
];

const ACTION_METHODS = [
  { id: 'complete', label: '결제완료' },
  { id: 'reset', label: '결제초기화' },
  { id: 'cancel', label: '결제취소' },
  { id: 'dutchpay-item', label: '더치페이(상품)' },
  { id: 'dutchpay-amount', label: '더치페이(금액)' },
];

export default function PaymentQuickSelect({
  onPaymentMethodSelect,
  onClose,
}: PaymentQuickSelectProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [settingMode, setSettingMode] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setSelectedMethod(id);

    switch (id) {
      case 'cash':
        // TODO: PAYMENT:CASH bridge command
        break;
      case 'card':
      case 'card2':
        // TODO: PAYMENT:CARD bridge command (synchronous-wait)
        break;
      case 'payco':
      case 'kakao':
      case 'zeropay':
        // TODO: PAYMENT:QR bridge command (synchronous-wait, Outbox 재전송 불가)
        break;
      case 'dutchpay-item':
        // TODO: PAYMENT:SPLIT BY_ITEM bridge command
        break;
      case 'dutchpay-amount':
        // TODO: PAYMENT:SPLIT BY_AMOUNT bridge command
        break;
      case 'complete':
        // TODO: PAYMENT:EXECUTE bridge command
        break;
      case 'reset':
        // TODO: PAYMENT:CANCEL (reset) bridge command
        break;
      case 'cancel':
        // TODO: PAYMENT:CANCEL bridge command
        break;
      default:
        // TODO: PAYMENT:EXECUTE with paymentMethodId
        break;
    }

    onPaymentMethodSelect(id);
  }, [onPaymentMethodSelect]);

  const handleSaveSettings = useCallback(() => {
    // TODO: save button layout settings (admin-only)
    console.log('[PaymentQuickSelect] save settings');
  }, []);

  const handleResetSettings = useCallback(() => {
    // TODO: reset button layout settings (admin-only)
    console.log('[PaymentQuickSelect] reset settings');
  }, []);

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Payment methods */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">결제수단</div>
        <PaymentMethodSelector
          methods={PAYMENT_METHODS_KR}
          selectedId={selectedMethod}
          onSelect={handleSelect}
        />
      </div>

      {/* Discount methods */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">할인/서비스</div>
        <div className="grid grid-cols-5 gap-1">
          {DISCOUNT_METHODS.map((m) => (
            <Button
              key={m.id}
              variant={selectedMethod === m.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleSelect(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">결제 액션</div>
        <div className="grid grid-cols-5 gap-1">
          {ACTION_METHODS.map((m) => (
            <Button
              key={m.id}
              variant={m.id === 'cancel' ? 'danger' : 'secondary'}
              size="sm"
              onClick={() => handleSelect(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Dynamic BTN 1~15 grid */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">결제수단 버튼 (BTN 1~15)</div>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 15 }, (_, i) => (
            <button
              key={`btn-${i + 1}`}
              type="button"
              onClick={() => {
                // TODO: PAYMENT:EXECUTE with dynamic paymentMethodId
                handleSelect(`btn-${i + 1}`);
              }}
              className={`
                h-touch rounded-pos-btn text-xs font-medium
                select-none cursor-pointer active:scale-[0.95]
                transition-transform duration-fast
                ${selectedMethod === `btn-${i + 1}`
                  ? 'border-2 border-primary-500 bg-primary-50 text-primary-500'
                  : 'border border-pos-border bg-pos-bg text-pos-text'}
              `}
            >
              BTN {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Settings area (admin-only, conditional) */}
      {settingMode && (
        <div className="flex gap-2 mt-2 border-t border-pos-border pt-2">
          <Button variant="secondary" size="sm" onClick={handleSaveSettings}>저장</Button>
          <Button variant="ghost" size="sm" onClick={handleResetSettings}>초기화</Button>
          <Button variant="ghost" size="sm" onClick={() => {
            // TODO: delete button layout setting
            console.log('[PaymentQuickSelect] delete settings');
          }}>삭제</Button>
        </div>
      )}

      {/* Close */}
      <div className="flex justify-end mt-2">
        <Button variant="ghost" size="sm" onClick={onClose}>닫기</Button>
      </div>
    </div>
  );
}
