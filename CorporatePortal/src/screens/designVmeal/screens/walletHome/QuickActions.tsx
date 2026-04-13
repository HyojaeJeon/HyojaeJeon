'use client';

import { ShoppingBag, Plus, Users } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';

export function QuickActions() {
  const { t } = useVmealT();

  const ACTIONS = [
    {
      icon: ShoppingBag,
      label: t('wallet.order'),
      bgColor: 'bg-blue-50',
      iconColor: 'text-[#3B82F6]',
    },
    {
      icon: Plus,
      label: t('wallet.topUp'),
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      icon: Users,
      label: t('wallet.groupPay'),
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ];
  return (
    <div className="flex items-center justify-center gap-8">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.label} className="flex flex-col items-center gap-2">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${action.bgColor}`}
            >
              <Icon size={22} className={action.iconColor} />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
