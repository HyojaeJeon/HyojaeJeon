'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════
   Public Interfaces
   ═══════════════════════════════════════ */

export interface DatePickerProps {
  /** 선택된 날짜 (YYYY-MM-DD) */
  value: string;
  /** 날짜 변경 콜백 */
  onChange: (value: string) => void;
  /** 라벨 (optional) */
  label?: string;
  /** 비활성 여부 */
  disabled?: boolean;
}

export interface DateRangePickerProps {
  /** 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** 종료일 (YYYY-MM-DD) */
  endDate: string;
  /** 시작일 변경 */
  onStartChange: (value: string) => void;
  /** 종료일 변경 */
  onEndChange: (value: string) => void;
  /** 조회 버튼 콜백 (optional) */
  onSearch?: () => void;
  /** 조회 버튼 텍스트 */
  searchLabel?: string;
  /** 비활성 여부 */
  disabled?: boolean;
}

/* ═══════════════════════════════════════
   Helpers
   ═══════════════════════════════════════ */

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function parseDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  return { year: y || 2026, month: (m || 1) - 1, day: d || 1 };
}

function formatDisplay(value: string): string {
  if (!value) return '';
  const { year, month, day } = parseDate(value);
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/* ═══════════════════════════════════════
   Calendar Grid (internal)
   ═══════════════════════════════════════ */

function CalendarGrid({
  value,
  onChange,
}: {
  value: string;
  onChange: (dateStr: string) => void;
}) {
  const parsed = useMemo(() => parseDate(value), [value]);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="w-[240px] select-none">
      {/* 년/월 네비게이션 */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded text-pos-text-secondary active:bg-gray-200 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-pos-text tabular-nums">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded text-pos-text-secondary active:bg-gray-200 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((d) => (
          <div key={d} className="h-7 flex items-center justify-center text-[11px] font-medium text-pos-text-muted">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day == null) return <div key={`e-${idx}`} className="h-8" />;
          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const isSelected = dateStr === value;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange(dateStr)}
              className={`
                h-8 w-8 mx-auto flex items-center justify-center
                rounded-full text-sm tabular-nums cursor-pointer
                transition-all duration-100
                ${isSelected
                  ? 'bg-primary-500 text-white font-bold'
                  : 'text-pos-text hover:bg-gray-100 active:bg-gray-200'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   DatePicker (단일 날짜)
   ═══════════════════════════════════════ */

/**
 * DatePicker — 단일 날짜 선택기
 *
 * 클릭하면 플로팅 캘린더가 아래에 나타난다.
 * 날짜를 선택하면 캘린더가 닫힌다.
 */
export default function DatePicker({ value, onChange, label, disabled = false }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSelect = (dateStr: string) => {
    onChange(dateStr);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {label && <div className="text-xs text-pos-text-muted mb-1">{label}</div>}

      {/* 날짜 표시 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`
          h-9 px-3 flex items-center gap-2 rounded-lg border text-sm tabular-nums
          transition-colors duration-100 cursor-pointer
          ${disabled
            ? 'bg-gray-50 text-pos-text-muted border-pos-border cursor-not-allowed'
            : open
              ? 'border-primary-500 bg-white text-pos-text'
              : 'border-pos-border bg-white text-pos-text hover:border-gray-400'}
        `}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-pos-text-muted shrink-0">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>{formatDisplay(value) || 'YYYY-MM-DD'}</span>
      </button>

      {/* 플로팅 캘린더 */}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-pos-border rounded-xl shadow-lg p-4">
          <CalendarGrid value={value} onChange={handleSelect} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   DateRangePicker (날짜 범위)
   ═══════════════════════════════════════ */

/**
 * DateRangePicker — 날짜 범위 선택기
 *
 * 시작일 / 종료일 두 캘린더를 나란히 표시.
 * 선택기를 클릭하면 플로팅으로 열리고, "조회" 버튼으로 검색 실행.
 */
export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onSearch,
  searchLabel = '조회',
  disabled = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSearch = () => {
    setOpen(false);
    onSearch?.();
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* 날짜 범위 표시 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`
          h-9 px-3 flex items-center gap-2 rounded-lg border text-sm tabular-nums
          transition-colors duration-100 cursor-pointer
          ${disabled
            ? 'bg-gray-50 text-pos-text-muted border-pos-border cursor-not-allowed'
            : open
              ? 'border-primary-500 bg-white text-pos-text'
              : 'border-pos-border bg-white text-pos-text hover:border-gray-400'}
        `}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-pos-text-muted shrink-0">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>{formatDisplay(startDate)}</span>
        <span className="text-pos-text-muted">~</span>
        <span>{formatDisplay(endDate)}</span>
      </button>

      {/* 플로팅 범위 캘린더 */}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-pos-border rounded-xl shadow-lg p-4">
          <div className="flex items-start gap-4">
            {/* 시작일 캘린더 */}
            <CalendarGrid value={startDate} onChange={onStartChange} />

            {/* 구분선 */}
            <div className="flex items-center self-stretch">
              <span className="text-pos-text-muted text-lg">~</span>
            </div>

            {/* 종료일 캘린더 */}
            <CalendarGrid value={endDate} onChange={onEndChange} />

            {/* 조회 버튼 */}
            {onSearch && (
              <button
                type="button"
                onClick={handleSearch}
                className="self-stretch w-12 bg-primary-500 text-white rounded-lg text-sm font-bold active:bg-primary-700 cursor-pointer flex items-center justify-center"
              >
                <span className="writing-mode-vertical">{searchLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
