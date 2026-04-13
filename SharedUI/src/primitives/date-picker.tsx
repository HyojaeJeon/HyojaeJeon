'use client';

/**
 * DatePicker — 공용 날짜 선택기 primitive.
 * - 커스텀 달력 드롭다운 (브라우저 기본 <input type="date"> 미사용)
 * - 연/월 커스텀 드롭다운 (브라우저 <select> 미사용)
 * - locale 기반 월/요일 라벨 + Today/Clear 버튼 i18n
 * - @floating-ui/react-dom 으로 포지셔닝 (모달 내부에서도 정확히 동작)
 */
import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react-dom';
import { sharedUiTokens as T } from '../foundation/tokens';

export interface DatePickerProps {
  /** ISO yyyy-mm-dd or null */
  value: string | null;
  onChange: (value: string | null) => void;
  locale?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  invalid?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  minWidth?: number | string;
}

/* ─── locale labels ─── */
const L: Record<string, { today: string; clear: string }> = {
  ko: { today: '오늘', clear: '초기화' },
  vi: { today: 'Hôm nay', clear: 'Xóa' },
  en: { today: 'Today', clear: 'Clear' },
};
function getLabels(locale: string) {
  const lang = locale.split('-')[0].toLowerCase();
  return L[lang] ?? L.en;
}

/* ─── icons ─── */
function Chevron({ dir }: { dir: 'left' | 'right' }) {
  const d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/* ─── small dropdown (year / month) ─── */
function MiniDropdown({ value, options, onChange, width }: {
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string | number) => void;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
      if (active) active.scrollIntoView({ block: 'center' });
    }
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          height: 28,
          paddingInline: 8,
          borderRadius: T.radius.xs,
          border: `1px solid ${T.colors.border}`,
          background: T.colors.surface,
          color: T.colors.text,
          fontFamily: T.typography.fontFamily,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: width ?? 60,
        }}
      >
        {current?.label ?? value}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 32,
            left: 0,
            zIndex: 10,
            background: T.colors.surface,
            border: `1px solid ${T.colors.border}`,
            borderRadius: T.radius.sm,
            boxShadow: T.shadow.md,
            maxHeight: 180,
            overflowY: 'auto',
            minWidth: width ?? 60,
          }}
        >
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              data-active={o.value === value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '5px 10px',
                fontSize: 12,
                fontFamily: T.typography.fontFamily,
                fontWeight: o.value === value ? 700 : 400,
                color: o.value === value ? T.colors.brand : T.colors.text,
                background: o.value === value ? T.colors.brandSoft : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PANEL_W = 288;

/* ─── main DatePicker ─── */
export function DatePicker({
  value,
  onChange,
  locale = 'ko-KR',
  placeholder = 'yyyy-mm-dd',
  minDate,
  maxDate,
  invalid,
  disabled,
  style,
  minWidth = 180,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // @floating-ui — trigger 대비 패널 자동 포지셔닝
  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
  });

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(parsed?.getMonth() ?? today.getMonth());

  const labels = getLabels(locale);

  const handleToggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  // outside click / ESC
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const triggerEl = refs.reference.current as HTMLElement | null;
      if (!triggerEl?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, refs.reference]);

  // value 변경 시 뷰 동기화
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  /* ─── trigger ─── */
  const trigger: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: '100%',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  /* ─── date formatters ─── */
  const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const monthFmt = new Intl.DateTimeFormat(locale, { month: 'long' });
  const displayFmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });

  const weekdays: string[] = [];
  for (let i = 0; i < 7; i++) weekdays.push(weekdayFmt.format(new Date(2024, 0, i)));

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();
  const cells: Array<{ date: number; year: number; month: number } | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: d, year: viewYear, month: viewMonth });
  while (cells.length % 7 !== 0) cells.push(null);

  const months: { value: number; label: string }[] = [];
  for (let m = 0; m < 12; m++) months.push({ value: m, label: monthFmt.format(new Date(2024, m, 1)) });
  const years: { value: number; label: string }[] = [];
  for (let y = today.getFullYear() - 20; y <= today.getFullYear() + 10; y++) years.push({ value: y, label: String(y) });

  const isSelectedDay = (y: number, m: number, d: number) =>
    parsed && parsed.getFullYear() === y && parsed.getMonth() === m && parsed.getDate() === d;
  const isTodayDay = (y: number, m: number, d: number) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  const selectDate = (y: number, m: number, d: number) => {
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (minDate && iso < minDate) return;
    if (maxDate && iso > maxDate) return;
    onChange(iso);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  /* ─── shared button styles ─── */
  const navBtn: CSSProperties = {
    width: 28, height: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: T.radius.xs,
    border: `1px solid ${T.colors.border}`,
    background: T.colors.surface,
    color: T.colors.textMuted,
    cursor: 'pointer',
  };
  const actionBtn: CSSProperties = {
    padding: '4px 10px',
    borderRadius: T.radius.xs,
    border: `1px solid ${T.colors.border}`,
    background: T.colors.surface,
    color: T.colors.text,
    fontFamily: T.typography.fontFamily,
    fontSize: 11, fontWeight: 500,
    cursor: 'pointer',
  };

  return (
    <div
      ref={refs.setReference}
      style={{ position: 'relative', display: 'inline-flex', width: typeof minWidth === 'number' ? `${minWidth}px` : minWidth }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={trigger}
      >
        <span style={{ flex: 1, textAlign: 'left', color: parsed ? T.colors.text : T.colors.textSubtle }}>
          {parsed ? displayFmt.format(parsed) : placeholder}
        </span>
        <span style={{ color: T.colors.textSubtle, display: 'flex', alignItems: 'center' }}>
          <CalendarIcon />
        </span>
      </button>

      {open && !disabled && typeof document !== 'undefined' && createPortal(
        <div
          ref={(node) => { panelRef.current = node; refs.setFloating(node); }}
          role="dialog"
          style={{
            ...floatingStyles,
            zIndex: 9999,
            background: T.colors.surface,
            borderRadius: T.radius.md,
            boxShadow: T.shadow.lg,
            border: `1px solid ${T.colors.border}`,
            padding: 14,
            width: PANEL_W,
          }}
        >
          {/* header — nav + year/month dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <button type="button" onClick={prevMonth} style={navBtn}><Chevron dir="left" /></button>
            <div style={{ flex: 1, display: 'flex', gap: 4, justifyContent: 'center' }}>
              <MiniDropdown value={viewYear} options={years} onChange={(v) => setViewYear(v as number)} width={72} />
              <MiniDropdown value={viewMonth} options={months} onChange={(v) => setViewMonth(v as number)} width={80} />
            </div>
            <button type="button" onClick={nextMonth} style={navBtn}><Chevron dir="right" /></button>
          </div>

          {/* weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {weekdays.map((w, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: T.colors.textSubtle, textTransform: 'uppercase', padding: '4px 0' }}>
                {w}
              </div>
            ))}
          </div>

          {/* day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((c, i) => {
              if (!c) return <div key={i} />;
              const selected = isSelectedDay(c.year, c.month, c.date);
              const isToday = isTodayDay(c.year, c.month, c.date);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDate(c.year, c.month, c.date)}
                  style={{
                    height: 32,
                    borderRadius: T.radius.xs,
                    border: selected ? `1.5px solid ${T.colors.brand}` : isToday ? `1px solid ${T.colors.border}` : '1px solid transparent',
                    background: selected ? T.colors.brandSoft : 'transparent',
                    color: selected ? T.colors.brand : T.colors.text,
                    fontFamily: T.typography.fontMono,
                    fontSize: 12,
                    fontWeight: selected ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {c.date}
                </button>
              );
            })}
          </div>

          {/* footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <button
              type="button"
              onClick={() => { const t = new Date(); selectDate(t.getFullYear(), t.getMonth(), t.getDate()); }}
              style={actionBtn}
            >
              {labels.today}
            </button>
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              style={{ ...actionBtn, border: 'none', color: T.colors.textMuted }}
            >
              {labels.clear}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
