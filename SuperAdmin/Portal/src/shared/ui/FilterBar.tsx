'use client';

import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  right?: ReactNode;
}

export function FilterBar({ children, right }: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface-1 p-2.5"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
