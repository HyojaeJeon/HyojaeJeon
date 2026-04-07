'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import PaymentMethodSelector from '@shared/ui/organisms/PaymentMethodSelector';

// -------------------------------------------------------------------
// PaymentQuickSelectVN -- 결제수단 버튼 선택 베트남 로케일 확장
// account-bselect-vn.md 참조
//
// 통합 안내: PaymentQuickSelect(KR)과 단일 PaymentMethodGrid로 통합.
// 본 컴포넌트는 VN 로케일 고유 차이점을 캡슐화:
// - ZALOPAY, NAPAS, UserPayment1~4 버튼 추가
// - 언어 선택 버튼(KR/EN/VN) 추가
// - 한국 전용 결제수단(카드, 현금영수증, 무현금 등) 숨김 처리
// -------------------------------------------------------------------

interface PaymentQuickSelectVNProps {
  locale: string;
  onPaymentMethodSelect: (methodId: string) => void;
  onLanguageChange: (lang: string) => void;
  onClose: () => void;
}

// VN-specific payment methods
const PAYMENT_METHODS_VN = [
  { id: 'cash', label: 'Tien mat' },
  { id: 'zalopay', label: 'ZALOPAY' },
  { id: 'napas', label: 'NAPAS' },
  { id: 'point', label: 'Diem' },
  { id: 'userpay1', label: 'UserPay 1' },
  { id: 'userpay2', label: 'UserPay 2' },
  { id: 'userpay3', label: 'UserPay 3' },
  { id: 'userpay4', label: 'UserPay 4' },
];

const LANGUAGES = ['KR', 'EN', 'VN'] as const;

export default function PaymentQuickSelectVN({
  locale,
  onPaymentMethodSelect,
  onLanguageChange,
  onClose,
}: PaymentQuickSelectVNProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [currentLang, setCurrentLang] = useState<string>(locale);

  const handleSelect = useCallback((id: string) => {
    setSelectedMethod(id);

    switch (id) {
      case 'cash':
        // TODO: PAYMENT:CASH bridge command
        break;
      case 'zalopay':
        // TODO: PAYMENT:QR bridge command with gateway=ZALOPAY (synchronous-wait, Outbox 재전송 불가)
        break;
      case 'napas':
        // TODO: PAYMENT:CARD bridge command for NAPAS (synchronous-wait)
        break;
      case 'userpay1':
      case 'userpay2':
      case 'userpay3':
      case 'userpay4':
        // TODO: PAYMENT:EXECUTE bridge command with UserPayment
        break;
      default:
        // TODO: PAYMENT:EXECUTE with paymentMethodId
        break;
    }

    onPaymentMethodSelect(id);
  }, [onPaymentMethodSelect]);

  const handleLanguageChange = useCallback((lang: string) => {
    setCurrentLang(lang);
    // TODO: global i18n language switch (app-wide, not payment-screen-specific)
    onLanguageChange(lang);
    console.log('[PaymentQuickSelectVN] language changed to:', lang);
  }, [onLanguageChange]);

  // Only show VN-specific content when locale is 'vi'
  if (locale !== 'vi') return null;

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Language selector */}
      <div className="flex gap-1 justify-end">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => handleLanguageChange(lang.toLowerCase())}
            className={`
              px-3 py-1 rounded-pos-btn text-xs font-semibold
              select-none cursor-pointer active:scale-[0.95]
              transition-transform duration-fast
              ${currentLang === lang.toLowerCase()
                ? 'bg-primary-500 text-white'
                : 'bg-pos-bg text-pos-text border border-pos-border'}
            `}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* VN payment methods */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">Phuong thuc thanh toan</div>
        <PaymentMethodSelector
          methods={PAYMENT_METHODS_VN}
          selectedId={selectedMethod}
          onSelect={handleSelect}
        />
      </div>

      {/* Close */}
      <div className="flex justify-end mt-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Dong</Button>
      </div>
    </div>
  );
}
