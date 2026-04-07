'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';

// -------------------------------------------------------------------
// SalesViewDialog -- 매출 조회/재인쇄/반품 (sellview.md)
//
// 날짜 범위, 담당자, POS 번호 기준으로 매출 검색.
// 매출 전표 목록/상세/결제 요약 3개 그리드.
// 재판매, 영수증 재인쇄, 반품(매출 취소), 카드 반품, 회원포인트 적립.
// P0 마이그레이션 대상.
// -------------------------------------------------------------------

interface SellSlip {
  id: string;
  date: string;
  tableCode: string;
  totalAmount: number;
  payType: string;
  status: string;
}

interface SellDetail {
  id: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface PaymentSummaryItem {
  method: string;
  amount: number;
  count: number;
}

interface SalesViewDialogProps {
  open: boolean;
  onClose: () => void;
}

// Stub data
const STUB_SLIPS: SellSlip[] = [
  { id: 'SS001', date: '2026-04-05 12:30', tableCode: 'T-01', totalAmount: 35000, payType: '현금', status: '완료' },
  { id: 'SS002', date: '2026-04-05 13:15', tableCode: 'T-03', totalAmount: 52000, payType: '카드', status: '완료' },
  { id: 'SS003', date: '2026-04-05 14:00', tableCode: 'T-05', totalAmount: 18000, payType: '현금', status: '반품' },
];

const STUB_DETAILS: SellDetail[] = [
  { id: 'SD01', itemName: '불고기정식', qty: 2, unitPrice: 12000, amount: 24000 },
  { id: 'SD02', itemName: '된장찌개', qty: 1, unitPrice: 8000, amount: 8000 },
  { id: 'SD03', itemName: '공기밥', qty: 3, unitPrice: 1000, amount: 3000 },
];

const STUB_PAYMENT_SUMMARY: PaymentSummaryItem[] = [
  { method: '현금', amount: 53000, count: 2 },
  { method: '카드', amount: 52000, count: 1 },
];

export default function SalesViewDialog({ open, onClose }: SalesViewDialogProps) {
  const [startDate, setStartDate] = useState<string>('2026-04-05');
  const [endDate, setEndDate] = useState<string>('2026-04-05');
  const [selectedSlipId, setSelectedSlipId] = useState<string>('');
  const [staffFilter, setStaffFilter] = useState<string>('');
  const [posFilter, setPosFilter] = useState<string>('');

  const fmt = (v: number) => v.toLocaleString('ko-KR');

  const handleSearch = useCallback(() => {
    // TODO: SALES:SEARCH bridge command
    console.log('[SalesViewDialog] search:', { startDate, endDate, staffFilter, posFilter });
  }, [startDate, endDate, staffFilter, posFilter]);

  const handleResetSearch = useCallback(() => {
    // TODO: SALES:SEARCH with reset conditions
    setStaffFilter('');
    setPosFilter('');
    console.log('[SalesViewDialog] reset search');
  }, []);

  const handleResell = useCallback(() => {
    if (!selectedSlipId) return;
    // TODO: SALES:REORDER bridge command
    console.log('[SalesViewDialog] resell:', selectedSlipId);
  }, [selectedSlipId]);

  const handleReprintReceipt = useCallback(() => {
    if (!selectedSlipId) return;
    // TODO: SALES:REPRINT bridge command (printType: "receipt")
    console.log('[SalesViewDialog] reprint receipt:', selectedSlipId);
  }, [selectedSlipId]);

  const handleVoid = useCallback(() => {
    if (!selectedSlipId) return;
    // TODO: SALES:VOID bridge command (requires admin/void permission)
    console.log('[SalesViewDialog] void:', selectedSlipId);
  }, [selectedSlipId]);

  const handleCardVoid = useCallback(() => {
    if (!selectedSlipId) return;
    // TODO: PAYMENT:VOID bridge command (synchronous-wait, CardReader + PG)
    // 카드 반품은 Outbox 재전송 대상 아님
    console.log('[SalesViewDialog] card void:', selectedSlipId);
  }, [selectedSlipId]);

  const handleReprintKitchen = useCallback(() => {
    if (!selectedSlipId) return;
    // TODO: SALES:REPRINT bridge command (printType: "kitchen")
    console.log('[SalesViewDialog] reprint kitchen:', selectedSlipId);
  }, [selectedSlipId]);

  const handleReprintCard = useCallback(() => {
    if (!selectedSlipId) return;
    // TODO: SALES:REPRINT bridge command (printType: "card")
    console.log('[SalesViewDialog] reprint card:', selectedSlipId);
  }, [selectedSlipId]);

  const handlePrintSalesList = useCallback(() => {
    // TODO: SALES:EXPORT bridge command
    console.log('[SalesViewDialog] print sales list');
  }, []);

  const handleCustomerPoint = useCallback(() => {
    if (!selectedSlipId) return;
    // TODO: PAYMENT:SAVE_POINT bridge command
    console.log('[SalesViewDialog] customer point:', selectedSlipId);
  }, [selectedSlipId]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="매출 조회"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Search panel */}
        <div className="shrink-0 flex items-center gap-2 h-9 flex-wrap">
          <DatePicker value={startDate} onChange={setStartDate} />
          <span className="text-pos-text-muted">~</span>
          <DatePicker value={endDate} onChange={setEndDate} />
          <Button variant="primary" size="sm" onClick={handleSearch}>검색</Button>
          <Button variant="ghost" size="sm" onClick={handleResetSearch}>초기화</Button>
        </div>

        {/* Sales slips grid (IDC_GRID) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 text-xs text-pos-text-muted mb-2 font-semibold">매출 전표</div>
          <div className="flex-1 flex flex-col border border-pos-border rounded-pos-card overflow-hidden min-h-0">
            <div className="shrink-0 grid grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-1 px-3 py-1 bg-gray-100 text-xs font-semibold text-pos-text-secondary">
              <span>일시</span>
              <span>테이블</span>
              <span className="text-right">금액</span>
              <span>결제</span>
              <span>상태</span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {STUB_SLIPS.map((slip) => (
                <button
                  key={slip.id}
                  type="button"
                  onClick={() => setSelectedSlipId(slip.id)}
                  className={`
                    w-full grid grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-1 px-3 py-2 text-sm
                    border-b border-pos-border cursor-pointer select-none
                    ${selectedSlipId === slip.id ? 'bg-primary-50' : 'bg-pos-bg'}
                  `}
                >
                  <span className="text-pos-text-secondary">{slip.date}</span>
                  <span className="text-pos-text">{slip.tableCode}</span>
                  <span className="text-right font-semibold tabular-nums">{fmt(slip.totalAmount)}</span>
                  <span className="text-pos-text-secondary">{slip.payType}</span>
                  <span className={slip.status === '반품' ? 'text-pos-error' : 'text-primary-500'}>{slip.status}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sales detail grid (IDC_GRID2) */}
        {selectedSlipId && (
          <div className="shrink-0 flex flex-col border border-pos-border rounded-pos-card overflow-hidden" style={{ maxHeight: 120 }}>
            <div className="shrink-0 text-xs text-pos-text-muted px-3 py-1 font-semibold bg-gray-100">매출 상세</div>
            <div className="shrink-0 grid grid-cols-[3fr_1fr_2fr_2fr] gap-1 px-3 py-1 bg-gray-100 text-xs font-semibold text-pos-text-secondary">
              <span>메뉴명</span>
              <span className="text-center">수량</span>
              <span className="text-right">단가</span>
              <span className="text-right">금액</span>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {STUB_DETAILS.map((d) => (
                <div key={d.id} className="grid grid-cols-[3fr_1fr_2fr_2fr] gap-1 px-3 py-2 text-sm border-b border-pos-border">
                  <span className="text-pos-text">{d.itemName}</span>
                  <span className="text-center tabular-nums">{d.qty}</span>
                  <span className="text-right tabular-nums text-pos-text-secondary">{fmt(d.unitPrice)}</span>
                  <span className="text-right tabular-nums font-semibold">{fmt(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment summary grid (IDC_GRID4) */}
        <div className="shrink-0 flex flex-col border border-pos-border rounded-pos-card overflow-hidden">
          <div className="shrink-0 grid grid-cols-[2fr_2fr_1fr] gap-1 px-3 py-1 bg-gray-100 text-xs font-semibold text-pos-text-secondary">
            <span>결제수단</span>
            <span className="text-right">금액</span>
            <span className="text-center">건수</span>
          </div>
          {STUB_PAYMENT_SUMMARY.map((ps) => (
            <div key={ps.method} className="grid grid-cols-[2fr_2fr_1fr] gap-1 px-3 py-2 text-sm border-b border-pos-border">
              <span className="text-pos-text">{ps.method}</span>
              <span className="text-right font-semibold tabular-nums">{fmt(ps.amount)}</span>
              <span className="text-center tabular-nums">{ps.count}</span>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="shrink-0 flex flex-wrap gap-2 h-9">
          <Button variant="secondary" size="sm" onClick={handleResell}>재판매</Button>
          <Button variant="secondary" size="sm" onClick={handleReprintReceipt}>영수증재인쇄</Button>
          <Button variant="danger" size="sm" onClick={handleVoid}>반품</Button>
          <Button variant="secondary" size="sm" onClick={handleReprintKitchen}>주문전표</Button>
          <Button variant="secondary" size="sm" onClick={handleReprintCard}>카드전표</Button>
          <Button variant="ghost" size="sm" onClick={handlePrintSalesList}>목록인쇄</Button>
          <Button variant="ghost" size="sm" onClick={handleCardVoid}>카드반품</Button>
          <Button variant="ghost" size="sm" onClick={handleCustomerPoint}>포인트적립</Button>
        </div>
      </div>
    </FullScreenPanel>
  );
}
