'use client';

import { useEffect, useRef, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';

/**
 * CallerIdDialog -- 발신자표시(CID) 팝업 (레거시 IDD_CID_NUMVIEW)
 *
 * POS에 연결된 CID 장치에서 전화번호 수신 시 화면 상단에 소형 팝업 표시.
 * 고객 배정, 예약 처리, 자동 닫힘 타이머(5~10초).
 *
 * PosRealTime Event: DEVICE:CID_CALL (C++ -> UI)
 * Bridge Commands: STAFF:VERIFY_PERMISSION (for assign/reserve)
 * UseCases: VerifyPermissionUseCase
 */

// ─── Types ───

interface CallerIdDialogProps {
  phoneNumber: string;
  channel: number;
  address: string;
  /** Auto-dismiss timeout in ms. Default 7000 (7s). */
  autoCloseMs?: number;
  onAssign: () => void;
  onReserve: () => void;
  onClose: () => void;
}

// ─── Component ───

export default function CallerIdDialog({
  phoneNumber,
  channel,
  address,
  autoCloseMs = 7000,
  onAssign,
  onReserve,
  onClose,
}: CallerIdDialogProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-close timer
  useEffect(() => {
    timerRef.current = setTimeout(onClose, autoCloseMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoCloseMs, onClose]);

  const handleAssign = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // TODO: STAFF:VERIFY_PERMISSION Bridge command -> VerifyPermissionUseCase
    // - params: { phoneNumber, action: 'assign', tableId: <current> }
    console.log('[CallerIdDialog] assign', { phoneNumber });
    onAssign();
  }, [phoneNumber, onAssign]);

  const handleReserve = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // TODO: STAFF:VERIFY_PERMISSION Bridge command -> VerifyPermissionUseCase
    // - params: { phoneNumber, action: 'reserve' }
    console.log('[CallerIdDialog] reserve', { phoneNumber });
    onReserve();
  }, [phoneNumber, onReserve]);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  }, [onClose]);

  return (
    <div
      className="fixed top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-pos-bg border border-pos-border rounded-pos-card shadow-pos-modal px-4 py-2"
      style={{ zIndex: 'var(--z-toast)' }}
    >
      {/* Channel indicator */}
      <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-pos-sm">
        CH{channel}
      </span>

      {/* Phone number */}
      <span className="text-md font-semibold text-pos-text tabular-nums">
        {phoneNumber}
      </span>

      {/* Address */}
      <span className="text-sm text-pos-text-muted truncate max-w-[200px]">
        {address}
      </span>

      {/* Action buttons */}
      <Button variant="primary" size="sm" onClick={handleAssign}>배정</Button>
      <Button variant="outline" size="sm" onClick={handleReserve}>예약</Button>
      <Button variant="ghost" size="sm" onClick={handleClose}>닫기</Button>
    </div>
  );
}
