'use client';

/**
 * HJVietPayDialog (SCR-PAY-HJVIETPAY-DLG)
 *
 * HJ VietPay QR payment modal with MANUAL confirmation (no auto-polling).
 * Unlike other QR dialogs, staff must press "Confirm" button to finalize payment.
 * pollingEnabled=false for this gateway.
 *
 * Legacy: IDD_HJVIETPAY_DLG (454), 414x327 DLU, 10 controls
 * Uses shared/ui/organisms/QRPaymentModal with gateway="hjvietpay", pollingEnabled=false
 */

import { useState, useEffect, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import Spinner from '@shared/ui/atoms/Spinner';

// --- Types ---

interface HJVietPayDialogProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  tableCode: string;
}

type QRPaymentStatus = 'IDLE' | 'GENERATING' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// --- Component ---

export default function HJVietPayDialog({
  open,
  onClose,
  amount,
  tableCode,
}: HJVietPayDialogProps) {
  const [status, setStatus] = useState<QRPaymentStatus>('IDLE');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (open && status === 'IDLE') handleGenerateQR();
    if (!open) {
      setStatus('IDLE');
      setQrImageUrl(null);
      setTransactionId(null);
      setErrorCode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // NOTE: No auto-polling for HJVietPay -- manual confirmation only

  const handleGenerateQR = useCallback(() => {
    setStatus('GENERATING');
    // TODO: paymentApi.generateQR mutation
    //       Bridge PAYMENT:QR:GENERATE { gateway: "hjvietpay", amount, tableCode, idempotencyKey }
    //       -> ExecuteQRPaymentUseCase -> ExternalBridge/HJVietPay
    //       On success: setStatus('PENDING'), setQrImageUrl(...), setTransactionId(...)
  }, []);

  const handleManualConfirm = () => {
    setStatus('CONFIRMED');
    // TODO: paymentApi.confirmQR mutation (HJVietPay-specific manual confirm)
    //       Bridge PAYMENT:QR:CONFIRM { gateway: "hjvietpay", transactionId, idempotencyKey }
    //       -> ExecuteQRPaymentUseCase (confirm path)
    //       -> ExternalBridge/HJVietPay verify API -> DB save -> Ledger SUCCEEDED
    //       On success: setStatus('COMPLETED')
    //       On failure: setStatus('FAILED'), setErrorCode(...)
    //
    //       WARNING (from design doc): manual confirm without server-side verification
    //       risks confirming un-approved transactions. TODO: reconciliation plan needed.
  };

  const handleCancel = () => {
    // TODO: paymentApi.cancelQR mutation
    //       Bridge PAYMENT:QR:CANCEL { gateway: "hjvietpay", transactionId }
    //       -> CancelQRPaymentUseCase -> Ledger COMPENSATED
    setStatus('CANCELLED');
    onClose();
  };

  const handleCloseWait = () => {
    // TODO: cancel + close
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} title="HJ VietPay QR" size="md">
      <div className="flex flex-col items-center p-6 gap-4">
        {/* QR Code area */}
        <div className="w-48 h-48 border-2 border-pos-border rounded-lg flex items-center justify-center bg-white">
          {status === 'GENERATING' && <Spinner />}
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="HJ VietPay QR" className="w-full h-full object-contain" />
          ) : status !== 'GENERATING' ? (
            <span className="text-pos-text-secondary text-sm">QR Code</span>
          ) : null}
        </div>

        <div className="text-xl font-bold">{amount.toLocaleString()} VND</div>

        <div className="text-sm text-center">
          {status === 'IDLE' && 'Initializing...'}
          {status === 'GENERATING' && 'Generating QR code...'}
          {status === 'PENDING' && 'QR displayed. Press "Confirm" after customer payment.'}
          {status === 'CONFIRMED' && 'Confirming payment...'}
          {status === 'COMPLETED' && 'Payment completed!'}
          {status === 'FAILED' && `Payment failed: ${errorCode ?? 'unknown'}`}
          {status === 'CANCELLED' && 'Payment cancelled.'}
        </div>

        {/* Action buttons -- HJVietPay layout: [Close] [Close & Wait] [Confirm] */}
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={handleCancel}
            disabled={status === 'COMPLETED' || status === 'CONFIRMED'}
          >
            {/* i18n: payment.qr.close */}
            Close
          </Button>
          <Button
            onClick={handleCloseWait}
            disabled={status === 'COMPLETED' || status === 'CONFIRMED'}
          >
            {/* i18n: payment.qr.closeWait */}
            Close & Wait
          </Button>
          <Button
            onClick={handleManualConfirm}
            disabled={status !== 'PENDING'}
          >
            {/* i18n: payment.qr.confirmPayment */}
            Confirm Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
