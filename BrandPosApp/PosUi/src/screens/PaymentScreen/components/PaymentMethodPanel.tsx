'use client';

import Button from '@shared/ui/atoms/Button';
import { usePosI18n } from '@i18n/PosI18nProvider';

// -------------------------------------------------------------------
// PaymentMethodPanel -- 결제수단 버튼 (현금/카드/포인트/쿠폰/무현금 등)
// account-dialog.md AD-F01~F05 / account-bselect.md 참조
// -------------------------------------------------------------------

interface PaymentMethodPanelProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  onCash: () => void;
  onCard: () => void;
  onPoint: () => void;
}

const PAYMENT_METHODS = [
  { id: 'cash', key: 'payment.cash', priority: 'P0' },
  { id: 'card', key: 'payment.card', priority: 'P0' },
  { id: 'point', key: 'payment.point', priority: 'P0' },
  { id: 'coupon', key: 'payment.coupon', priority: 'P1' },
  { id: 'nocash', key: 'payment.nocash', priority: 'P1' },
  { id: 'cashbill', key: 'payment.cashbill', priority: 'P1' },
] as const;

export default function PaymentMethodPanel({
  selectedMethod,
  onSelectMethod,
  onCash,
  onCard,
  onPoint,
}: PaymentMethodPanelProps) {
  const { t } = usePosI18n();
  const handleClick = (methodId: string) => {
    onSelectMethod(methodId);
    switch (methodId) {
      case 'cash':
        onCash();
        break;
      case 'card':
        onCard();
        break;
      case 'point':
        onPoint();
        break;
      default:
        // TODO: handle coupon, nocash, cashbill
        break;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {PAYMENT_METHODS.map((method) => (
        <Button
          key={method.id}
          variant={selectedMethod === method.id ? 'primary' : 'secondary'}
          size="md"
          fullWidth
          onClick={() => handleClick(method.id)}
        >
          {t(method.key)}
        </Button>
      ))}
    </div>
  );
}
