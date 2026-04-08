'use client';

import { useState, useCallback } from 'react';
import SummaryPanel from '@shared/ui/organisms/SummaryPanel';
import PaymentMethodSelector from '@shared/ui/organisms/PaymentMethodSelector';
import ChangeCalculator from '@shared/ui/specialized/ChangeCalculator';
import NumPad from '@shared/ui/molecules/NumPad';
import Button from '@shared/ui/atoms/Button';
import Header from '@shared/ui/organisms/Header';
import { usePosI18n } from '@i18n/PosI18nProvider';
import { useSetPosShell } from '@shared/layout/PosShellContext';

// -- Sub-components (shell stubs imported from local components)
import PaymentHeader from './components/PaymentHeader';
import PaymentSummary from './components/PaymentSummary';
import OrderItemGrid from './components/OrderItemGrid';
import PaymentMethodPanel from './components/PaymentMethodPanel';
import PaymentMethodGrid from './components/PaymentMethodGrid';
import QuickPayPanel from './components/QuickPayPanel';
import DiscountPanel from './components/DiscountPanel';
import CustomerPanel from './components/CustomerPanel';
import PaymentActionBar from './components/PaymentActionBar';
import PaymentHistoryList from './components/PaymentHistoryList';

// -------------------------------------------------------------------
// PaymentScreen -- 결제 메인 화면 (account-dialog.md / account-dialog-vn.md 통합)
//
// KR/VN 로케일 통합: i18n 키 기반 단일 화면.
// VN 고유 차이(통화 포맷, 세금 표시)는 앱 내부 i18n인 PosUi/src/i18n/locales/vi/ 에서 관리.
// -------------------------------------------------------------------

/** 주문 항목 stub 타입 */
interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

/** 결제 내역 stub 타입 */
interface PaymentEntry {
  id: string;
  method: string;
  amount: number;
}

interface PaymentScreenProps {
  onNavigate?: (screen: 'MainMenu' | 'Table' | 'Order') => void;
  onBack?: () => void;
  onClose?: () => void;
}

export default function PaymentScreen({ onNavigate, onBack, onClose }: PaymentScreenProps) {
  // -- Local UI state ------------------------------------------------
  const { t } = usePosI18n();
  const [numpadValue, setNumpadValue] = useState<string>('0');
  // tableInfo는 아래에서 선언되므로 ref 시점을 맞추기 위해 함수 본문 뒤에서 useSetPosShell 호출
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

  // -- Stub data (to be replaced by RTK Query) -----------------------
  const tableInfo = { tableCode: 'T-01', personCount: 4, slipNo: '20260405-001', staffName: '직원A' };

  const orderItems: OrderItem[] = [
    { id: '1', name: '불고기정식', qty: 2, unitPrice: 12000, amount: 24000 },
    { id: '2', name: '된장찌개', qty: 1, unitPrice: 8000, amount: 8000 },
    { id: '3', name: '공기밥', qty: 3, unitPrice: 1000, amount: 3000 },
  ];

  const paymentHistory: PaymentEntry[] = [];

  const totalAmount = orderItems.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = 0;
  const netAmount = totalAmount - discountAmount;

  // -- Stub handlers -------------------------------------------------

  const handleCashPayment = useCallback(() => {
    // TODO: PAYMENT:CASH bridge command
    console.log('[PaymentScreen] cash payment', { amount: netAmount, received: receivedAmount });
  }, [netAmount, receivedAmount]);

  const handleCardPayment = useCallback(() => {
    // TODO: PAYMENT:CARD bridge command (synchronous-wait)
    console.log('[PaymentScreen] card payment', { amount: netAmount });
  }, [netAmount]);

  const handlePointPayment = useCallback(() => {
    // TODO: PAYMENT:APPLY_POINT bridge command
    console.log('[PaymentScreen] point payment');
  }, []);

  const handleApplyDiscount = useCallback(() => {
    // TODO: PAYMENT:APPLY_DISCOUNT bridge command
    console.log('[PaymentScreen] apply discount');
  }, []);

  const handlePaymentComplete = useCallback(() => {
    // TODO: PAYMENT:EXECUTE bridge command
    console.log('[PaymentScreen] payment complete');
    onNavigate?.('Table');
  }, [onNavigate]);

  const handlePaymentCancel = useCallback(() => {
    // TODO: PAYMENT:CANCEL bridge command
    console.log('[PaymentScreen] payment cancel');
    onNavigate?.('Order');
    onBack?.();
  }, [onNavigate, onBack]);

  const handlePaymentReset = useCallback(() => {
    // TODO: PAYMENT:CANCEL (reset) bridge command
    setReceivedAmount(0);
    setNumpadValue('0');
    setSelectedPaymentMethod('');
    console.log('[PaymentScreen] payment reset');
  }, []);

  const handlePrintReceipt = useCallback(() => {
    // TODO: SALES:REPRINT bridge command
    console.log('[PaymentScreen] print receipt');
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
    if (!onClose) {
      onNavigate?.('Order');
    }
  }, [onClose, onNavigate]);

  useSetPosShell({
    domain: t('payment.header') || '결제',
    screen: `${tableInfo.tableCode} · ${t('order.peopleCount')} ${tableInfo.personCount}`,
    onClose: handleClose,
  });

  const handleSearchCustomer = useCallback(() => {
    // TODO: CUSTOMER:SEARCH bridge command
    setIsCustomerSearchOpen(true);
    console.log('[PaymentScreen] search customer');
  }, []);

  const handleNumpadInput = useCallback((value: string) => {
    setNumpadValue(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setReceivedAmount(parsed);
    }
  }, []);

  const handleSelectPaymentMethod = useCallback((methodId: string) => {
    setSelectedPaymentMethod(methodId);
    // TODO: activate corresponding payment flow based on methodId
    console.log('[PaymentScreen] selected payment method:', methodId);
  }, []);

  // -- Render --------------------------------------------------------
  return (
    <div className="flex flex-col w-full h-full bg-pos-surface">
      {/* Header area: table info, date, staff */}
      <PaymentHeader
        tableCode={tableInfo.tableCode}
        personCount={tableInfo.personCount}
        slipNo={tableInfo.slipNo}
        staffName={tableInfo.staffName}
        onBack={handlePaymentCancel}
        onClose={handleClose}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: order items + summary */}
        <div className="flex flex-col w-[55%] border-r border-pos-border">
          {/* Order item grid */}
          <div className="flex-1 overflow-auto">
            <OrderItemGrid items={orderItems} />
          </div>

          {/* Payment summary */}
          <PaymentSummary
            totalAmount={totalAmount}
            discountAmount={discountAmount}
            netAmount={netAmount}
            receivedAmount={receivedAmount}
            changeAmount={receivedAmount - netAmount}
          />

          {/* Payment history list */}
          <PaymentHistoryList entries={paymentHistory} />
        </div>

        {/* Right panel: payment controls */}
        <div className="flex flex-col w-[45%] overflow-auto">
          {/* Payment method selector */}
          <div className="p-3 border-b border-pos-border">
            <PaymentMethodPanel
              selectedMethod={selectedPaymentMethod}
              onSelectMethod={handleSelectPaymentMethod}
              onCash={handleCashPayment}
              onCard={handleCardPayment}
              onPoint={handlePointPayment}
            />
          </div>

          {/* Dynamic payment method grid (ABTN 1~15) */}
          <div className="p-3 border-b border-pos-border">
            <PaymentMethodGrid
              selectedMethod={selectedPaymentMethod}
              onSelectMethod={handleSelectPaymentMethod}
            />
          </div>

          {/* Quick pay panel */}
          <div className="p-3 border-b border-pos-border">
            <QuickPayPanel onQuickPay={(amount) => {
              // TODO: PAYMENT:CASH quick payment
              console.log('[PaymentScreen] quick pay:', amount);
            }} />
          </div>

          {/* NumPad for amount input */}
          <div className="p-3 border-b border-pos-border">
            <NumPad
              onInput={handleNumpadInput}
              onConfirm={() => {}}
              onClear={() => setNumpadValue('0')}
              onBackspace={() => setNumpadValue((v) => v.length > 1 ? v.slice(0, -1) : '0')}
            />
          </div>

          {/* Change calculator */}
          <div className="p-3 border-b border-pos-border">
            <ChangeCalculator
              totalAmount={netAmount}
              receivedAmount={receivedAmount}
            />
          </div>

          {/* Discount panel */}
          <div className="p-3 border-b border-pos-border">
            <DiscountPanel onApplyDiscount={handleApplyDiscount} />
          </div>

          {/* Customer panel */}
          <div className="p-3 border-b border-pos-border">
            <CustomerPanel
              isSearchOpen={isCustomerSearchOpen}
              onSearch={handleSearchCustomer}
              onCloseSearch={() => setIsCustomerSearchOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <PaymentActionBar
        onComplete={handlePaymentComplete}
        onCancel={handlePaymentCancel}
        onReset={handlePaymentReset}
        onPrint={handlePrintReceipt}
      />
    </div>
  );
}
