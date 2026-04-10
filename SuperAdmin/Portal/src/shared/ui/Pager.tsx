'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface PagerProps {
  skip: number;
  take: number;
  currentCount: number;
  onChange: (next: { skip: number; take: number }) => void;
  pageSizes?: number[];
}

/**
 * skip/take 기반 페이징. totalCount 가 없는 list query 를 위해
 * "currentCount === take" 면 다음 페이지 존재 가정.
 * CentralApi 가 connection variant 를 반환하면 Pager 를 대체할 예정.
 */
export function Pager({ skip, take, currentCount, onChange, pageSizes = [20, 50, 100] }: PagerProps) {
  const page = Math.floor(skip / take) + 1;
  const hasPrev = skip > 0;
  const hasNext = currentCount === take;

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-2 text-[12px] text-fg-muted">
      <div className="flex items-center gap-2">
        <span>페이지 크기</span>
        <select
          value={take}
          onChange={(e) => onChange({ skip: 0, take: Number(e.target.value) })}
          className="h-7 rounded-md border bg-surface-1 px-2 text-[12px] text-fg"
          style={{ borderColor: 'var(--border)' }}
        >
          {pageSizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => onChange({ skip: Math.max(0, skip - take), take })}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
            hasPrev ? 'hover:bg-surface-2 text-fg' : 'opacity-40',
          )}
          style={{ borderColor: 'var(--border)' }}
          aria-label="Previous"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="num min-w-[52px] text-center font-mono text-[12px] text-fg">
          p. {page}
        </span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onChange({ skip: skip + take, take })}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md border transition-colors',
            hasNext ? 'hover:bg-surface-2 text-fg' : 'opacity-40',
          )}
          style={{ borderColor: 'var(--border)' }}
          aria-label="Next"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
