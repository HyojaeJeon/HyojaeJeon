'use client';

import { Download, Share2 } from 'lucide-react';
import { AppHeader } from '../../shared/AppHeader';
import { MOCK_TRANSACTIONS } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { ReceiptCard } from './ReceiptCard';

export default function TransactionDetailScreen() {
  const { t } = useVmealT();
  const transaction = MOCK_TRANSACTIONS[0]; // Phở 24 payment

  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-full">
      <AppHeader title={t('transaction.detail.title')} onBack={() => {}} />

      <div className="flex-1 px-5 pt-4 pb-6 space-y-5">
        {/* Receipt card */}
        <ReceiptCard
          transaction={transaction}
          merchantAddress="123 Nguyễn Huệ, Q.1, TP.HCM"
        />

        {/* Action buttons */}
        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 h-[44px] rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700">
            <Download size={16} className="text-gray-500" />
            {t('transaction.detail.saveImage')}
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 h-[44px] rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700">
            <Share2 size={16} className="text-gray-500" />
            {t('common.share')}
          </button>
        </div>

        {/* Report issue */}
        <button className="w-full text-center text-sm text-[#EF4444] font-medium">
          {t('transaction.detail.reportIssue')}
        </button>
      </div>
    </div>
  );
}
