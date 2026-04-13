'use client';

import { Check } from 'lucide-react';

interface FilterChip {
  label: string;
  active: boolean;
}

interface SourceFilterProps {
  filters: FilterChip[];
}

export function SourceFilter({ filters }: SourceFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {filters.map((f) => (
        <button
          key={f.label}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
            f.active
              ? 'bg-[#3B82F6] text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {f.active && <Check size={14} />}
          {f.label}
        </button>
      ))}
    </div>
  );
}
