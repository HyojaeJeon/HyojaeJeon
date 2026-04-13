'use client';

import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
import { MOCK_TRANSACTIONS, formatVnd, formatTime } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

/** First-letter circle avatar for merchant */
function MerchantAvatar({ name, type }: { name: string; type: string }) {
  const isTopUp = type === 'TOP_UP';
  const letter = isTopUp ? '+' : name.charAt(0).toUpperCase();
  const bg = isTopUp ? 'bg-emerald-100' : 'bg-blue-100';
  const text = isTopUp ? 'text-emerald-600' : 'text-blue-600';

  return (
    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bg}`}>
      <span className={`text-sm font-bold ${text}`}>{letter}</span>
    </div>
  );
}

export function RecentTransactions() {
  const { t } = useVmealT();
  const transactions = MOCK_TRANSACTIONS.slice(0, 4);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">
          {t('wallet.recentTxn')}
        </h3>
        <button className="flex items-center gap-0.5 text-xs font-medium text-[#3B82F6]">
          {t('common.viewAll')}
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Transaction rows */}
      <div className="mt-3 space-y-1">
        {transactions.map((txn) => {
          const isTopUp = txn.type === 'TOP_UP';
          const displayName = isTopUp ? t('wallet.personalTopUp') : txn.merchantName;
          const amountPrefix = isTopUp ? '+' : '\u2212';
          const amountColor = isTopUp ? 'text-emerald-500' : 'text-gray-900';

          return (
            <div
              key={txn.id}
              className="flex items-center gap-3 rounded-xl px-1 py-2.5"
            >
              <MerchantAvatar name={txn.merchantName} type={txn.type} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400">{formatTime(txn.createdAt)}</p>
              </div>

              {/* Amount + split badge */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className={`text-sm font-semibold ${amountColor}`}>
                  {amountPrefix}{formatVnd(txn.amountVnd)}
                </span>
                {!isTopUp && txn.employeeShareVnd > 0 && (
                  <span className="mt-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                    {t('transaction.personal')}: {formatVnd(txn.employeeShareVnd)}
                  </span>
                )}
                {!isTopUp && txn.employeeShareVnd === 0 && (
                  <span className="mt-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">
                    {t('transaction.companyFull')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
