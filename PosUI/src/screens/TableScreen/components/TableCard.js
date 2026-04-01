import { TABLE_STATUS } from '@screens/constants';

const statusStyles = {
  [TABLE_STATUS.EMPTY]:
    'bg-white border-gray-200 text-pos-text',
  [TABLE_STATUS.OCCUPIED]:
    'bg-warm-yellow-300 border-warm-yellow-500 text-pos-text',
  [TABLE_STATUS.PAYING]:
    'bg-soft-red-300 border-soft-red-500 text-pos-text',
  [TABLE_STATUS.DIRTY]:
    'bg-muted-gray-500 border-muted-gray-700 text-pos-text',
};

const statusLabels = {
  [TABLE_STATUS.EMPTY]: '',
  [TABLE_STATUS.OCCUPIED]: '주문중',
  [TABLE_STATUS.PAYING]: '결제중',
  [TABLE_STATUS.DIRTY]: '정리',
};

export default function TableCard({ table, onSelect }) {
  const style = statusStyles[table.status] || statusStyles[TABLE_STATUS.EMPTY];

  return (
    <button
      type="button"
      onClick={() => onSelect(table.id)}
      className={`
        flex flex-col items-center justify-center
        rounded-[var(--radius-pos-card)] border-2
        w-full aspect-square
        transition-shadow hover:shadow-[var(--shadow-pos-hover)]
        active:scale-95
        ${style}
      `}
    >
      <span className="text-2xl font-bold">{table.label}</span>

      {table.status !== TABLE_STATUS.EMPTY && (
        <>
          <span className="text-xs mt-1 opacity-70">
            {statusLabels[table.status]}
          </span>
          {table.totalAmount > 0 && (
            <span className="text-sm font-semibold mt-1">
              {table.totalAmount.toLocaleString()}원
            </span>
          )}
          {table.guests > 0 && (
            <span className="text-xs opacity-60 mt-0.5">{table.guests}명</span>
          )}
        </>
      )}
    </button>
  );
}
