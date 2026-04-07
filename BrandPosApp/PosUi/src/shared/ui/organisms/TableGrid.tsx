'use client';

import { usePosI18n } from '@i18n/PosI18nProvider';
import TableCard from './TableCard';

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

interface TableGridProps {
  tables: TableData[];
  onSelect: (id: string | number) => void;
  columns?: number;
}

export default function TableGrid({ tables, onSelect, columns = 4 }: TableGridProps) {
  const { t } = usePosI18n();

  if (!tables || tables.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-pos-text-muted">
          <rect x="3" y="6" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 12h26" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 12v14M22 12v14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="text-xs text-pos-text-muted">{t('common.emptyTable')}</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 grid gap-3 p-4 content-start overflow-y-auto"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        scrollbarWidth: 'none',
      }}
    >
      {tables.map((table) => (
        <div key={table.id} className="aspect-pos-card">
          <TableCard table={table} onClick={onSelect} />
        </div>
      ))}
    </div>
  );
}
