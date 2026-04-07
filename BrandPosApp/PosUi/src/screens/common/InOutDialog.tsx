'use client';

import { useState, useCallback, useMemo } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';

// ─── Types ────────────────────────────────────────────
type CashType = 'in' | 'out';

interface CashRecord {
  id: string;
  date: string;
  type: CashType;
  amount: number;
  reason: string;
  staffName: string;
}

interface InOutDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_RECORDS: CashRecord[] = Array.from({ length: 10 }, (_, i) => ({
  id: `cash-${i + 1}`,
  date: `2026-04-0${(i % 5) + 1}`,
  type: i % 3 === 0 ? 'out' : 'in',
  amount: (i + 1) * 10000,
  reason: i % 3 === 0 ? '거스름돈 교환' : `매출 입금 ${i + 1}`,
  staffName: `직원 ${(i % 3) + 1}`,
}));

// ─── Component ────────────────────────────────────────
export default function InOutDialog({
  open,
  onClose,
}: InOutDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  // State
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [records] = useState<CashRecord[]>(STUB_RECORDS);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // System info (stub)
  const businessDate = today;
  const staffName = '관리자';
  const analysisBasis = '영업일 기준';

  // Computed totals
  const inTotal = useMemo(
    () => records.filter((r) => r.type === 'in').reduce((s, r) => s + r.amount, 0),
    [records],
  );
  const outTotal = useMemo(
    () => records.filter((r) => r.type === 'out').reduce((s, r) => s + r.amount, 0),
    [records],
  );
  const allTotal = inTotal - outTotal;

  // ─── Handlers ─────────────────────────────────────
  const handleSearch = useCallback(() => {
    // TODO: ACCOUNTING:GET_HISTORY bridge call with { startDate, endDate }
  }, [startDate, endDate]);

  const handleRegister = useCallback(() => {
    // TODO: Open cash in/out registration sub-dialog
    // ACCOUNTING:CASH_IN or ACCOUNTING:CASH_OUT bridge call with idempotencyKey
  }, []);

  const handlePrint = useCallback(() => {
    // TODO: SYSTEM:GET_CONTENT bridge call for printing via Device/Printer
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedRecordId) return;
    // TODO: ACCOUNTING:CASH_OUT bridge call for logical deletion (soft delete)
  }, [selectedRecordId]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="입출금 관리"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* ─── Header info ─── */}
        <div className="shrink-0 flex items-center gap-4 text-xs">
          <span className="text-pos-text-muted">
            영업일: <span className="font-semibold text-pos-text">{businessDate}</span>
          </span>
          <span className="text-pos-text-muted">
            담당자: <span className="font-semibold text-pos-text">{staffName}</span>
          </span>
        </div>

        {/* ─── Filter bar ─── */}
        <div className="shrink-0 flex items-center gap-3 flex-wrap text-xs">
          <span className="text-pos-text-muted">{analysisBasis}</span>
          <DatePicker value={startDate} onChange={setStartDate} />
          <span className="text-pos-text-muted">~</span>
          <DatePicker value={endDate} onChange={setEndDate} />
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="primary" size="sm" onClick={handleSearch}>조회</Button>
            <Button variant="secondary" size="sm" onClick={handlePrint}>인쇄</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={!selectedRecordId}>삭제</Button>
            <Button variant="secondary" size="sm" onClick={handleRegister}>입출금</Button>
          </div>
        </div>

        {/* ─── Record grid ─── */}
        <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
          <div className="grid grid-cols-[80px_50px_100px_1fr_80px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            <span>날짜</span>
            <span>구분</span>
            <span className="text-right">금액</span>
            <span>적요</span>
            <span>담당자</span>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {records.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                입출금 내역이 없습니다
              </div>
            ) : (
              records.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`w-full grid grid-cols-[80px_50px_100px_1fr_80px] gap-2 px-3 py-2.5 text-xs text-left cursor-pointer transition-colors ${
                    selectedRecordId === rec.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  <span className="tabular-nums">{rec.date}</span>
                  <span className={rec.type === 'in' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {rec.type === 'in' ? '입금' : '출금'}
                  </span>
                  <span className="text-right tabular-nums">{rec.amount.toLocaleString()}</span>
                  <span className="truncate">{rec.reason}</span>
                  <span className="truncate">{rec.staffName}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ─── Summary footer ─── */}
        <div className="shrink-0 flex items-center gap-6 text-xs">
          <span className="text-pos-text-muted">
            입금합계: <span className="font-bold text-green-600 tabular-nums">{inTotal.toLocaleString()}</span>
          </span>
          <span className="text-pos-text-muted">
            출금합계: <span className="font-bold text-red-600 tabular-nums">{outTotal.toLocaleString()}</span>
          </span>
          <span className="text-pos-text-muted">
            전체합계: <span className="font-bold text-pos-text tabular-nums">{allTotal.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </FullScreenPanel>
  );
}
