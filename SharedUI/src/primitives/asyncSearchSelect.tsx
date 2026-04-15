'use client';

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { sharedUiTokens as T } from '../foundation/tokens';

/* ─────────────────────── Types ─────────────────────── */

export interface AsyncSearchSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface AsyncSearchSelectPage {
  items: AsyncSearchSelectOption[];
  hasMore: boolean;
}

export interface AsyncSearchSelectProps {
  /** Selected value (option.value) */
  value: string | null;
  /** Called when user picks an option */
  onChange: (value: string, option: AsyncSearchSelectOption) => void;
  /**
   * Async loader: returns a page of options for the given search query and page offset.
   * `offset` is 0 on initial load, incremented by pageSize on each scroll-to-bottom.
   */
  onSearch: (query: string, offset: number) => Promise<AsyncSearchSelectPage>;
  /** Items per page (default 10) */
  pageSize?: number;
  /** Debounce delay in ms (default 500) */
  debounceMs?: number;
  placeholder?: string;
  /** Label shown when nothing is selected */
  emptyLabel?: string;
  /** Label shown when no results */
  noResultsLabel?: string;
  /** Label shown when loading */
  loadingLabel?: string;
  /** Search input placeholder */
  searchPlaceholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  style?: CSSProperties;
  minWidth?: number | string;
  /** Render custom option content */
  renderOption?: (option: AsyncSearchSelectOption, isSelected: boolean) => ReactNode;
}

/* ─────────────────────── Debounce ─────────────────────── */

function useDebouncedCallback(
  fn: (q: string) => void,
  delay: number,
): (q: string) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (q: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(q), delay);
    },
    [delay],
  );
}

/* ─────────────────────── Component ─────────────────────── */

export function AsyncSearchSelect({
  value,
  onChange,
  onSearch,
  pageSize = 10,
  debounceMs = 500,
  placeholder = '— select —',
  emptyLabel,
  noResultsLabel = 'No results',
  loadingLabel = 'Loading…',
  searchPlaceholder = 'Search…',
  disabled,
  invalid,
  style,
  minWidth = 180,
  renderOption,
}: AsyncSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<AsyncSearchSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<AsyncSearchSelectOption | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const queryRef = useRef('');
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; width: number } | null>(null);

  /* ── position ── */
  const updatePos = useCallback(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const PANEL_H = 360;
    const margin = 4;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const top =
      spaceBelow >= PANEL_H || spaceBelow >= spaceAbove
        ? rect.bottom + margin
        : Math.max(8, rect.top - PANEL_H - margin);
    setPanelPos({ top, left: rect.left, width: Math.max(rect.width, 280) });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open, updatePos]);

  /* ── lock body scroll while open ── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* ── outside click / scroll ── */
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  /* ── initial fetch ── */
  const doSearch = useCallback(
    async (q: string, append = false) => {
      const offset = append ? offsetRef.current : 0;
      if (!append) {
        setLoading(true);
        offsetRef.current = 0;
        queryRef.current = q;
      } else {
        setLoadingMore(true);
      }
      try {
        const page = await onSearch(q, offset);
        if (append) {
          setOptions((prev) => {
            const seen = new Set(prev.map((o) => o.value));
            return [...prev, ...page.items.filter((o) => !seen.has(o.value))];
          });
        } else {
          setOptions(page.items);
        }
        setHasMore(page.hasMore);
        offsetRef.current = offset + page.items.length;
        if (!append) setActiveIdx(0);
      } catch {
        if (!append) setOptions([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [onSearch],
  );

  const debouncedSearch = useDebouncedCallback((q: string) => {
    void doSearch(q);
  }, debounceMs);

  /* ── infinite scroll ── */
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current;
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      const threshold = 40;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
        void doSearch(queryRef.current, true);
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [open, loadingMore, hasMore, doSearch]);

  /* ── open handler ── */
  const handleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    void doSearch('');
    setTimeout(() => searchRef.current?.focus(), 30);
  }, [disabled, doSearch]);

  /* ── search input change ── */
  const handleSearchChange = (val: string) => {
    setQuery(val);
    debouncedSearch(val);
  };

  /* ── keyboard ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const o = options[activeIdx];
      if (o) {
        onChange(o.value, o);
        setSelectedOption(o);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  /* ── display label ── */
  const displayLabel = selectedOption?.label ?? emptyLabel ?? value ?? null;

  /* ── styles ── */
  const trigger: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingInline: 12,
    borderRadius: T.radius.md,
    border: 'none',
    boxShadow: invalid ? `inset 0 0 0 1.5px ${T.colors.danger}` : T.shadow.sm,
    background: T.colors.surface,
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    fontSize: 13,
    minWidth,
    width: '100%',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    justifyContent: 'space-between',
    ...style,
  };

  const panel: CSSProperties = {
    position: 'fixed',
    top: panelPos?.top ?? -9999,
    left: panelPos?.left ?? -9999,
    width: panelPos?.width ?? 'auto',
    zIndex: 9999,
    background: T.colors.surface,
    borderRadius: T.radius.md,
    boxShadow: T.shadow.lg,
    maxHeight: 360,
    display: 'flex',
    flexDirection: 'column',
  };

  const searchBox: CSSProperties = {
    position: 'sticky',
    top: 0,
    padding: 8,
    borderBottom: `1px solid ${T.colors.border}`,
    background: T.colors.surface,
    zIndex: 1,
  };

  const searchInput: CSSProperties = {
    width: '100%',
    height: 32,
    paddingInline: 10,
    borderRadius: T.radius.xs,
    border: 'none',
    boxShadow: T.shadow.sm,
    background: T.colors.surfaceMuted,
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    fontSize: 12.5,
    outline: 'none',
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex', width: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={trigger}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayLabel ? (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayLabel}</span>
          ) : (
            <span style={{ color: T.colors.textSubtle }}>{placeholder}</span>
          )}
        </span>
        <span
          aria-hidden
          style={{
            color: T.colors.textSubtle,
            transition: 'transform 160ms ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: 10,
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </button>

      {open && !disabled && typeof document !== 'undefined' &&
        createPortal(
          <div ref={panelRef} role="listbox" style={panel}>
            {/* ── Sticky search input ── */}
            <div style={searchBox}>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                style={searchInput}
                autoComplete="off"
              />
            </div>

            {/* ── Options list (infinite scroll) ── */}
            <div ref={listRef} style={{ overflowY: 'auto', flex: 1, padding: 4 }}>
              {loading ? (
                <div style={{ padding: 16, color: T.colors.textSubtle, fontSize: 12.5, textAlign: 'center' }}>
                  {loadingLabel}
                </div>
              ) : options.length === 0 ? (
                <div style={{ padding: 16, color: T.colors.textSubtle, fontSize: 12.5, textAlign: 'center' }}>
                  {noResultsLabel}
                </div>
              ) : (
                <>
                  {options.map((o, idx) => {
                    const isActive = idx === activeIdx;
                    const isSelected = o.value === value;
                    const itemStyle: CSSProperties = {
                      padding: '8px 10px',
                      borderRadius: T.radius.sm,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      fontSize: 13,
                      color: T.colors.text,
                      background: isSelected
                        ? T.colors.brandSoft
                        : isActive
                          ? T.colors.surfaceMuted
                          : 'transparent',
                      fontWeight: isSelected ? 600 : 500,
                    };
                    return (
                      <div
                        key={o.value}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => {
                          onChange(o.value, o);
                          setSelectedOption(o);
                          setOpen(false);
                        }}
                        style={itemStyle}
                      >
                        {renderOption ? (
                          renderOption(o, isSelected)
                        ) : (
                          <>
                            <span>{o.label}</span>
                            {o.description && (
                              <span style={{ fontSize: 11, color: T.colors.textSubtle, fontWeight: 400 }}>
                                {o.description}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {loadingMore && (
                    <div style={{ padding: 8, color: T.colors.textSubtle, fontSize: 11.5, textAlign: 'center' }}>
                      {loadingLabel}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
