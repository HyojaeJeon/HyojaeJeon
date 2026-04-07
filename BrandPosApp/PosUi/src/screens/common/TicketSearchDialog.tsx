'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import NumPad from '@shared/ui/molecules/NumPad';

// ─── Types ────────────────────────────────────────────
interface TicketSummary { totalCount: number; totalAmount: number; cardAmount: number; cashAmount: number; }
interface TicketItem { id: string; time: string; tableName: string; totalAmount: number; paymentType: string; status: string; }
interface TicketDetail { id: string; name: string; quantity: number; price: number; }
interface TicketSearchDialogProps { open: boolean; onClose: () => void; }

// ─── Stub data ────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);
const STUB_SUMMARY: TicketSummary = { totalCount: 15, totalAmount: 450000, cardAmount: 320000, cashAmount: 130000 };
const STUB_TICKETS: TicketItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ticket-${i + 1}`,
  time: `${12 + Math.floor(i / 3)}:${String((i * 15) % 60).padStart(2, '0')}`,
  tableName: `T-${String(i + 1).padStart(2, '0')}`,
  totalAmount: (i + 1) * 15000,
  paymentType: i % 2 === 0 ? '카드' : '현금',
  status: i === 2 ? '취소' : '완료',
}));
const STUB_DETAILS: TicketDetail[] = [
  { id: 'td-1', name: '아메리카노', quantity: 2, price: 4500 },
  { id: 'td-2', name: '카페라떼', quantity: 1, price: 5000 },
  { id: 'td-3', name: '치즈케이크', quantity: 1, price: 6000 },
];

// ─── Component ───────────────────────────────────────
export default function TicketSearchDialog({ open, onClose }: TicketSearchDialogProps) {
  const [startDate, setStartDate] = useState(TODAY);
  const [endDate, setEndDate] = useState(TODAY);
  const [phone, setPhone] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [details, setDetails] = useState<TicketDetail[]>([]);
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(() => {
    setTickets(STUB_TICKETS); setSummary(STUB_SUMMARY); setHasSearched(true);
    setSelectedTicketId(null); setDetails([]);
  }, []);

  const handleSelectTicket = useCallback((id: string) => {
    setSelectedTicketId(id); setDetails(STUB_DETAILS);
  }, []);

  const ROW_H = 'h-9'; // 모든 행 요소 통일 높이

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="전표 조회"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      {/* 전체를 flex-col로 채움: 상단 컨트롤(shrink-0) + 하단 그리드(flex-1) */}
      <div className="flex flex-col h-full px-4 py-3 gap-3">

        {/* ═══ 상단 컨트롤 영역 (shrink-0) ═══ */}
        <div className="shrink-0 flex flex-col gap-2">
          {/* Row 1: 영업일 + 담당자 */}
          <div className="flex items-center justify-between text-xs text-pos-text-secondary">
            <span>영업일: {TODAY}</span>
            <span>담당자: 직원1</span>
          </div>

          {/* Row 2: 전화번호 + 검색 버튼 */}
          <div className="flex gap-2 items-center">
            <input
              type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호"
              className={`flex-1 ${ROW_H} bg-white border border-pos-border rounded-lg px-3 text-sm text-pos-text placeholder:text-pos-text-muted outline-none focus:border-primary-500`}
            />
            <Button variant="secondary" size="sm">회원검색</Button>
            <Button variant="secondary" size="sm" onClick={handleSearch}>전표검색</Button>
          </div>

          {/* Row 3: 금액 + 발행/미승인카드 */}
          <div className="flex gap-2 items-center">
            <div className={`flex-1 ${ROW_H} bg-white border border-pos-border rounded-lg px-3 flex items-center text-sm text-pos-text text-right tabular-nums`}>
              {amountInput ? Number(amountInput).toLocaleString() : '0'}
            </div>
            <Button variant="primary" size="sm" disabled={!selectedTicketId}>발행</Button>
            <Button variant="secondary" size="sm">미승인카드</Button>
          </div>

          {/* Row 4: 날짜범위 + 조회/취소/인쇄 */}
          <div className="flex gap-2 items-center">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className={`${ROW_H} bg-white border border-pos-border rounded-lg px-2 text-sm text-pos-text cursor-pointer outline-none focus:border-primary-500`}
            />
            <span className="text-xs text-pos-text-muted">~</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className={`${ROW_H} bg-white border border-pos-border rounded-lg px-2 text-sm text-pos-text cursor-pointer outline-none focus:border-primary-500`}
            />
            <Button variant="primary" size="sm" onClick={handleSearch}>조회</Button>
            <Button variant="danger" size="sm" disabled={!selectedTicketId}>취소</Button>
            <Button variant="secondary" size="sm">인쇄</Button>
          </div>
        </div>

        {/* ═══ 하단 메인 영역 (flex-1 — 남은 공간 전체 차지) ═══ */}
        <div className="flex-1 flex gap-3 min-h-0">

          {/* 좌: NumPad — 고정 너비, 높이는 부모에 맞춤 */}
          <div className="w-44 shrink-0 flex flex-col justify-start">
            <NumPad
              onInput={(key) => setAmountInput((p) => p + key)}
              onConfirm={handleSearch}
              onClear={() => setAmountInput('')}
              onBackspace={() => setAmountInput((p) => p.slice(0, -1))}
            />
          </div>

          {/* 우: 요약 + 전표목록/상세 (flex-1) */}
          <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-0">

            {/* 요약 바 (shrink-0) */}
            {summary && (
              <div className="shrink-0 grid grid-cols-4 gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-pos-text-secondary">
                <div><span className="block text-pos-text-muted text-[10px]">건수</span><span className="font-semibold text-pos-text tabular-nums">{summary.totalCount}</span></div>
                <div><span className="block text-pos-text-muted text-[10px]">총액</span><span className="font-semibold text-pos-text tabular-nums">{summary.totalAmount.toLocaleString()}</span></div>
                <div><span className="block text-pos-text-muted text-[10px]">카드</span><span className="font-semibold text-pos-text tabular-nums">{summary.cardAmount.toLocaleString()}</span></div>
                <div><span className="block text-pos-text-muted text-[10px]">현금</span><span className="font-semibold text-pos-text tabular-nums">{summary.cashAmount.toLocaleString()}</span></div>
              </div>
            )}

            {/* 전표목록 + 전표상세 (flex-1 — 남은 공간 전체) */}
            <div className="flex-1 flex gap-2 min-h-0">
              {/* 전표 목록 */}
              <div className="flex-1 flex flex-col border border-pos-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[60px_1fr_80px_50px_40px] gap-1 px-2 py-1.5 bg-gray-50 border-b border-pos-border text-[11px] font-semibold text-pos-text-muted shrink-0">
                  <span>시간</span><span>테이블</span><span className="text-right">금액</span><span>결제</span><span>상태</span>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  {!hasSearched ? (
                    <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">조회를 눌러주세요</div>
                  ) : tickets.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">결과 없음</div>
                  ) : (
                    tickets.map((t) => (
                      <button key={t.id} type="button" onClick={() => handleSelectTicket(t.id)}
                        className={`w-full grid grid-cols-[60px_1fr_80px_50px_40px] gap-1 px-2 py-2 text-xs cursor-pointer text-left transition-colors ${
                          selectedTicketId === t.id ? 'bg-primary-100 text-primary-700' : 'text-pos-text active:bg-gray-50'
                        }`}
                      >
                        <span className="tabular-nums">{t.time}</span>
                        <span className="truncate">{t.tableName}</span>
                        <span className="text-right tabular-nums">{t.totalAmount.toLocaleString()}</span>
                        <span>{t.paymentType}</span>
                        <span className={t.status === '취소' ? 'text-pos-error' : ''}>{t.status}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* 전표 상세 */}
              <div className="flex-1 flex flex-col border border-pos-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_50px_80px] gap-1 px-2 py-1.5 bg-gray-50 border-b border-pos-border text-[11px] font-semibold text-pos-text-muted shrink-0">
                  <span>항목</span><span className="text-right">수량</span><span className="text-right">가격</span>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  {!selectedTicketId ? (
                    <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">전표를 선택하세요</div>
                  ) : (
                    details.map((d) => (
                      <div key={d.id} className="grid grid-cols-[1fr_50px_80px] gap-1 px-2 py-2 text-xs text-pos-text">
                        <span className="truncate">{d.name}</span>
                        <span className="text-right tabular-nums">{d.quantity}</span>
                        <span className="text-right tabular-nums">{(d.price * d.quantity).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
