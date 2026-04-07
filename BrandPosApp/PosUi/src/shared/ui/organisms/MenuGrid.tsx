'use client';

import MenuCard from './MenuCard';

interface MenuData {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  isSoldOut?: boolean;
  [key: string]: unknown;
}

interface MenuGridProps {
  items: MenuData[];
  onAdd: (id: string) => void;
  columns?: number;
  rows?: number;
  page: number;
  totalPages: number;
  onPageUp: () => void;
  onPageDown: () => void;
}

export default function MenuGrid({
  items,
  onAdd,
  columns = 5,
  rows = 4,
  page,
  totalPages,
  onPageUp,
  onPageDown,
}: MenuGridProps) {
  const cellCount = columns * rows;
  const canUp = page > 1;
  const canDown = page < totalPages;

  // Fill grid: real items + empty placeholders
  const cells: (MenuData | null)[] = [];
  for (let i = 0; i < cellCount; i++) {
    cells.push(i < items.length ? items[i] : null);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Grid */}
      <div
        className="flex-1 grid gap-2 p-3 content-start"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {cells.map((item, idx) =>
          item ? (
            <MenuCard key={item.id} menu={item} onAdd={onAdd} />
          ) : (
            <div
              key={`empty-${idx}`}
              className="w-full h-full rounded-pos-lg border-2 border-dashed border-pos-border flex items-center justify-center"
            >
              <span className="text-2xs text-pos-text-muted select-none">-</span>
            </div>
          ),
        )}
      </div>

      {/* Pagination */}
      <div className="h-10 flex items-center justify-center gap-3 border-t border-pos-border shrink-0 bg-pos-bg">
        <button
          type="button"
          onClick={onPageUp}
          disabled={!canUp}
          className={`w-8 h-8 flex items-center justify-center rounded-pos-sm transition-colors duration-fast ${
            canUp
              ? 'text-pos-text-secondary active:bg-gray-100 cursor-pointer'
              : 'text-pos-text-muted cursor-default'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-xs font-semibold text-pos-text tabular-nums select-none">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onPageDown}
          disabled={!canDown}
          className={`w-8 h-8 flex items-center justify-center rounded-pos-sm transition-colors duration-fast ${
            canDown
              ? 'text-pos-text-secondary active:bg-gray-100 cursor-pointer'
              : 'text-pos-text-muted cursor-default'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
