'use client';

import { CheckCircle } from 'lucide-react';
import { formatVnd, formatDateTime } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMealTransaction } from '../../types';

interface ReceiptCardProps {
  transaction: MockMealTransaction;
  merchantAddress: string;
}

function DetailRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${valueClassName ?? 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

export function ReceiptCard({ transaction, merchantAddress }: ReceiptCardProps) {
  const { t } = useVmealT();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top — Success section */}
      <div className="flex flex-col items-center px-5 pt-6 pb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
          <CheckCircle size={28} className="text-[#10B981]" />
        </div>
        <p className="mt-3 text-lg font-semibold text-gray-900">{t('transaction.detail.success')}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{formatVnd(transaction.amountVnd)}</p>
        <p className="mt-1 text-xs text-gray-400">{formatDateTime(transaction.createdAt)}</p>
      </div>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-gray-200 mx-5" />

      {/* Detail rows */}
      <div className="px-5 py-3">
        <DetailRow label={t('transaction.detail.restaurant')} value={transaction.branchName || transaction.merchantName} />
        <DetailRow label={t('transaction.detail.address')} value={merchantAddress} />
        <DetailRow label={t('transaction.detail.type')} value={t('transaction.payment')} />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-400">{t('transaction.detail.status')}</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#10B981]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            {t('transaction.detail.approved')}
          </span>
        </div>
      </div>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-gray-200 mx-5" />

      {/* Payment breakdown */}
      <div className="px-5 py-3">
        <DetailRow label={t('common.total')} value={formatVnd(transaction.amountVnd)} valueClassName="text-gray-900 font-bold" />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-400">{t('transaction.company')}</span>
          <span className="text-sm font-medium text-[#3B82F6]">
            {formatVnd(transaction.companyShareVnd)}{' '}
            <span className="text-gray-400 font-normal">
              ({Math.round((transaction.companyShareVnd / transaction.amountVnd) * 100)}%)
            </span>
          </span>
        </div>
        <DetailRow label={t('transaction.personal')} value={formatVnd(transaction.employeeShareVnd)} />
      </div>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-gray-200 mx-5" />

      {/* Reference info */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-gray-400">{t('transaction.detail.policy')}</span>
          <span className="text-xs text-gray-500">{transaction.policyName ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-gray-400">{t('transaction.detail.transactionId')}</span>
          <span className="text-xs text-gray-500">{transaction.id}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-gray-400">{t('transaction.detail.orderId')}</span>
          <span className="text-xs text-gray-500">{transaction.orderId ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}
