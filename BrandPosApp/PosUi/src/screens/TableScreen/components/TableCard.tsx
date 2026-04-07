import { TABLE_STATUS } from '@screens/constants';

/**
 * TableCard -- TableScreen 전용 테이블 카드
 *
 * shared/ui/organisms/TableCard와 유사하나 isSelected 등 TableScreen 전용 상태를 포함.
 */

interface TableData {
  id: number;
  label: string;
  status: string;
  totalAmount?: number;
  personCount?: number;
  message?: string;
  [key: string]: unknown;
}

interface TableCardProps {
  table: TableData;
  isSelected?: boolean;
  onSelect: (id: number) => void;
}

const statusStyles: Record<string, string> = {
  [TABLE_STATUS.EMPTY]:    'bg-pos-bg border-pos-border text-pos-text',
  [TABLE_STATUS.OCCUPIED]: 'bg-warn-300 border-warn-500 text-pos-text',
  [TABLE_STATUS.PAYING]:   'bg-primary-300 border-primary-500 text-pos-text',
  [TABLE_STATUS.DIRTY]:    'bg-gray-300 border-gray-500 text-pos-text',
};

const statusLabels: Record<string, string> = {
  [TABLE_STATUS.EMPTY]:    '',
  [TABLE_STATUS.OCCUPIED]: '주문중',
  [TABLE_STATUS.PAYING]:   '결제중',
  [TABLE_STATUS.DIRTY]:    '정리',
};

export default function TableCard({ table, isSelected = false, onSelect }: TableCardProps) {
  const style = statusStyles[table.status] || statusStyles[TABLE_STATUS.EMPTY];

  return (
    <button
      type="button"
      onClick={() => onSelect(table.id)}
      className={`
        flex flex-col items-center justify-center
        rounded-pos-card border-pos-thick
        w-full aspect-square
        transition-shadow duration-normal
        active:shadow-pos-hover active:scale-95
        ${style}
        ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
      `}
    >
      <span className="text-2xl font-bold">{table.label}</span>

      {table.status !== TABLE_STATUS.EMPTY && (
        <>
          <span className="text-xs mt-1 opacity-[var(--opacity-subtle)]">
            {statusLabels[table.status]}
          </span>
          {(table.totalAmount ?? 0) > 0 && (
            <span className="text-md font-semibold mt-1">
              {(table.totalAmount ?? 0).toLocaleString()}원
            </span>
          )}
          {(table.personCount ?? 0) > 0 && (
            <span className="text-xs opacity-[var(--opacity-subtle)] mt-0.5">{table.personCount}명</span>
          )}
          {table.message && (
            <span className="text-2xs text-primary-500 mt-0.5 truncate max-w-[90%]">
              📝 {table.message}
            </span>
          )}
        </>
      )}
    </button>
  );
}
