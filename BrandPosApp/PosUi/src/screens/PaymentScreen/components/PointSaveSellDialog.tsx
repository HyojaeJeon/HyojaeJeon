'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';

// -------------------------------------------------------------------
// PointSaveSellDialog -- 포인트 적립 매출 조회 (pointsavesell.md)
//
// 고객별 포인트 적립/사용 내역을 날짜 범위로 조회.
// 4개 그리드: 적립내역, 요약, 상세, 분류
// 포인트 내역 인쇄, 엑셀 내보내기, 회원 포인트 수동 저장.
// -------------------------------------------------------------------

interface PointHistoryEntry {
  id: string;
  date: string;
  type: string;
  amount: number;
  balance: number;
}

interface PointSummary {
  totalEarned: number;
  totalUsed: number;
  currentBalance: number;
}

interface PointDetail {
  id: string;
  date: string;
  slipNo: string;
  saleAmount: number;
  pointAmount: number;
}

interface PointCategory {
  category: string;
  count: number;
  totalAmount: number;
}

interface PointSaveSellDialogProps {
  open: boolean;
  onClose: () => void;
  customerId?: string;
  customerName?: string;
}

// Stub data
const STUB_HISTORY: PointHistoryEntry[] = [
  { id: 'PH1', date: '2026-04-01', type: '적립', amount: 500, balance: 5500 },
  { id: 'PH2', date: '2026-04-03', type: '사용', amount: -2000, balance: 3500 },
  { id: 'PH3', date: '2026-04-05', type: '적립', amount: 300, balance: 3800 },
];

const STUB_SUMMARY: PointSummary = {
  totalEarned: 12000,
  totalUsed: 8200,
  currentBalance: 3800,
};

const STUB_DETAILS: PointDetail[] = [
  { id: 'PD1', date: '2026-04-01', slipNo: 'S001', saleAmount: 50000, pointAmount: 500 },
  { id: 'PD2', date: '2026-04-03', slipNo: 'S002', saleAmount: 0, pointAmount: -2000 },
];

const STUB_CATEGORIES: PointCategory[] = [
  { category: '식사', count: 5, totalAmount: 3000 },
  { category: '음료', count: 2, totalAmount: 800 },
];

export default function PointSaveSellDialog({
  open,
  onClose,
  customerId,
  customerName,
}: PointSaveSellDialogProps) {
  const [startDate, setStartDate] = useState<string>('2026-04-01');
  const [endDate, setEndDate] = useState<string>('2026-04-05');
  const [activeTab, setActiveTab] = useState<'history' | 'summary' | 'detail' | 'category'>('history');

  const fmt = (v: number) => v.toLocaleString('ko-KR');

  const handleSearch = useCallback(() => {
    // TODO: CUSTOMER:SEARCH bridge command with searchType: "POINT_HISTORY"
    console.log('[PointSaveSellDialog] search:', { customerId, startDate, endDate });
  }, [customerId, startDate, endDate]);

  const handlePrint = useCallback(() => {
    // TODO: SALES:EXPORT bridge command (exportType: "PRINT", dataType: "POINT_HISTORY")
    console.log('[PointSaveSellDialog] print');
  }, []);

  const handleExportExcel = useCallback(() => {
    // TODO: SALES:EXPORT bridge command (exportType: "EXCEL", dataType: "POINT_HISTORY")
    console.log('[PointSaveSellDialog] export excel');
  }, []);

  const handleSavePoint = useCallback(() => {
    // TODO: PAYMENT:SAVE_POINT bridge command (admin-only)
    console.log('[PointSaveSellDialog] save point manually');
  }, []);

  const tabs = [
    { id: 'history' as const, label: '적립내역' },
    { id: 'summary' as const, label: '요약' },
    { id: 'detail' as const, label: '상세' },
    { id: 'category' as const, label: '분류' },
  ];

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="포인트 적립 매출 조회"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrint}>인쇄</Button>
          <Button variant="ghost" size="sm" onClick={handleExportExcel}>엑셀</Button>
          <Button variant="outline" size="sm" onClick={handleSavePoint}>포인트저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Customer info */}
        {customerName && (
          <div className="shrink-0 text-sm text-pos-text-secondary">
            고객: <span className="font-semibold text-pos-text">{customerName}</span>
          </div>
        )}

        {/* Date range picker */}
        <div className="shrink-0 flex items-center gap-2 h-9">
          <DatePicker value={startDate} onChange={setStartDate} />
          <span className="text-pos-text-muted">~</span>
          <DatePicker value={endDate} onChange={setEndDate} />
          <Button variant="primary" size="sm" onClick={handleSearch}>조회</Button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex gap-1 border-b border-pos-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-xs font-semibold
                border-b-2 transition-colors cursor-pointer
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-pos-text-muted'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {activeTab === 'history' && (
            <div className="border border-pos-border rounded-pos-card overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_2fr_2fr] gap-1 px-3 py-1 bg-gray-100 text-xs font-semibold text-pos-text-secondary">
                <span>날짜</span>
                <span>구분</span>
                <span className="text-right">금액</span>
                <span className="text-right">잔액</span>
              </div>
              {STUB_HISTORY.map((entry) => (
                <div key={entry.id} className="grid grid-cols-[2fr_1fr_2fr_2fr] gap-1 px-3 py-2 text-sm border-b border-pos-border">
                  <span className="text-pos-text-secondary">{entry.date}</span>
                  <span className={entry.type === '적립' ? 'text-primary-500' : 'text-pos-error'}>{entry.type}</span>
                  <span className={`text-right tabular-nums ${entry.amount >= 0 ? 'text-primary-500' : 'text-pos-error'}`}>
                    {entry.amount >= 0 ? '+' : ''}{fmt(entry.amount)}
                  </span>
                  <span className="text-right tabular-nums text-pos-text">{fmt(entry.balance)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="flex flex-col gap-2 p-3 bg-pos-bg rounded-pos-card border border-pos-border">
              <div className="flex justify-between text-sm">
                <span className="text-pos-text-secondary">총 적립</span>
                <span className="font-bold text-primary-500 tabular-nums">{fmt(STUB_SUMMARY.totalEarned)}P</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-pos-text-secondary">총 사용</span>
                <span className="font-bold text-pos-error tabular-nums">{fmt(STUB_SUMMARY.totalUsed)}P</span>
              </div>
              <div className="border-t border-pos-border my-1" />
              <div className="flex justify-between text-md">
                <span className="font-bold text-pos-text">현재 잔액</span>
                <span className="font-bold text-primary-500 tabular-nums text-lg">{fmt(STUB_SUMMARY.currentBalance)}P</span>
              </div>
            </div>
          )}

          {activeTab === 'detail' && (
            <div className="border border-pos-border rounded-pos-card overflow-hidden">
              <div className="grid grid-cols-[2fr_2fr_2fr_2fr] gap-1 px-3 py-1 bg-gray-100 text-xs font-semibold text-pos-text-secondary">
                <span>날짜</span>
                <span>전표번호</span>
                <span className="text-right">매출금액</span>
                <span className="text-right">포인트</span>
              </div>
              {STUB_DETAILS.map((d) => (
                <div key={d.id} className="grid grid-cols-[2fr_2fr_2fr_2fr] gap-1 px-3 py-2 text-sm border-b border-pos-border">
                  <span className="text-pos-text-secondary">{d.date}</span>
                  <span className="text-pos-text">{d.slipNo}</span>
                  <span className="text-right tabular-nums">{fmt(d.saleAmount)}</span>
                  <span className={`text-right tabular-nums ${d.pointAmount >= 0 ? 'text-primary-500' : 'text-pos-error'}`}>
                    {d.pointAmount >= 0 ? '+' : ''}{fmt(d.pointAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'category' && (
            <div className="border border-pos-border rounded-pos-card overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_2fr] gap-1 px-3 py-1 bg-gray-100 text-xs font-semibold text-pos-text-secondary">
                <span>분류</span>
                <span className="text-center">건수</span>
                <span className="text-right">합계</span>
              </div>
              {STUB_CATEGORIES.map((c) => (
                <div key={c.category} className="grid grid-cols-[2fr_1fr_2fr] gap-1 px-3 py-2 text-sm border-b border-pos-border">
                  <span className="text-pos-text">{c.category}</span>
                  <span className="text-center tabular-nums">{c.count}</span>
                  <span className="text-right tabular-nums">{fmt(c.totalAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FullScreenPanel>
  );
}
