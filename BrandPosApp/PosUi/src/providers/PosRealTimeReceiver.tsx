'use client';

/**
 * PosRealTimeReceiver — C++ → UI 단방향 이벤트 수신 Provider
 *
 * [개선 1] 자기가 보낸 요청의 응답 이벤트는 무시한다.
 *   C++가 이벤트를 보낼 때 requestId를 포함하므로,
 *   PosRequestSender.isPendingRequest()로 확인하여
 *   "내가 방금 보낸 mutation의 결과 이벤트"는 건너뛴다.
 *   → mutation의 optimistic update와 중복 refetch를 완전히 제거.
 *
 * [개선 2] 세분화된 태그 무효화.
 *   TABLE_REFRESH 시 ['Table:{id}', 'Floor:{floorId}']만 무효화한다.
 *   전체 목록('TableList')은 건드리지 않는다.
 */

import { useEffect } from 'react';
import { posApi } from '@store/api/posApi';
import { setProcessing, pushDeviceError, addToast } from '@store/slices/uiSlice';
import { useAppDispatch } from '@store/index';
import type { AppDispatch } from '@store/index';
import { isPendingRequest } from '@bridge/PosRequestSender';

interface EventPayload {
  type?: string;
  device?: string;
  code?: string;
  msgKey?: string;
  msgParams?: Record<string, string>;
  severity?: string;
  recoverable?: boolean;
  retryable?: boolean;
  action?: string;
  orderId?: string;
  tableId?: number;
  floorId?: number;
  [key: string]: unknown;
}

interface NativeEventDetail {
  v: number;
  requestId?: string;
  type: string;
  payload?: EventPayload;
}

interface HandlerArgs {
  dispatch: AppDispatch;
  payload?: EventPayload;
  requestId?: string;
}

const eventHandlers: Record<string, (args: HandlerArgs) => void> = {
  /**
   * TABLE_REFRESH — 세분화된 무효화:
   * payload.tableId가 있으면 해당 테이블만, floorId가 있으면 해당 층만 무효화.
   * 둘 다 없으면 TableList 전체 무효화 (fallback).
   */
  TABLE_REFRESH: ({ dispatch, payload }) => {
    const tags: Array<{ type: 'Table' | 'Floor'; id: number } | 'TableList'> = [];

    if (payload?.tableId) {
      tags.push({ type: 'Table' as const, id: payload.tableId });
    }
    if (payload?.floorId) {
      tags.push({ type: 'Floor' as const, id: payload.floorId });
    }

    // 구체적 태그가 하나도 없으면 전체 목록 갱신 (fallback)
    if (tags.length === 0) {
      tags.push('TableList' as const);
    }

    dispatch(posApi.util.invalidateTags(tags));
  },

  ORDER_NEW: ({ dispatch, payload }) => {
    dispatch(posApi.util.invalidateTags(['Order']));
    // 테이블 상태도 바뀔 수 있으므로 해당 테이블만 무효화
    if (payload?.tableId) {
      dispatch(posApi.util.invalidateTags([{ type: 'Table', id: payload.tableId }]));
    }
    dispatch(addToast({ type: 'info', message: `새 주문: ${payload?.orderId || ''}` }));
  },

  ORDER_UPDATED: ({ dispatch }) => {
    dispatch(posApi.util.invalidateTags(['Order']));
  },

  PAYMENT_COMPLETE: ({ dispatch, payload }) => {
    dispatch(posApi.util.invalidateTags(['Payment', 'Order']));
    if (payload?.tableId) {
      dispatch(posApi.util.invalidateTags([{ type: 'Table', id: payload.tableId }]));
    }
    dispatch(setProcessing({ active: false }));
  },

  SYNC_STATUS_CHANGED: ({ dispatch }) => {
    dispatch(posApi.util.invalidateTags(['Sync']));
  },

  DEVICE_ERROR: ({ dispatch, payload }) => {
    if (!payload) return;
    dispatch(
      pushDeviceError({
        type: payload.type || '',
        device: payload.device || '',
        code: payload.code || '',
        msgKey: payload.msgKey || '',
        msgParams: payload.msgParams,
        severity: payload.severity || '',
        recoverable: payload.recoverable || false,
        retryable: payload.retryable || false,
        action: payload.action || '',
      }),
    );
  },
};

export default function PosRealTimeReceiver({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function handleNativeEvent(e: Event) {
      const detail = (e as CustomEvent).detail as NativeEventDetail | undefined;
      if (!detail || !detail.type) {
        console.warn('[PosRealTimeReceiver] Invalid event:', detail);
        return;
      }

      /**
       * [핵심 개선] 자기가 보낸 요청의 응답 이벤트는 무시한다.
       * 예: TABLE:SELECT mutation → C++ 처리 → TABLE_REFRESH 이벤트 발송
       * mutation의 onQueryStarted에서 이미 캐시를 직접 업데이트했으므로,
       * 같은 requestId로 돌아온 이벤트를 다시 처리하면 중복 refetch가 된다.
       */
      if (detail.requestId && isPendingRequest(detail.requestId)) {
        return; // 내가 보낸 요청의 결과 → skip
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
