'use client';

import { useState, useEffect, useCallback } from 'react';

// -------------------------------------------------------------------
// AsyncPaymentNotification -- 비동기 결제 완료 알림 (async-paynoti-dlg.md)
//
// QR 결제 등 비동기 결제 완료 시 PosRealTimeSender 이벤트를 수신하여 표시.
// 레거시: Owner Draw 방식 소형 팝업 (345x47 DLU, UI 요소 0개)
// 신규: React 토스트/알림 컴포넌트로 대체.
//
// 데이터 흐름: DB 저장 완료 후 후처리 UI 피드백 ("DB 먼저, UI 다음")
// PosRequest 미사용, PosRealTime(C++ -> UI) 채널로만 동작.
// Outbox 대상 아님.
// -------------------------------------------------------------------

interface AsyncPaymentEvent {
  requestId: string;
  transactionId: string;
  sellSlipId: string;
  amount: number;
  gateway: string;
  status: 'COMPLETED' | 'FAILED' | 'EXPIRED';
}

interface AsyncPaymentNotificationProps {
  /** Auto-dismiss timeout in ms. Default 5000ms. */
  dismissTimeout?: number;
}

export default function AsyncPaymentNotification({
  dismissTimeout = 5000,
}: AsyncPaymentNotificationProps) {
  const [notifications, setNotifications] = useState<AsyncPaymentEvent[]>([]);

  // TODO: Subscribe to PosRealTimeReceiver events
  // Events: PAYMENT:QR:COMPLETED, PAYMENT:QR:STATUS_CHANGED
  // Check isPendingRequest(requestId) to ignore self-request responses
  useEffect(() => {
    // TODO: replace with actual PosRealTimeReceiver subscription
    // Example:
    // const unsubscribe = posRealTimeReceiver.on('PAYMENT:QR:COMPLETED', (event) => {
    //   if (isPendingRequest(event.requestId)) return; // ignore self
    //   setNotifications(prev => [...prev, event]);
    //   // TODO: RTK Query cache update via updateQueryData
    // });
    // return () => unsubscribe();
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (notifications.length === 0) return;

    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, dismissTimeout);

    return () => clearTimeout(timer);
  }, [notifications, dismissTimeout]);

  const handleDismiss = useCallback((requestId: string) => {
    setNotifications((prev) => prev.filter((n) => n.requestId !== requestId));
  }, []);

  const fmt = (v: number) => v.toLocaleString('ko-KR');

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2" style={{ zIndex: 'var(--z-toast)' }}>
      {notifications.map((notification) => (
        <div
          key={notification.requestId}
          className={`
            flex items-center gap-3 px-4 py-3
            rounded-pos-card shadow-pos-modal
            animate-pos-slide-up
            ${notification.status === 'COMPLETED'
              ? 'bg-green-50 border border-green-300'
              : notification.status === 'FAILED'
              ? 'bg-red-50 border border-red-300'
              : 'bg-yellow-50 border border-yellow-300'}
          `}
        >
          {/* Status icon */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0
            ${notification.status === 'COMPLETED' ? 'bg-green-500' : notification.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'}
          `}>
            <span className="text-white text-sm font-bold">
              {notification.status === 'COMPLETED' ? 'V' : notification.status === 'FAILED' ? 'X' : '!'}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-pos-text">
              {/* TODO: replace with i18n key payment.notification.* */}
              {notification.status === 'COMPLETED'
                ? '결제 완료'
                : notification.status === 'FAILED'
                ? '결제 실패'
                : '결제 만료'}
            </span>
            <span className="text-xs text-pos-text-secondary">
              {notification.gateway} | {fmt(notification.amount)}원
            </span>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => handleDismiss(notification.requestId)}
            className="ml-2 w-6 h-6 flex items-center justify-center rounded-full text-pos-text-muted active:bg-gray-200 cursor-pointer shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
