'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import PaymentMethodSelector from '@shared/ui/organisms/PaymentMethodSelector';

// -------------------------------------------------------------------
// OrderPaymentQuickSelect -- 주문+결제 통합 화면의 결제수단 선택 (oracc-bselect.md)
//
// 가장 많은 결제수단(현금/카드/ZALOPAY/NAPAS/HJ VIETPAY/INFOPLUS/PAYCO 등)과
// 기능 버튼을 포함하는 결제수단 선택/배치 관리 화면.
// -------------------------------------------------------------------

interface OrderPaymentQuickSelectProps {
  locale: string;
  onPaymentMethodSelect: (methodId: string) => void;
  onClose: () => void;
}

// All payment methods (country-conditional rendering via settings)
const ALL_PAYMENT_METHODS = [
  { id: 'cash', label: '현금', country: 'all' },
  { id: 'card', label: '카드', country: 'kr' },
  { id: 'zalopay', label: 'ZALOPAY', country: 'vn' },
  { id: 'napas', label: 'NAPAS', country: 'vn' },
  { id: 'hjvietpay', label: 'HJ VIETPAY', country: 'vn' },
  { id: 'infoplus-shinhan', label: 'INFOPLUS (SHINHAN)', country: 'vn' },
  { id: 'infoplus-bidv', label: 'INFOPLUS (BIDV)', country: 'vn' },
  { id: 'infoplus-woori', label: 'INFOPLUS (WOORI)', country: 'vn' },
  { id: 'payco', label: 'PAYCO', country: 'kr' },
  { id: 'kakao', label: '카카오페이', country: 'kr' },
  { id: 'zeropay', label: '제로페이', country: 'kr' },
  { id: 'userpay1', label: 'UserPay 1', country: 'vn' },
  { id: 'userpay2', label: 'UserPay 2', country: 'vn' },
  { id: 'userpay3', label: 'UserPay 3', country: 'vn' },
  { id: 'userpay4', label: 'UserPay 4', country: 'vn' },
];

const ORDER_ACTIONS = [
  { id: 'service', label: '서비스' },
  { id: 'packing', label: '포장' },
  { id: 'delivery', label: '배달' },
  { id: 'input-customer', label: '입력&고객' },
  { id: 'qty-minus', label: '수량-1' },
  { id: 'set-menu', label: '세트메뉴' },
  { id: 'item-discount', label: '상품할인' },
  { id: 'etc-payment', label: '기타결제' },
  { id: 'discount', label: '할인' },
  { id: 'discount-10', label: '10%할인' },
  { id: 'cancel-one', label: '개별취소' },
  { id: 'cancel-all', label: '전체취소' },
  { id: 'sale-manage', label: '판매관리' },
  { id: 'payment-reset', label: '결제초기화' },
  { id: 'hold', label: 'T보류' },
  { id: 'hold-load', label: '보류불러오기' },
  { id: 'kitchen-memo', label: '주방메모' },
  { id: 'search-member', label: '회원검색' },
  { id: 'search-item', label: '상품검색' },
];

const BOTTOM_ACTIONS = [
  { id: 'order-complete', label: '주문완료' },
  { id: 'payment-complete', label: '결제완료' },
  { id: 'e-voucher', label: '전자상품권' },
  { id: 'dutchpay', label: '더치페이' },
  { id: 'temp-price', label: '임시단가' },
  { id: 'qty-input', label: '수량' },
  { id: 'reissue-sale', label: '매출재발행' },
  { id: 'reissue-receipt', label: '영수증재발행' },
];

export default function OrderPaymentQuickSelect({
  locale,
  onPaymentMethodSelect,
  onClose,
}: OrderPaymentQuickSelectProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(locale);

  // Filter payment methods by country (stub: based on locale)
  const countryFilter = locale === 'vi' ? 'vn' : 'kr';
  const filteredPaymentMethods = ALL_PAYMENT_METHODS.filter(
    (m) => m.country === 'all' || m.country === countryFilter
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedMethod(id);

    switch (id) {
      case 'cash':
        // TODO: PAYMENT:CASH bridge command
        break;
      case 'card':
        // TODO: PAYMENT:CARD bridge command (synchronous-wait, offline blocked)
        break;
      case 'zalopay':
        // TODO: PAYMENT:EXECUTE with gateway=ZALOPAY (synchronous-wait, Outbox 불가)
        break;
      case 'napas':
        // TODO: PAYMENT:CARD bridge command for NAPAS
        break;
      case 'hjvietpay':
        // TODO: PAYMENT:EXECUTE with gateway=HJVIETPAY (synchronous-wait)
        break;
      case 'infoplus-shinhan':
      case 'infoplus-bidv':
      case 'infoplus-woori':
        // TODO: PAYMENT:EXECUTE with gateway=INFOPLUS_* (synchronous-wait)
        break;
      case 'service':
        // TODO: ORDER:APPLY_SERVICE bridge command
        break;
      case 'packing':
        // TODO: ORDER:SET_PACKING bridge command
        break;
      case 'delivery':
        // TODO: ORDER:SET_DELIVERY bridge command
        break;
      case 'cancel-one':
        // TODO: ORDER:REMOVE_ITEM bridge command
        break;
      case 'cancel-all':
        // TODO: ORDER:CANCEL bridge command
        break;
      case 'discount':
        // TODO: ORDER:APPLY_DISCOUNT bridge command
        break;
      case 'order-complete':
        // TODO: ORDER:COMPLETE bridge command
        break;
      case 'payment-complete':
        // TODO: PAYMENT:EXECUTE bridge command
        break;
      case 'payment-reset':
        // TODO: PAYMENT:VOID bridge command
        break;
      default:
        // TODO: handle remaining actions
        break;
    }

    onPaymentMethodSelect(id);
    console.log('[OrderPaymentQuickSelect] selected:', id);
  }, [onPaymentMethodSelect]);

  return (
    <div className="flex flex-col gap-3 p-4 overflow-auto">
      {/* Language selector + PLU Area */}
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {['KR', 'EN', 'VN'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setSelectedLanguage(lang.toLowerCase());
                // TODO: global i18n language switch
                console.log('[OrderPaymentQuickSelect] language:', lang);
              }}
              className={`
                px-2 py-1 rounded-pos-btn text-xs font-semibold
                select-none cursor-pointer active:scale-[0.95]
                ${selectedLanguage === lang.toLowerCase()
                  ? 'bg-primary-500 text-white'
                  : 'bg-pos-bg text-pos-text border border-pos-border'}
              `}
            >
              {lang}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>닫기</Button>
      </div>

      {/* Payment methods grid */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">결제수단</div>
        <PaymentMethodSelector
          methods={filteredPaymentMethods}
          selectedId={selectedMethod}
          onSelect={handleSelect}
        />
      </div>

      {/* Order/payment action buttons */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">주문/결제 액션</div>
        <div className="grid grid-cols-5 gap-1">
          {ORDER_ACTIONS.map((a) => (
            <Button
              key={a.id}
              variant={selectedMethod === a.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleSelect(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bottom action buttons */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">완료/기타</div>
        <div className="grid grid-cols-4 gap-1">
          {BOTTOM_ACTIONS.map((a) => (
            <Button
              key={a.id}
              variant={a.id === 'order-complete' || a.id === 'payment-complete' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleSelect(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom function buttons (IDC_OA_BTN1~17) */}
      <div>
        <div className="text-xs text-pos-text-muted mb-2 font-semibold">커스텀 기능 버튼</div>
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 17 }, (_, i) => (
            <button
              key={`oabtn-${i + 1}`}
              type="button"
              onClick={() => {
                // TODO: custom action based on buttonConfig
                console.log('[OrderPaymentQuickSelect] custom btn:', i + 1);
              }}
              className="
                h-touch rounded-pos-btn text-xs font-medium
                bg-pos-bg border border-pos-border text-pos-text
                select-none cursor-pointer active:scale-[0.95]
                active:bg-primary-50 transition-transform duration-fast
              "
            >
              BTN {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Button layout settings (admin-only) */}
      <div className="flex gap-2 border-t border-pos-border pt-2">
        <Button variant="ghost" size="sm" onClick={() => {
          // TODO: delete button layout (admin-only)
          console.log('[OrderPaymentQuickSelect] delete layout');
        }}>삭제</Button>
        <Button variant="ghost" size="sm" onClick={() => {
          // TODO: reset button layout (admin-only)
          console.log('[OrderPaymentQuickSelect] reset layout');
        }}>초기화</Button>
        <Button variant="ghost" size="sm" onClick={() => {
          // TODO: save button layout (admin-only)
          console.log('[OrderPaymentQuickSelect] save layout');
        }}>저장</Button>
      </div>
    </div>
  );
}
