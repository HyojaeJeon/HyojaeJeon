'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';

interface PaymentMethod {
  id: string;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
}

interface PaymentMethodSelectorProps {
  methods?: PaymentMethod[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const DEFAULT_METHODS: PaymentMethod[] = [
  { id: 'cash', label: 'payment.cash' },
  { id: 'card', label: 'payment.card' },
  { id: 'point', label: 'payment.point' },
  { id: 'coupon', label: 'payment.coupon' },
  { id: 'discount', label: 'payment.discount' },
  { id: 'combined', label: 'payment.combined' },
];

/**
 * PaymentMethodSelector -- 결제 수단 선택 그리드
 *
 * 3열 그리드로 결제 수단 버튼을 배치한다.
 * 선택된 항목은 primary-500 테두리로 표시한다.
 */
export default function PaymentMethodSelector({
  methods = DEFAULT_METHODS,
  selectedId,
  onSelect,
}: PaymentMethodSelectorProps) {
  const { t } = usePosI18n();

  return (
    <div className="grid grid-cols-3 gap-2">
      {methods.map((method) => {
        const isActive = selectedId === method.id;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`
              flex flex-col items-center justify-center gap-1
              h-touch-xl rounded-pos-btn
              font-semibold text-md
              transition-transform duration-fast ease-default
              select-none cursor-pointer
              active:scale-[0.95]
              ${isActive
                ? 'border-2 border-primary-500 bg-primary-50 text-primary-500'
                : 'border border-pos-border bg-pos-bg text-pos-text'}
            `}
          >
            {method.icon && <span className="shrink-0">{method.icon}</span>}
            <span>{t(method.label)}</span>
            {method.sub && (
              <span className="text-2xs text-pos-text-muted font-regular">{method.sub}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
