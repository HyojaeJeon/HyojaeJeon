'use client';

import { QrCode, CreditCard, Smartphone, Landmark } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockPaymentMethod } from '../../types';

interface PaymentMethodListProps {
  methods: MockPaymentMethod[];
  selectedId: string;
}

const TYPE_ICONS: Record<MockPaymentMethod['type'], typeof QrCode> = {
  NAPAS_QR: QrCode,
  VISA_MASTERCARD: CreditCard,
  MOMO: Smartphone,
  ZALOPAY: Smartphone,
  BANK_TRANSFER: Landmark,
};

export function PaymentMethodList({ methods, selectedId }: PaymentMethodListProps) {
  const { t } = useVmealT();

  const STATUS_CONFIG: Record<
    MockPaymentMethod['status'],
    { label: string; textColor: string; bgColor: string; showLink?: boolean }
  > = {
    AVAILABLE: { label: t('topUp.available'), textColor: 'text-[#10B981]', bgColor: 'bg-[#10B981]/10' },
    LINKED: { label: t('topUp.linked'), textColor: 'text-[#3B82F6]', bgColor: 'bg-[#3B82F6]/10' },
    NOT_LINKED: {
      label: t('topUp.notLinked'),
      textColor: 'text-gray-400',
      bgColor: 'bg-gray-100',
      showLink: true,
    },
  };
  return (
    <div className="space-y-3">
      <p className="text-[15px] font-semibold text-gray-900">{t('topUp.paymentMethod')}</p>

      <div className="space-y-2">
        {methods.map((method) => {
          const Icon = TYPE_ICONS[method.type];
          const statusCfg = STATUS_CONFIG[method.status];
          const isSelected = method.id === selectedId;

          return (
            <div
              key={method.id}
              className={`flex items-center gap-3 rounded-xl border bg-white p-4 transition-colors ${
                isSelected ? 'border-[#3B82F6]' : 'border-gray-100'
              }`}
            >
              {/* Radio */}
              <div
                className={`flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 ${
                  isSelected ? 'border-[#3B82F6]' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="h-[10px] w-[10px] rounded-full bg-[#3B82F6]" />}
              </div>

              {/* Icon */}
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-gray-50">
                <Icon size={20} className="text-gray-600" />
              </div>

              {/* Name */}
              <span className="flex-1 text-[14px] font-medium text-gray-900">{method.name}</span>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCfg.textColor} ${statusCfg.bgColor}`}
                >
                  {statusCfg.label}
                </span>
                {statusCfg.showLink && (
                  <button className="text-[12px] font-medium text-[#3B82F6]">{t('topUp.linkNow')}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
