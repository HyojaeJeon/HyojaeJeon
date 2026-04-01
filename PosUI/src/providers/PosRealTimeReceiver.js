'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { posApi } from '@store/api/posApi';
import { setProcessing, pushDeviceError, addToast } from '@store/slices/uiSlice';

/**
 * PosRealTimeReceiver — C++ → UI 실시간 이벤트 수신 단일 창구
 *
 * C++ PosRealTimeSender가 ExecuteJavaScript로 발송한 POS_NATIVE_EVENT를 수신하여
 * RTK Query 캐시 무효화와 UI slice 갱신을 수행한다.
 *
 * 이벤트 규격: { v, requestId, timestamp, type, payload }
 */

const eventHandlers = {
  TABLE_REFRESH: ({ dispatch }) => {
    dispatch(posApi.util.invalidateTags(['Table']));
  },

  ORDER_NEW: ({ dispatch, payload }) => {
    dispatch(posApi.util.invalidateTags(['Order', 'Table']));
    dispatch(addToast({ type: 'info', message: `새 주문: ${payload?.orderId || ''}` }));
  },

  ORDER_UPDATED: ({ dispatch }) => {
    dispatch(posApi.util.invalidateTags(['Order']));
  },

  PAYMENT_COMPLETE: ({ dispatch }) => {
    dispatch(posApi.util.invalidateTags(['Payment', 'Order', 'Table']));
    dispatch(setProcessing({ active: false }));
  },

  SYNC_STATUS_CHANGED: ({ dispatch }) => {
    dispatch(posApi.util.invalidateTags(['Sync']));
  },

  DEVICE_ERROR: ({ dispatch, payload }) => {
    dispatch(pushDeviceError({
      type: payload.type,
      device: payload.device,
      code: payload.code,
      msgKey: payload.msgKey,
      msgParams: payload.msgParams,
      severity: payload.severity,
      recoverable: payload.recoverable,
      retryable: payload.retryable,
      action: payload.action,
    }));
  },
};

export default function PosRealTimeReceiver({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    function handleNativeEvent(e) {
      const detail = e.detail;
      if (!detail || !detail.type) {
        console.warn('[PosRealTimeReceiver] Invalid event:', detail);
        return;
      }

      const handler = eventHandlers[detail.type];
      if (handler) {
        handler({ dispatch, payload: detail.payload, requestId: detail.requestId });
      } else {
        console.warn(`[PosRealTimeReceiver] Unhandled event type: ${detail.type}`);
      }
    }

    window.addEventListener('POS_NATIVE_EVENT', handleNativeEvent);
    return () => window.removeEventListener('POS_NATIVE_EVENT', handleNativeEvent);
  }, [dispatch]);

  return children;
}
