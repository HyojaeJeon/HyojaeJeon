'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';
import { TABLE_STATUS } from '@screens/constants';

interface TableData {
  id: string | number;
  label: string;
  status: string;
  orderSummary?: string;
  totalAmount?: number;
  guests?: number;
  elapsedTimeMin?: number;
  [key: string]: unknown;
}

interface TableCardProps {
  table: TableData;
  onClick: (id: string | number) => void;
}

export default function TableCard({ table, onClick }: TableCardProps) {
  const { t } = usePosI18n();
  const { id, label, status, orderSummary = '', totalAmount = 0, guests = 0, elapsedTimeMin = 0 } = table;
  const isEmpty = status === TABLE_STATUS.EMPTY;
  const isPaying = status === TABLE_STATUS.PAYING;

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`
        relative w-full h-full rounded-pos-2xl transition-transform duration-normal
        flex flex-col overflow-hidden cursor-pointer select-none
        active:scale-[0.97]
        ${isEmpty
          ? 'bg-pos-surface border-pos-thick border-dashed border-pos-border'
          : isPaying
            ? 'bg-pos-bg border-pos-thick border-warn-300 shadow-pos-card'
            : 'bg-pos-bg border-pos-thin border-pos-border shadow-pos-card'}
      `}
    >
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2.5">
          <div className="w-11 h-11 rounded-pos-full bg-pos-surface flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-pos-text-muted">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-md font-medium text-pos-text-muted">{t('common.emptyTable')}</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-pos-text leading-tight">{label}</span>
              <span className="text-2xs text-pos-text-muted mt-0.5 tabular-nums">{guests}명 · {elapsedTimeMin}분</span>
            </div>
            {isPaying && (
              <span className="text-2xs font-semibold px-2.5 py-1 rounded-pos-full bg-warn-100 text-warn-700 leading-none">
                {t('table.paying')}
              </span>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-xs text-pos-text-muted truncate mb-1.5">{orderSummary}</p>
            <p className="text-lg font-bold text-pos-text tabular-nums">{totalAmount.toLocaleString()}₫</p>
          </div>
        </div>
      )}
    </button>
  );
}
