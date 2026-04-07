'use client';

/**
 * InfoplusBIDVQRDialog (SCR-PAY-INFOPLUS-BIDV-QR)
 *
 * Infoplus gateway -> BIDV bank QR payment modal.
 * Synchronous-wait with auto-polling. Online required. NOT Outbox target.
 * Shares Infoplus protocol with Shinhan/Woori via bankCode param.
 *
 * Legacy: IDD_INFOPLUS_BIDV_QR (446), 414x327 DLU, 11 controls
 * Uses shared/ui/organisms/QRPaymentModal with gateway="infoplus", bankCode="BIDV"
 */

import { useState, useEffect, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import Spinner from '@shared/ui/atoms/Spinner';

// --- Types ---

interface InfoplusBIDVQRDialogProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  tableCode: string;
}

type QRPaymentStatus = 'IDLE' | 'GENERATING' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

const GATEWAY = 'infoplus';
const BANK_CODE = 'BIDV';
const POLLING_INTERVAL_MS = 3000;
const POLLING_TIMEOUT_MS = 5 * 60 * 1000;

// --- Component ---

export default function InfoplusBIDVQRDialog({
  open,
  onClose,
  amount,
  tableCode,
}: InfoplusBIDVQRDialogProps) {
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

  useEffect(() => {
    if (status !== 'PENDING' || !transactionId) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > POLLING_TIMEOUT_MS) {
        setStatus('EXPIRED');
        setErrorCode('PAYMENT_TIMEOUT');
        clearInterval(interval);
        return;
      }
      handleCheckStatus();
    }, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, transactionId]);

  const handleGenerateQR = useCallback(() => {
    setStatus('GENERATING');
    // TODO: paymentApi.generateQR mutation
    //       Bridge PAYMENT:QR:GENERATE { gateway: "infoplus", bankCode: "BIDV", amount, tableCode, idempotencyKey }
    //       -> ExecuteQRPaymentUseCase -> ExternalBridge/Infoplus (bankCode=BIDV)
  }, []);

  const handleCheckStatus = useCallback(() => {
    // TODO: paymentApi.checkQRStatus polling
    //       Bridge PAYMENT:QR:CHECK_STATUS { gateway: "infoplus", bankCode: "BIDV", transactionId }
    //       -> CheckQRPaymentStatusUseCase
  }, []);

  const handleCancel = () => {
    // TODO: paymentApi.cancelQR mutation
    //       Bridge PAYMENT:QR:CANCEL { gateway: "infoplus", bankCode: "BIDV", transactionId }
    setStatus('CANCELLED');
    onClose();
  };

  const handlePrint = () => {
    // TODO: Bridge DEVICE:PRINT
  };

  const handleCloseWait = () => {
    // TODO: cancel + close
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} title="BIDV QR (Infoplus)" size="md">
      <div className="flex flex-col items-center p-6 gap-4">
        <div className="w-48 h-48 border-2 border-pos-border rounded-lg flex items-center justify-center bg-white">
          {status === 'GENERATING' && <Spinner />}
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="BIDV QR" className="w-full h-full object-contain" />
          ) : status !== 'GENERATING' ? (
            <span className="text-pos-text-secondary text-sm">QR Code</span>
          ) : null}
        </div>

        <div className="text-xl font-bold">{amount.toLocaleString()} VND</div>

        <div className="text-sm text-center">
          {status === 'IDLE' && 'Initializing...'}
          {status === 'GENERATING' && 'Generating QR code...'}
          {status === 'PENDING' && 'Waiting for BIDV payment...'}
          {status === 'COMPLETED' && 'Payment completed!'}
          {status === 'FAILED' && `Payment failed: ${errorCode ?? 'unknown'}`}
          {status === 'EXPIRED' && 'QR code expired.'}
          {status === 'CANCELLED' && 'Payment cancelled.'}
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          <Button onClick={handleCancel} disabled={status === 'COMPLETED'}>Cancel QR</Button>
          <Button onClick={() => handleCheckStatus()} disabled={status !== 'PENDING'}>Check Payment</Button>
          <Button onClick={handlePrint} disabled={!qrImageUrl}>Print QR</Button>
          <Button onClick={handleCloseWait}>Close & Wait</Button>
        </div>
      </div>
    </Modal>
  );
}
