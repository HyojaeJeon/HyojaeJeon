'use client';

/**
 * ZaloPayQRDialog (SCR-PAY-ZALOPAY-QR)
 *
 * ZaloPay QR payment modal. Synchronous-wait pattern.
 * QR generation -> auto-polling -> confirm on success -> DB save.
 * Online required. NOT Outbox target.
 *
 * Legacy: IDD_ZALOPAY_QR (441), 414x327 DLU, 11 controls
 * Uses shared/ui/organisms/QRPaymentModal with gateway="zalopay"
 */

import { useState, useEffect, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import Spinner from '@shared/ui/atoms/Spinner';

// --- Types ---

interface ZaloPayQRDialogProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  tableCode: string;
}

type QRPaymentStatus = 'IDLE' | 'GENERATING' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

interface QRPaymentState {
  status: QRPaymentStatus;
  qrImageUrl: string | null;
  transactionId: string | null;
  expiresAt: string | null;
  errorCode: string | null;
}

const POLLING_INTERVAL_MS = 3000;
const POLLING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// --- Component ---

export default function ZaloPayQRDialog({
  open,
  onClose,
  amount,
  tableCode,
}: ZaloPayQRDialogProps) {
  const [state, setState] = useState<QRPaymentState>({
    status: 'IDLE',
    qrImageUrl: null,
    transactionId: null,
    expiresAt: null,
    errorCode: null,
  });

  // --- Auto-generate QR on open ---
  useEffect(() => {
    if (open && state.status === 'IDLE') {
      handleGenerateQR();
    }
    if (!open) {
      setState({
        status: 'IDLE',
        qrImageUrl: null,
        transactionId: null,
        expiresAt: null,
        errorCode: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // --- Auto-polling ---
  useEffect(() => {
    if (state.status !== 'PENDING' || !state.transactionId) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
        setState((prev) => ({ ...prev, status: 'EXPIRED', errorCode: 'PAYMENT_TIMEOUT' }));
        clearInterval(interval);
        return;
      }
      handleCheckStatus();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.transactionId]);

  // --- Handlers (stubs) ---

  const handleGenerateQR = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'GENERATING' }));
    // TODO: paymentApi.generateQR mutation
    //       Bridge PAYMENT:QR:GENERATE { gateway: "zalopay", amount, tableCode, idempotencyKey }
    //       -> ExecuteQRPaymentUseCase -> offline check -> Ledger RECEIVED -> ExternalBridge/ZaloPay
    //       On success: setState({ status: 'PENDING', qrImageUrl, transactionId, expiresAt })
    //       On error (OFFLINE_BLOCKED, GATEWAY_UNAVAILABLE): setState({ status: 'FAILED', errorCode })
  }, []);

  const handleCheckStatus = useCallback(() => {
    // TODO: paymentApi.checkQRStatus polling
    //       Bridge PAYMENT:QR:CHECK_STATUS { gateway: "zalopay", transactionId }
    //       -> CheckQRPaymentStatusUseCase
    //       On SUCCEEDED: DB save -> Ledger SUCCEEDED -> PosRealTimeSender -> setState COMPLETED
    //       On FAILED: Ledger FAILED -> setState FAILED
  }, []);

  const handleCancel = () => {
    // TODO: paymentApi.cancelQR mutation
    //       Bridge PAYMENT:QR:CANCEL { gateway: "zalopay", transactionId }
    //       -> CancelQRPaymentUseCase -> Ledger COMPENSATED
    setState((prev) => ({ ...prev, status: 'CANCELLED' }));
    onClose();
  };

  const handleManualCheck = () => {
    handleCheckStatus();
  };

  const handlePrint = () => {
    // TODO: Bridge DEVICE:PRINT -> async print QR code
  };

  const handleCloseWait = () => {
    // TODO: Bridge PAYMENT:QR:CANCEL -> CancelQRPaymentUseCase
    //       Then close modal
    onClose();
  };

  // --- Render ---

  return (
    <Modal open={open} onClose={handleCancel} title="ZaloPay QR" size="md">
      <div className="flex flex-col items-center p-6 gap-4">
        {/* QR Code area */}
        <div className="w-48 h-48 border-2 border-pos-border rounded-lg flex items-center justify-center bg-white">
          {state.status === 'GENERATING' && <Spinner />}
          {state.qrImageUrl ? (
            <img src={state.qrImageUrl} alt="ZaloPay QR" className="w-full h-full object-contain" />
          ) : state.status !== 'GENERATING' ? (
            <span className="text-pos-text-secondary text-sm">QR Code</span>
          ) : null}
        </div>

        {/* Amount display */}
        <div className="text-xl font-bold">
          {amount.toLocaleString()} VND
        </div>

        {/* Status text */}
        <div className="text-sm text-center">
          {state.status === 'IDLE' && 'Initializing...'}
          {state.status === 'GENERATING' && 'Generating QR code...'}
          {state.status === 'PENDING' && 'Waiting for payment...'}
          {state.status === 'COMPLETED' && 'Payment completed!'}
          {state.status === 'FAILED' && `Payment failed: ${state.errorCode ?? 'unknown'}`}
          {state.status === 'EXPIRED' && 'QR code expired. Please try again.'}
          {state.status === 'CANCELLED' && 'Payment cancelled.'}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={handleCancel}
            disabled={state.status === 'COMPLETED'}
          >
            {/* i18n: payment.qr.cancel */}
            Cancel QR
          </Button>
          <Button
            onClick={handleManualCheck}
            disabled={state.status !== 'PENDING'}
          >
            {/* i18n: payment.qr.checkStatus */}
            Check Payment
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!state.qrImageUrl}
          >
            {/* i18n: payment.qr.print */}
            Print QR
          </Button>
          <Button onClick={handleCloseWait}>
            {/* i18n: payment.qr.closeWait */}
            Close & Wait
          </Button>
        </div>
      </div>
    </Modal>
  );
}
