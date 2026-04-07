'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import Label from '@shared/ui/atoms/Label';

/**
 * TableBtnSelectDialog -- 기능 선택 팝업 (레거시 IDD_TABLE_BSELECT)
 *
 * 테이블 화면에서 "기능" 버튼을 눌렀을 때 열리는 기능 선택 팝업.
 * 테이블 이동/합석/포장/외상/예약/정산 등 다양한 업무 기능의 진입점.
 *
 * Bridge Commands:
 *   TABLE:MOVE, TABLE:MERGE, TABLE:SELECT (포장), TABLE:SET_RESERVATION,
 *   TABLE:SET_MESSAGE, TABLE:REFRESH, ORDER:PRINT, ORDER:COMPLETE,
 *   SYSTEM:OPEN_DRAWER, SYSTEM:SET_LANG
 */

// ─── Types ───

interface TableBtnSelectDialogProps {
  selectedTableId: number | null;
  onClose: () => void;
  onOpenTableMessage: () => void;
}

type Lang = 'KR' | 'EN' | 'VN';

interface FunctionMenuItem {
  id: string;
  label: string;
  priority: 'P0' | 'P1' | 'P2';
  hidden?: boolean;
  disabled?: boolean;
  handler: () => void;
}

// ─── Component ───

export default function TableBtnSelectDialog({
  selectedTableId,
  onClose,
  onOpenTableMessage,
}: TableBtnSelectDialogProps) {
  const [lang, setLang] = useState<Lang>('KR');
  const [dynButtons, setDynButtons] = useState<{ id: string; label: string }[]>([
    { id: 'btn1', label: '기능1' },
    { id: 'btn2', label: '기능2' },
    { id: 'btn3', label: '기능3' },
    { id: 'btn4', label: '기능4' },
    { id: 'btn5', label: '기능5' },
    { id: 'btn6', label: '기능6' },
    { id: 'btn7', label: '기능7' },
    { id: 'btn8', label: '기능8' },
  ]);

  // ─── Stub Handlers ───

  const handleMove = useCallback(() => {
    // TODO: TABLE:MOVE Bridge command -> MoveTableUseCase
    // Opens MoveTableModal to select target table
    console.log('[TableBtnSelectDialog] TABLE:MOVE', { sourceTableId: selectedTableId });
  }, [selectedTableId]);

  const handleMerge = useCallback(() => {
    // TODO: TABLE:MERGE Bridge command -> MergeTableUseCase
    // Opens MergeTableModal to select target table
    console.log('[TableBtnSelectDialog] TABLE:MERGE', { sourceTableId: selectedTableId });
  }, [selectedTableId]);

  const handleTakeout = useCallback(() => {
    // TODO: TABLE:SELECT (포장) -> SelectTableUseCase (포장 테이블)
    console.log('[TableBtnSelectDialog] TAKEOUT');
  }, []);

  const handleResend = useCallback(() => {
    // TODO: ORDER:PRINT Bridge command -> 주문서 재전송
    console.log('[TableBtnSelectDialog] ORDER:PRINT (재전송)');
  }, []);

  const handleBill = useCallback(() => {
    // TODO: PAYMENT:PRINT_BILL -> handoff to PaymentScreen
    console.log('[TableBtnSelectDialog] PAYMENT:PRINT_BILL');
  }, []);

  const handleReservation = useCallback(() => {
    // TODO: TABLE:SET_RESERVATION (미확정)
    console.log('[TableBtnSelectDialog] TABLE:SET_RESERVATION (TODO: 예약 설계 미확정)');
  }, []);

  const handleCredit = useCallback(() => {
    // TODO: PAYMENT:CREDIT -> handoff to PaymentScreen (외상매출)
    console.log('[TableBtnSelectDialog] PAYMENT:CREDIT (외상매출)');
  }, []);

  const handlePrepaidList = useCallback(() => {
    // TODO: PAYMENT:PREPAID_LIST -> handoff to PaymentScreen (선불금내역)
    console.log('[TableBtnSelectDialog] PAYMENT:PREPAID_LIST');
  }, []);

  const handleReference = useCallback(() => {
    // TODO: 매출참고 조회
    console.log('[TableBtnSelectDialog] 매출참고');
  }, []);

  const handleOpenDrawer = useCallback(() => {
    // TODO: SYSTEM:OPEN_DRAWER Bridge command
    console.log('[TableBtnSelectDialog] SYSTEM:OPEN_DRAWER');
  }, []);

  const handleDeliveryCopy = useCallback(() => {
    // TODO: 배달복사
    console.log('[TableBtnSelectDialog] 배달복사');
  }, []);

  const handlePrepaid = useCallback(() => {
    // TODO: PAYMENT:PREPAID -> handoff to PaymentScreen (선수금)
    console.log('[TableBtnSelectDialog] PAYMENT:PREPAID');
  }, []);

  const handleSimpleReceipt = useCallback(() => {
    // TODO: PAYMENT:PRINT_SIMPLE -> handoff to PaymentScreen (간이영수증)
    console.log('[TableBtnSelectDialog] PAYMENT:PRINT_SIMPLE');
  }, []);

  const handleSellList = useCallback(() => {
    // TODO: 판매현황 조회
    console.log('[TableBtnSelectDialog] 판매현황');
  }, []);

  const handleDailyReport = useCallback(() => {
    // TODO: 일표 출력 (ORDER:PRINT)
    console.log('[TableBtnSelectDialog] 일표');
  }, []);

  const handleOrderItems = useCallback(() => {
    // TODO: 주문상품내역 조회
    console.log('[TableBtnSelectDialog] 주문상품내역');
  }, []);

  const handleCheckout = useCallback(() => {
    // TODO: PAYMENT:SETTLE -> handoff to PaymentScreen (정산)
    console.log('[TableBtnSelectDialog] PAYMENT:SETTLE (정산)');
  }, []);

  const handleDailyReportReset = useCallback(() => {
    // TODO: 일표 초기화
    console.log('[TableBtnSelectDialog] 일표 초기화');
  }, []);

  const handleReprint = useCallback(() => {
    // TODO: PAYMENT:REPRINT -> handoff to PaymentScreen (영수증 재발행)
    console.log('[TableBtnSelectDialog] PAYMENT:REPRINT');
  }, []);

  const handleKakaoAlim = useCallback(() => {
    // TODO: 카카오톡 알림톡 호출 (P2)
    console.log('[TableBtnSelectDialog] 알림톡호출');
  }, []);

  const handleOrderComplete = useCallback(() => {
    // TODO: ORDER:COMPLETE Bridge command -> CompleteOrderUseCase
    console.log('[TableBtnSelectDialog] ORDER:COMPLETE');
  }, []);

  const handleInOut = useCallback(() => {
    // TODO: 입출금 (숨김)
    console.log('[TableBtnSelectDialog] 입출금');
  }, []);

  const handleSetLang = useCallback((newLang: Lang) => {
    // TODO: SYSTEM:SET_LANG Bridge command
    console.log('[TableBtnSelectDialog] SYSTEM:SET_LANG', newLang);
    setLang(newLang);
  }, []);

  // ─── Dynamic Button Bar Handlers ───

  const handleDynDelete = useCallback(() => {
    // TODO: 동적 버튼 설정 삭제
    console.log('[TableBtnSelectDialog] 동적 버튼 삭제');
  }, []);

  const handleDynReset = useCallback(() => {
    // TODO: 동적 버튼 설정 초기화
    console.log('[TableBtnSelectDialog] 동적 버튼 초기화');
    setDynButtons([
      { id: 'btn1', label: '기능1' },
      { id: 'btn2', label: '기능2' },
      { id: 'btn3', label: '기능3' },
      { id: 'btn4', label: '기능4' },
      { id: 'btn5', label: '기능5' },
      { id: 'btn6', label: '기능6' },
      { id: 'btn7', label: '기능7' },
      { id: 'btn8', label: '기능8' },
    ]);
  }, []);

  const handleDynSave = useCallback(() => {
    // TODO: 동적 버튼 설정 저장
    console.log('[TableBtnSelectDialog] 동적 버튼 저장');
  }, []);

  // ─── Function Menu Items ───

  const functionMenuItems: FunctionMenuItem[] = [
    { id: 'inout',         label: '입출금',       priority: 'P1', hidden: true,  handler: handleInOut },
    { id: 'move',          label: '이동',         priority: 'P0',                handler: handleMove },
    { id: 'resend',        label: '주문서재전송', priority: 'P1',                handler: handleResend },
    { id: 'bill',          label: '빌지출력',     priority: 'P1',                handler: handleBill },
    { id: 'merge',         label: '합석',         priority: 'P0',                handler: handleMerge },
    { id: 'tableMsg',      label: '테이블메시지', priority: 'P1',                handler: onOpenTableMessage },
    { id: 'reference',     label: '매출참고',     priority: 'P1',                handler: handleReference },
    { id: 'reservation',   label: '예약',         priority: 'P1',                handler: handleReservation },
    { id: 'credit',        label: '외상매출',     priority: 'P1',                handler: handleCredit },
    { id: 'prepaidList',   label: '선불금내역',   priority: 'P2',                handler: handlePrepaidList },
    { id: 'drawer',        label: '서랍열기',     priority: 'P1',                handler: handleOpenDrawer },
    { id: 'takeout',       label: 'TAKE OUT',     priority: 'P0',                handler: handleTakeout },
    { id: 'prepaid',       label: '선수금',       priority: 'P2',                handler: handlePrepaid },
    { id: 'simpleReceipt', label: '간이영수증',   priority: 'P1',                handler: handleSimpleReceipt },
    { id: 'checkout',      label: '정산',         priority: 'P1',                handler: handleCheckout },
    { id: 'dailyReport',   label: '일표',         priority: 'P1',                handler: handleDailyReport },
    { id: 'dailyReset',    label: '일표 초기화',  priority: 'P2',                handler: handleDailyReportReset },
    { id: 'reprint',       label: '영수증재발행', priority: 'P1',                handler: handleReprint },
    { id: 'sellList',      label: '판매현황',     priority: 'P1',                handler: handleSellList },
    { id: 'orderItems',    label: '주문상품내역', priority: 'P1',                handler: handleOrderItems },
    { id: 'deliveryCopy',  label: '배달복사',     priority: 'P1',                handler: handleDeliveryCopy },
    { id: 'kakaoAlim',     label: '알림톡호출',   priority: 'P2',                handler: handleKakaoAlim },
    { id: 'orderComplete', label: '주문처리완료', priority: 'P0',                handler: handleOrderComplete },
  ];

  const visibleMenuItems = functionMenuItems.filter((item) => !item.hidden);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: 'var(--opacity-overlay)' }}
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative bg-pos-bg rounded-pos-2xl shadow-pos-modal flex flex-col w-[640px] max-h-[85%] animate-pos-slide-up">
        {/* ═══ Header ═══ */}
        <div className="h-header flex items-center justify-between px-5 border-b border-pos-border shrink-0">
          <Label size="md" weight="bold">기능 선택</Label>
          <div className="flex items-center gap-2">
            {/* 언어 선택 */}
            {(['KR', 'EN', 'VN'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleSetLang(l)}
                className={`w-9 h-7 rounded-pos-sm text-2xs font-bold cursor-pointer select-none active:scale-[0.95] ${
                  lang === l
                    ? 'bg-primary-500 text-white'
                    : 'bg-pos-surface text-pos-text-secondary border border-pos-border'
                }`}
              >
                {l}
              </button>
            ))}
            {/* 닫기 */}
            <button
              type="button"
              onClick={onClose}
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-pos-full text-pos-text-muted active:bg-gray-100 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ═══ Function Button Grid ═══ */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>
          <div className="grid grid-cols-4 gap-2">
            {visibleMenuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.handler();
                  // 일부 기능은 즉시 닫기, 일부는 모달 열기
                  if (!['tableMsg', 'move', 'merge'].includes(item.id)) {
                    onClose();
                  }
                }}
                disabled={item.disabled}
                className={`
                  h-touch flex items-center justify-center
                  rounded-pos-btn text-xs font-semibold
                  cursor-pointer select-none
                  active:scale-[0.95] transition-transform duration-fast
                  ${item.priority === 'P0'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : item.priority === 'P2'
                      ? 'bg-gray-50 text-pos-text-muted border border-gray-200'
                      : 'bg-pos-surface text-pos-text-secondary border border-pos-border'}
                  ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Dynamic Function Button Bar ═══ */}
        <div className="px-5 py-3 border-t border-pos-border">
          <div className="flex items-center gap-1 mb-2">
            {dynButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  // TODO: 동적 버튼 클릭 -> 해당 기능 실행
                  console.log('[TableBtnSelectDialog] DynBtn', btn.id);
                }}
                className="flex-1 h-touch rounded-pos-btn bg-pos-surface border border-pos-border text-xs font-semibold text-pos-text-secondary cursor-pointer active:bg-pos-border active:scale-[0.97]"
              >
                {btn.label}
              </button>
            ))}
          </div>
          {/* 삭제 / 초기화 / 저장 */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="danger" size="sm" onClick={handleDynDelete}>삭제</Button>
            <Button variant="secondary" size="sm" onClick={handleDynReset}>초기화</Button>
            <Button variant="primary" size="sm" onClick={handleDynSave}>저장</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
