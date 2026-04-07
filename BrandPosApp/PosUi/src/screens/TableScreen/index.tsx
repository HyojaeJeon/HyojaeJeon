'use client';

import { useState, useEffect, useCallback } from 'react';
import FloorSelector from '@shared/ui/organisms/FloorSelector';
import Label from '@shared/ui/atoms/Label';
import Button from '@shared/ui/atoms/Button';
import TableCard from './components/TableCard';
import TableBtnSelectDialog from './components/TableBtnSelectDialog';
import TableMessageDialog from './components/TableMessageDialog';
import { usePosI18n } from '@i18n/PosI18nProvider';
import { useSetPosShell } from '@shared/layout/PosShellContext';

/**
 * TableScreen -- 테이블 현황 메인 화면 (레거시 IDD_TABLE_DIALOG)
 *
 * 층별 테이블 상태를 그리드로 표시하고, 테이블 선택/결제/기능 실행 등
 * POS 핵심 업무의 진입점 역할을 하는 메인 운영 화면.
 *
 * Bridge Commands:
 *   TABLE:CHANGE_FLOOR, TABLE:REFRESH, TABLE:SELECT,
 *   PAYMENT:CASH, PAYMENT:CARD, PAYMENT:CASH_RECEIPT,
 *   SYSTEM:MINIMIZE, STAFF:CLOCK_IN_OUT
 */

// ─── Types ───

interface TableData {
  id: number;
  code: string;
  label: string;
  status: string;
  floorId: string;
  personCount: number;
  totalAmount: number;
  firstOrderDate?: string;
  message?: string;
  [key: string]: unknown;
}

interface DailySummary {
  orderCount: number;
  salesCount: number;
  cashTotal: number;
  cardTotal: number;
  etcTotal: number;
}

interface Floor {
  id: string;
  name: string;
}

interface TableScreenProps {
  onNavigate?: (screen: 'MainMenu' | 'Order' | 'Payment') => void;
}

// ─── Stub Data ───

const STUB_FLOORS: Floor[] = [
  { id: '1F', name: '1F' },
  { id: '2F', name: '2F' },
  { id: '3F', name: '3F' },
];

const STUB_TABLES: TableData[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  code: `T${String(i + 1).padStart(2, '0')}`,
  label: `${i + 1}`,
  status: i < 4 ? 'OCCUPIED' : i === 4 ? 'PAYING' : 'EMPTY',
  floorId: '1F',
  personCount: i < 5 ? Math.floor(Math.random() * 6) + 1 : 0,
  totalAmount: i < 5 ? Math.floor(Math.random() * 200000) : 0,
}));

const STUB_SUMMARY: DailySummary = {
  orderCount: 23,
  salesCount: 18,
  cashTotal: 450000,
  cardTotal: 780000,
  etcTotal: 120000,
};

// ─── Dynamic Function Button Config ───

interface DynButton {
  id: string;
  label: string;
  handler: () => void;
}

// ─── Component ───

export default function TableScreen({ onNavigate }: TableScreenProps) {
  const { t } = usePosI18n();
  // ─── State ───
  const [selectedFloor, setSelectedFloor] = useState('1F');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);
  const [tables] = useState<TableData[]>(STUB_TABLES);
  const [summary] = useState<DailySummary>(STUB_SUMMARY);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [isFunctionPanelOpen, setIsFunctionPanelOpen] = useState(false);
  const [isTableMessageOpen, setIsTableMessageOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(t('table.preparing'));
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // TODO: RTK Query tableApi.getTables, tableApi.getDailySummary, systemApi.getConfig 연동
  // TODO: uiSlice에서 selectedFloor, currentPage 상태 관리

  // ─── Clock ───
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentDate(
        `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
      );
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  // ─── Filtered Tables ───
  const filteredTables = tables.filter((t) => t.floorId === selectedFloor);

  // ─── Handlers ───

  const handleFloorChange = useCallback((floorId: string) => {
    // TODO: TABLE:CHANGE_FLOOR Bridge command
    console.log('[TableScreen] TABLE:CHANGE_FLOOR', floorId);
    setSelectedFloor(floorId);
    setCurrentPage(1);
  }, []);

  const handleFloorUp = useCallback(() => {
    const idx = STUB_FLOORS.findIndex((f) => f.id === selectedFloor);
    if (idx < STUB_FLOORS.length - 1) {
      handleFloorChange(STUB_FLOORS[idx + 1].id);
    }
  }, [selectedFloor, handleFloorChange]);

  const handleFloorDown = useCallback(() => {
    const idx = STUB_FLOORS.findIndex((f) => f.id === selectedFloor);
    if (idx > 0) {
      handleFloorChange(STUB_FLOORS[idx - 1].id);
    }
  }, [selectedFloor, handleFloorChange]);

  const handlePagePrev = useCallback(() => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  }, [currentPage]);

  const handlePageNext = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  }, [currentPage, totalPages]);

  const handleTableSelect = useCallback(async (tableId: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStatusMessage(t('table.selectingTable'));

    try {
      // TODO: TABLE:SELECT Bridge command -> SelectTableUseCase
      console.log('[TableScreen] TABLE:SELECT', { tableId, floorId: selectedFloor });
      setSelectedTableId(tableId);
      onNavigate?.('Order');
    } catch {
      setStatusMessage(t('table.selectFailed'));
    } finally {
      setIsProcessing(false);
      setStatusMessage(t('table.preparing'));
    }
  }, [isProcessing, selectedFloor, t, onNavigate]);

  const handleRefresh = useCallback(() => {
    // TODO: TABLE:REFRESH Bridge command
    console.log('[TableScreen] TABLE:REFRESH', { floorId: selectedFloor, page: currentPage });
  }, [selectedFloor, currentPage]);

  const handleCashPayment = useCallback(() => {
    // TODO: PAYMENT:CASH -> handoff to PaymentScreen
    console.log('[TableScreen] PAYMENT:CASH');
    onNavigate?.('Payment');
  }, [onNavigate]);

  const handleCardPayment = useCallback(() => {
    // TODO: PAYMENT:CARD -> handoff to PaymentScreen
    console.log('[TableScreen] PAYMENT:CARD');
    onNavigate?.('Payment');
  }, [onNavigate]);

  const handleCashReceipt = useCallback(() => {
    // TODO: PAYMENT:CASH_RECEIPT -> handoff to PaymentScreen
    console.log('[TableScreen] PAYMENT:CASH_RECEIPT');
    onNavigate?.('Payment');
  }, [onNavigate]);

  const handleToggleFunctionPanel = useCallback(() => {
    setIsFunctionPanelOpen((prev) => !prev);
  }, []);

  const handleMinimize = useCallback(() => {
    // TODO: SYSTEM:MINIMIZE Bridge command
    console.log('[TableScreen] SYSTEM:MINIMIZE');
  }, []);

  const handleClockInOut = useCallback(() => {
    // TODO: STAFF:CLOCK_IN_OUT -> handoff to emp-diligence
    console.log('[TableScreen] STAFF:CLOCK_IN_OUT');
  }, []);

  const handleDelivery = useCallback(() => {
    // TODO: DELIVERY:MANAGE -> handoff to DeliveryScreen
    console.log('[TableScreen] DELIVERY:MANAGE');
  }, []);

  const handleClose = useCallback(() => {
    // TODO: MainScreen 복귀
    console.log('[TableScreen] close -> MainScreen');
    onNavigate?.('MainMenu');
  }, [onNavigate]);

  const handleOpenTableMessage = useCallback(() => {
    if (selectedTableId) {
      setIsTableMessageOpen(true);
    }
  }, [selectedTableId]);

  // ─── Dynamic Function Buttons (설정 기반) ───

  const dynButtons: DynButton[] = [
    { id: 'btn1', label: t('table.button1'), handler: () => console.log('[TableScreen] DynBtn 1') },
    { id: 'btn2', label: t('table.button2'), handler: () => console.log('[TableScreen] DynBtn 2') },
    { id: 'btn3', label: t('table.button3'), handler: () => console.log('[TableScreen] DynBtn 3') },
    { id: 'btn4', label: t('table.button4'), handler: () => console.log('[TableScreen] DynBtn 4') },
    { id: 'btn5', label: t('table.button5'), handler: () => console.log('[TableScreen] DynBtn 5') },
    { id: 'btn6', label: t('table.button6'), handler: () => console.log('[TableScreen] DynBtn 6') },
  ];

  // ─── Selected Table Info ───
  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;

  useSetPosShell({
    domain: t('table.header') || '테이블',
    screen: selectedTable ? `${selectedTable.code} · ${selectedTable.label}` : undefined,
    onClose: handleMinimize,
  });

  return (
    <div className="flex flex-col w-full h-full bg-pos-surface">
      {/* ═══ Header ═══ */}
      <header className="h-header flex items-center justify-between px-4 bg-pos-bg border-b border-pos-border shrink-0">
        {/* Left: connection + datetime + staff */}
        <div className="flex items-center gap-3">
          {/* 중간연결 상태 */}
          <button
            type="button"
            onClick={() => { /* TODO: POS 간 연결 상태 표시/제어 */ }}
            className="h-7 px-2 rounded-pos-sm bg-pos-success/10 text-pos-success text-2xs font-semibold"
          >
            {t('table.connected')}
          </button>
          {/* 최소화 */}
          <button
            type="button"
            onClick={handleMinimize}
            className="w-7 h-7 rounded-pos-sm bg-pos-surface flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {/* 날짜 / 시간 */}
          <div className="flex flex-col items-center">
            <Label size="xs" weight="semibold">{currentDate}</Label>
            <Label size="xs" color="muted">{currentTime}</Label>
          </div>
          {/* 근태 */}
          <button
            type="button"
            onClick={handleClockInOut}
            className="w-7 h-7 rounded-pos-sm bg-pos-surface flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {/* 배달 */}
          <button
            type="button"
            onClick={handleDelivery}
            className="w-7 h-7 rounded-pos-sm bg-pos-surface flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="3" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 3V1M9 3V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {/* 담당자명 */}
          <Label size="xs" weight="semibold" color="secondary">{t('table.staff')}</Label>
        </div>

        {/* Right: daily summary + close */}
        <div className="flex items-center gap-4">
          {/* 매출 요약 */}
          <div className="flex items-center gap-3 text-2xs tabular-nums">
            <SummaryCell label={t('table.count')} value={`${summary.orderCount}/${summary.salesCount}`} />
            <SummaryCell label={t('table.total')} value={formatAmount(summary.cashTotal + summary.cardTotal + summary.etcTotal)} />
            <SummaryCell label={t('table.paymentCash')} value={formatAmount(summary.cashTotal)} />
            <SummaryCell label={t('table.paymentCard')} value={formatAmount(summary.cardTotal)} />
            <SummaryCell label={t('table.etc')} value={formatAmount(summary.etcTotal)} />
          </div>
          {/* 닫기 */}
          <button
            type="button"
            onClick={handleClose}
            className="h-8 px-4 rounded-pos-btn bg-pos-surface border border-pos-border text-xs font-semibold text-pos-text cursor-pointer active:bg-pos-border active:scale-[0.97]"
          >
            {t('common.close')}
          </button>
        </div>
      </header>

      {/* ═══ Body ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* 테이블 그리드 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-4 gap-4 max-w-[800px] mx-auto">
              {filteredTables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  isSelected={table.id === selectedTableId}
                  onSelect={handleTableSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CID 사이드 패널 (고객표시기 정보) */}
        <div className="w-[180px] shrink-0 border-l border-pos-border bg-pos-bg flex flex-col">
          <div className="h-8 flex items-center justify-center border-b border-pos-border">
            <Label size="xs" weight="semibold" color="muted">CID</Label>
          </div>
          <div className="flex-1 p-2 text-center">
            {/* TODO: RTK Query tableApi.getActiveCID 연동 */}
            <Label size="xs" color="muted">{t('table.noCid')}</Label>
          </div>
        </div>
      </div>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-pos-border bg-pos-bg shrink-0">
        {/* 상단: 층 선택 + 페이지 + 기능 */}
        <div className="flex items-center justify-between px-2 py-1">
          {/* 결제 버튼 */}
          <div className="flex items-center gap-1">
            <Button variant="primary" size="sm" onClick={handleCashPayment}>{t('table.paymentCash')}</Button>
            <Button variant="secondary" size="sm" onClick={handleCardPayment}>{t('table.paymentCard')}</Button>
            <Button variant="ghost" size="sm" onClick={handleCashReceipt}>{t('table.paymentCashReceipt')}</Button>
          </div>

          {/* 기능 선택 토글 */}
          <Button
            variant={isFunctionPanelOpen ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleFunctionPanel}
          >
            {t('table.functionMenu')}
          </Button>

          {/* 층 선택 */}
          <div className="flex items-center gap-1">
            <FloorSelector
              floors={STUB_FLOORS}
              activeId={selectedFloor}
              onSelect={handleFloorChange}
            />
            <button
              type="button"
              onClick={handleFloorDown}
              className="w-8 h-8 rounded-pos-sm bg-pos-surface border border-pos-border flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95]"
            >
              &#x25BC;
            </button>
            <button
              type="button"
              onClick={handleFloorUp}
              className="w-8 h-8 rounded-pos-sm bg-pos-surface border border-pos-border flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95]"
            >
              &#x25B2;
            </button>
          </div>

          {/* 페이지 */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePagePrev}
              disabled={currentPage <= 1}
              className="w-8 h-8 rounded-pos-sm bg-pos-surface border border-pos-border flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95] disabled:opacity-30"
            >
              &#x25C0;
            </button>
            <Label size="xs" color="muted">{currentPage}/{totalPages}</Label>
            <button
              type="button"
              onClick={handlePageNext}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-pos-sm bg-pos-surface border border-pos-border flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95] disabled:opacity-30"
            >
              &#x25B6;
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="w-8 h-8 rounded-pos-sm bg-pos-surface border border-pos-border flex items-center justify-center text-pos-text-muted cursor-pointer active:scale-[0.95]"
            >
              &#x21BB;
            </button>
          </div>
        </div>

        {/* 하단: 동적 기능 버튼 바 */}
        <div className="flex items-center gap-1 px-2 py-1 border-t border-pos-border">
          {dynButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={btn.handler}
              className="flex-1 h-touch rounded-pos-btn bg-pos-surface border border-pos-border text-xs font-semibold text-pos-text-secondary cursor-pointer active:bg-pos-border active:scale-[0.97]"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* 상태 표시 바 */}
        <div className="h-6 flex items-center px-4 bg-pos-bg border-t border-pos-border">
          <Label size="xs" color="muted">{statusMessage}</Label>
        </div>
      </footer>

      {/* ═══ Modals ═══ */}

      {/* TABLE_BSELECT 기능 선택 팝업 */}
      {isFunctionPanelOpen && (
        <TableBtnSelectDialog
          selectedTableId={selectedTableId}
          onClose={() => setIsFunctionPanelOpen(false)}
          onOpenTableMessage={handleOpenTableMessage}
        />
      )}

      {/* TABLEMSG_DLG 테이블 메시지 모달 */}
      {isTableMessageOpen && selectedTable && (
        <TableMessageDialog
          tableId={selectedTable.id}
          tableName={selectedTable.label}
          initialMessage={selectedTable.message ?? ''}
          onClose={() => setIsTableMessageOpen(false)}
          onSave={(tableId, message) => {
            // TODO: TABLE:SET_MESSAGE Bridge command -> SetTableMessageUseCase
            console.log('[TableScreen] TABLE:SET_MESSAGE', { tableId, message });
            setIsTableMessageOpen(false);
          }}
        />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/[var(--opacity-overlay)] flex items-center justify-center z-[var(--z-modal)]">
          <div className="bg-pos-bg rounded-pos-card px-8 py-6 shadow-pos-modal text-center">
            <div className="text-lg font-bold text-pos-text">{t('common.processing')}</div>
            <div className="text-md text-pos-text-secondary mt-1">{t('common.pleaseWait')}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Internal Components ───

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-pos-text-muted">{label}</span>
      <span className="text-pos-text font-semibold">{value}</span>
    </div>
  );
}

function formatAmount(amount: number): string {
  return amount.toLocaleString();
}
