'use client';

import { Eye } from 'lucide-react';
import { MOCK_WALLET, formatVnd } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

export function BalanceCard() {
  const { t } = useVmealT();
  const {
    balanceVnd,
    companyAllowanceVnd,
    personalTopUpVnd,
    dailySpentVnd,
    dailyLimitVnd,
  } = MOCK_WALLET;

  const spentRatio = Math.min(dailySpentVnd / dailyLimitVnd, 1);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#3B82F6] to-[#6366F1] p-6">
      {/* Top row: label + eye */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">{t('wallet.balance')}</span>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Eye size={16} className="text-white/70" />
        </button>
      </div>

      {/* Main balance */}
      <p className="mt-2 text-3xl font-bold text-white">
        {formatVnd(balanceVnd)}
      </p>

      {/* Sub rows */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
          <span className="text-xs text-white/80">
            {t('wallet.companyFund')}: {formatVnd(companyAllowanceVnd)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
          <span className="text-xs text-white/80">
            {t('wallet.personalFund')}: {formatVnd(personalTopUpVnd)}
          </span>
        </div>
      </div>

      {/* Daily progress */}
      <div className="mt-4">
        <p className="text-xs text-white/60">
          {t('wallet.todaySpent')}: {formatVnd(dailySpentVnd)}/{formatVnd(dailyLimitVnd)}
        </p>
        <div className="mt-1.5 h-1 w-full rounded-full bg-white/20">
          <div
            className="h-1 rounded-full bg-white transition-all"
            style={{ width: `${spentRatio * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
