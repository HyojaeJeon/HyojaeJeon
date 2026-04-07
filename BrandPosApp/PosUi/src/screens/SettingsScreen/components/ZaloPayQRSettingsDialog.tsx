'use client';

/**
 * ZaloPayQRSettingsDialog (SET-ZALOPAY-QR / ZALOPAY_QR)
 *
 * ZaloPay QR 결제 실행/대기 화면. **설정 화면이 아닌 실시간 결제 실행 화면.**
 * QR 코드 생성 -> 고객 스캔 -> 폴링 대기 -> 결제 완료/실패.
 * 온라인 필수 -- 오프라인 시 진입 차단.
 * NOT Outbox target.
 *
 * Legacy: IDD_ZALOPAY_QR
 * Bridge: PAYMENT:ZALOPAY:CREATE_QR, PAYMENT:ZALOPAY:CHECK_STATUS, PAYMENT:ZALOPAY:CANCEL
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

// ─── Types ───

type QRStatus = 'IDLE' | 'GENERATING' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

interface ZaloPayQRState {
  status: QRStatus;
  qrImageUrl: string | null;
  transactionId: string | null;
  expiresAt: string | null;
  errorCode: string | null;
}

interface ZaloPayQRSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  amount: number;
  tableCode: string;
  onPaymentComplete?: (transactionId: string) => void;
}

const POLLING_INTERVAL_MS = 3000;
const POLLING_TIMEOUT_MS = 5 * 60 * 1000;

// ─── Component ───

export default function ZaloPayQRSettingsDialog({
  open = true,
  onClose,
  amount,
  tableCode,
  onPaymentComplete,
}: ZaloPayQRSettingsDialogProps) {
  const [state, setState] = useState<ZaloPayQRState>({
    status: 'IDLE',
    qrImageUrl: null,
    transactionId: null,
    expiresAt: null,
    errorCode: null,
  });
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // TODO: RTK Query - paymentApi.useCreateZaloPayQRMutation()
  // TODO: RTK Query - paymentApi.useCheckZaloPayStatusQuery()
  // TODO: RTK Query - paymentApi.useCancelZaloPayMutation()

  // QR 생성 (화면 진입 시)
  useEffect(() => {
    if (!open) return;
    setState((prev) => ({ ...prev, status: 'GENERATING' }));
    // TODO: Bridge PAYMENT:ZALOPAY:CREATE_QR 호출
  }, [open, amount, tableCode]);

  // 폴링 (PENDING 상태)
  useEffect(() => {
    if (state.status !== 'PENDING') return;

    const startTime = Date.now();
    pollingRef.current = setInterval(() => {
      if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
        setState((prev) => ({ ...prev, status: 'EXPIRED' }));
        return;
      }
      // TODO: Bridge PAYMENT:ZALOPAY:CHECK_STATUS 호출
    }, POLLING_INTERVAL_MS);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [state.status]);

  // 결제 완료 콜백
  useEffect(() => {
    if (state.status === 'COMPLETED' && state.transactionId && onPaymentComplete) {
      onPaymentComplete(state.transactionId);
    }
  }, [state.status, state.transactionId, onPaymentComplete]);

  const handleCancel = useCallback(() => {
    // TODO: Bridge PAYMENT:ZALOPAY:CANCEL 호출
    setState((prev) => ({ ...prev, status: 'CANCELLED' }));
    if (pollingRef.current) clearInterval(pollingRef.current);
  }, []);

  const handlePrint = useCallback(() => {
    // TODO: QR 코드 인쇄 Bridge 호출
  }, [state.qrImageUrl]);

  const handleClose = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    onClose();
  }, [onClose]);

  const isPending = state.status === 'PENDING';
  const isTerminal = ['COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'].includes(state.status);

  return (
    <FullScreenPanel
      open={open}
      onClose={handleClose}
      title="ZaloPay 결제를 기다리고 있습니다"
      footer={
        <>
          {isPending && (
            <>
              <Button variant="secondary" size="sm" onClick={handlePrint}>QR 코드 인쇄</Button>
              <Button variant="danger" size="sm" onClick={handleCancel}>QR 코드 취소</Button>
            </>
          )}
          {isTerminal && (
            <Button variant="secondary" size="sm" onClick={handleClose}>대기종료</Button>
          )}
        </>
      }
    >
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
        {/* QR 코드 표시 영역 */}
        <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-pos-bg shadow-pos-card">
          {state.status === 'GENERATING' && (
            <span className="text-sm text-pos-text-muted">QR 생성 중...</span>
          )}
          {state.qrImageUrl && isPending && (
            <img src={state.qrImageUrl} alt="ZaloPay QR" className="h-full w-full object-contain rounded-2xl" />
          )}
          {state.status === 'COMPLETED' && (
            <span className="text-lg font-bold text-primary-500">결제 완료</span>
          )}
          {state.status === 'FAILED' && (
            <span className="text-lg font-bold text-warn-500">결제 실패</span>
          )}
          {state.status === 'EXPIRED' && (
            <span className="text-lg font-bold text-warn-500">시간 만료</span>
          )}
          {state.status === 'CANCELLED' && (
            <span className="text-lg font-bold text-pos-text-muted">취소됨</span>
          )}
        </div>

        {/* 금액 표시 */}
        <div className="text-xl font-bold text-pos-text">
          {amount.toLocaleString()} VND
        </div>
      </div>
    </FullScreenPanel>
  );
}
