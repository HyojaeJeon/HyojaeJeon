'use client';

import { type CSSProperties } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
import type { PaginationProps } from '../types';

export type { PaginationProps };

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  if (total > 1) pages.push(total);
  return pages;
}

export function Pagination({
  skip,
  take,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: PaginationProps) {
  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.max(1, Math.ceil(total / take));
  const rangeStart = total === 0 ? 0 : skip + 1;
  const rangeEnd = Math.min(skip + take, total);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const root: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: T.spacing.md,
    fontFamily: T.typography.fontFamily,
    fontSize: 13,
    color: T.colors.text,
  };

  const btnBase: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
    padding: `0 ${T.spacing.sm}`,
    borderRadius: T.radius.xs,
    border: 'none',
    background: 'transparent',
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    fontSize: 13,
    fontWeight: T.typography.bodyWeight,
    cursor: 'pointer',
    transition: 'background 120ms ease, color 120ms ease',
  };

  const disabledBtn: CSSProperties = {
    ...btnBase,
    color: T.colors.textSubtle,
    cursor: 'not-allowed',
    opacity: 0.5,
  };

  const activeBtn: CSSProperties = {
    ...btnBase,
    background: T.colors.brand,
    color: T.colors.brandFg,
    fontWeight: T.typography.emphasisWeight,
  };

  const hoverStyle = (base: CSSProperties): CSSProperties => ({
    ...base,
  });

  const selectStyle: CSSProperties = {
    height: 32,
    paddingInline: T.spacing.sm,
    borderRadius: T.radius.xs,
    border: 'none',
    boxShadow: T.shadow.sm,
    background: T.colors.surface,
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    fontSize: 13,
    cursor: 'pointer',
  };

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div style={root}>
      <span style={{ color: T.colors.textMuted, fontSize: 12.5, whiteSpace: 'nowrap' }}>
        {rangeStart}–{rangeEnd} of {total}
      </span>

      {pageSizeOptions && onPageSizeChange && (
        <select
          value={take}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={selectStyle}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onPageChange(skip - take)}
          style={isFirst ? disabledBtn : btnBase}
          aria-label="Previous page"
          onMouseEnter={(e) => {
            if (!isFirst) e.currentTarget.style.background = T.colors.surfaceMuted;
          }}
          onMouseLeave={(e) => {
            if (!isFirst) e.currentTarget.style.background = 'transparent';
          }}
        >
          ‹
        </button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ ...btnBase, cursor: 'default', color: T.colors.textSubtle }}
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange((p - 1) * take)}
              style={p === currentPage ? activeBtn : hoverStyle(btnBase)}
              onMouseEnter={(e) => {
                if (p !== currentPage) e.currentTarget.style.background = T.colors.surfaceMuted;
              }}
              onMouseLeave={(e) => {
                if (p !== currentPage) e.currentTarget.style.background = 'transparent';
              }}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={isLast}
          onClick={() => onPageChange(skip + take)}
          style={isLast ? disabledBtn : btnBase}
          aria-label="Next page"
          onMouseEnter={(e) => {
            if (!isLast) e.currentTarget.style.background = T.colors.surfaceMuted;
          }}
          onMouseLeave={(e) => {
            if (!isLast) e.currentTarget.style.background = 'transparent';
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
