'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import NumPad from '@shared/ui/molecules/NumPad';
import ChangeCalculator from '@shared/ui/specialized/ChangeCalculator';

// -------------------------------------------------------------------
// PaymentEtcDialog -- 기타 결제수단 입력 팝업 (accetc-dialig.md)
//
// 식권(외상), 포인트, 쿠폰, 예치금, 카드 미승인, 현금, OK캐시백 등
// 기타 결제수단의 금액 입력과 처리.
// -------------------------------------------------------------------

interface PaymentEtcDialogProps {
  open: boolean;
  onClose: () => void;
  tableId: string;
  totalAmount: number;
  paidAmount: number;
}

type EtcPaymentType =
  | 'ticket'     // 식권/외상
  | 'point'      // 포인트
  | 'coupon'     // 쿠폰
  | 'deposit'    // 예치금
  | 'card-unapproved' // 카드 미승인
  | 'cash'       // 현금
  | 'okcashback1' | 'okcashback2' | 'okcashback3' | 'okcashback4'
  | 'payco';

const ETC_PAYMENT_BUTTONS: Array<{ id: EtcPaymentType; label: string; priority: string; hidden?: boolean }> = [
  { id: 'ticket', label: '식권/외상', priority: 'P1' },
  { id: 'point', label: '포인트', priority: 'P0' },
  { id: 'coupon', label: '쿠폰', priority: 'P1' },
  { id: 'deposit', label: '예치금', priority: 'P1' },
  { id: 'card-unapproved', label: '카드미승인', priority: 'P1' },
  { id: 'cash', label: '현금', priority: 'P0' },
  { id: 'okcashback1', label: 'OK캐시백1', priority: 'P2', hidden: true },
  { id: 'okcashback2', label: 'OK캐시백2', priority: 'P2', hidden: true },
  { id: 'okcashback3', label: 'OK캐시백3', priority: 'P2', hidden: true },
  { id: 'okcashback4', label: 'OK캐시백4', priority: 'P2', hidden: true },
  { id: 'payco', label: 'PAYCO', priority: 'P2', hidden: true },
];

export default function PaymentEtcDialog({
  open,
  onClose,
  tableId,
  totalAmount,
  paidAmount,
}: PaymentEtcDialogProps) {
  const [numpadValue, setNumpadValue] = useState<string>('0');
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<EtcPaymentType | ''>('');

  const remainingAmount = totalAmount - paidAmount;

  const handleNumpadChange = useCallback((value: string) => {
    setNumpadValue(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      setInputAmount(parsed);
    }
  }, []);

  const handleExecutePayment = useCallback((type: EtcPaymentType) => {
    setSelectedType(type);

    switch (type) {
      case 'cash':
        // TODO: PAYMENT:CASH bridge command
        console.log('[PaymentEtcDialog] cash:', inputAmount);
        break;
      case 'point':
        // TODO: PAYMENT:APPLY_POINT bridge command
        console.log('[PaymentEtcDialog] point:', inputAmount);
        break;
      case 'ticket':
        // TODO: PAYMENT:EXECUTE bridge command (ticket/credit)
        console.log('[PaymentEtcDialog] ticket:', inputAmount);
        break;
      case 'coupon':
        // TODO: PAYMENT:EXECUTE bridge command (coupon)
        console.log('[PaymentEtcDialog] coupon:', inputAmount);
        break;
      case 'deposit':
        // TODO: PAYMENT:EXECUTE bridge command (deposit)
        console.log('[PaymentEtcDialog] deposit:', inputAmount);
        break;
      case 'card-unapproved':
        // TODO: PAYMENT:CARD bridge command (unapproved, no CardReader call)
        // Offline card payment: DB 직접 저장
        console.log('[PaymentEtcDialog] card unapproved:', inputAmount);
        break;
      case 'okcashback1':
      case 'okcashback2':
      case 'okcashback3':
      case 'okcashback4':
        // TODO: PAYMENT:SAVE_POINT bridge command (OK cashback, KR only)
        console.log('[PaymentEtcDialog] ok cashback:', type, inputAmount);
        break;
      case 'payco':
        // TODO: PAYMENT:QR bridge command (synchronous-wait)
        console.log('[PaymentEtcDialog] payco:', inputAmount);
        break;
      default:
        break;
    }
  }, [inputAmount]);

  const handleComplete = useCallback(() => {
    // TODO: PAYMENT:EXECUTE bridge command (confirm etc payment)
    console.log('[PaymentEtcDialog] complete etc payment');
    onClose();
  }, [onClose]);

  const fmt = (v: number) => v.toLocaleString('ko-KR');

  // Filter buttons: hidden buttons shown conditionally (stub: show all non-hidden)
  const visibleButtons = ETC_PAYMENT_BUTTONS.filter((b) => !b.hidden);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="기타결제"
      size="lg"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleComplete}>완료</Button>
          <Button variant="ghost" size="md" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Amount display */}
        <div className="flex flex-col gap-1 p-3 bg-pos-bg rounded-pos-card border border-pos-border">
          <div className="flex justify-between text-sm">
            <span className="text-pos-text-secondary">받은금액</span>
            <span className="font-semibold text-pos-text tabular-nums">{fmt(paidAmount)}원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-pos-text-secondary">기결제 내역</span>
            <span className="font-semibold text-pos-text tabular-nums">{fmt(paidAmount)}원</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-pos-text-secondary">거스름돈</span>
            <span className={`font-bold tabular-nums ${remainingAmount <= 0 ? 'text-primary-500' : 'text-pos-error'}`}>
              {fmt(Math.max(0, paidAmount - totalAmount))}원
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-pos-text-secondary">작업금액</span>
            <span className="font-bold text-primary-500 tabular-nums">{fmt(remainingAmount)}원</span>
          </div>
        </div>

        {/* NumPad */}
        <div>
          <div className="text-xs text-pos-text-muted mb-2 font-semibold">금액 입력</div>
          <NumPad
            onInput={handleNumpadChange}
            onConfirm={() => {}}
            onClear={() => setNumpadValue('0')}
            onBackspace={() => setNumpadValue((v) => v.length > 1 ? v.slice(0, -1) : '0')}
          />
        </div>

        {/* Payment type buttons */}
        <div>
          <div className="text-xs text-pos-text-muted mb-2 font-semibold">결제수단</div>
          <div className="grid grid-cols-3 gap-2">
            {visibleButtons.map((btn) => (
              <Button
                key={btn.id}
                variant={selectedType === btn.id ? 'primary' : 'secondary'}
                size="md"
                fullWidth
                onClick={() => handleExecutePayment(btn.id)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
