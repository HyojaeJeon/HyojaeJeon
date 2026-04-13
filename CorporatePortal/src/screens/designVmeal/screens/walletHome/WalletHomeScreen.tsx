'use client';

import { Bell } from 'lucide-react';
import { MOCK_EMPLOYEE } from '../../mockData';
import { BalanceCard } from './BalanceCard';
import { QuickActions } from './QuickActions';
import { RecentTransactions } from './RecentTransactions';
import { NearbyMerchants } from './NearbyMerchants';
import { useVmealT } from '../../i18n/useVmealT';

export default function WalletHomeScreen() {
  const { t } = useVmealT();
  const firstName = MOCK_EMPLOYEE.name.split(' ').pop() ?? MOCK_EMPLOYEE.name;

  return (
    <div className="flex flex-col bg-[#F8FAFC] px-5 pt-2 pb-6">
      {/* Greeting row */}
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-xs text-gray-400">{t('wallet.greeting')}</p>
          <p className="text-lg font-bold text-gray-900">{firstName}</p>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm">
          <Bell size={18} className="text-gray-600" />
          {/* Notification dot */}
          <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-6 mt-2">
        {/* Balance card */}
        <BalanceCard />

        {/* Quick actions */}
        <QuickActions />

        {/* Recent transactions */}
        <RecentTransactions />

        {/* Nearby merchants */}
        <NearbyMerchants />
      </div>
    </div>
  );
}
