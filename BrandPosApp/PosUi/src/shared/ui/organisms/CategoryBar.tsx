'use client';

import { useRef, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategoryBarProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryBar({ categories, activeId, onSelect }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="h-category-bar w-full bg-pos-bg border-b border-pos-border flex items-center shrink-0">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className="w-10 h-full flex items-center justify-center text-pos-text-muted active:bg-gray-100 active:text-pos-text transition-colors duration-fast cursor-pointer shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Scrollable categories */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-1.5 overflow-x-auto px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`
                shrink-0 h-9 px-4 rounded-pos-btn text-xs font-semibold
                transition-transform duration-fast cursor-pointer select-none
                active:scale-[0.96]
                ${isActive
                  ? 'bg-primary-500 text-pos-text-inverse shadow-pos-soft'
                  : 'bg-pos-surface text-pos-text-secondary'}
              `}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className="w-10 h-full flex items-center justify-center text-pos-text-muted active:bg-gray-100 active:text-pos-text transition-colors duration-fast cursor-pointer shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
