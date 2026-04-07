'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';

/**
 * ContentViewDialog -- 고객 대면 디스플레이 화면
 * (레거시 IDD_CONTENTVIEW full / IDD_CONTENTVIEW2 compact)
 *
 * 결제 시 고객에게 주문 내역, 금액, QR 결제 코드를 보여주며,
 * 대기 시 광고/홍보 콘텐츠를 표시.
 * 단일 컴포넌트, `size` prop으로 full/compact 분기.
 *
 * PosRealTime Events: CONTENT:UPDATE, CONTENT:MEDIA_CHANGE (C++ -> UI)
 * Bridge Commands: SYSTEM:GET_CONTENT
 */

// ─── Types ───

type ContentSize = 'full' | 'compact';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface ContentData {
  storeName: string;
  custName: string;
  orderItems: OrderItem[];
  totalAmt: number;
  dcAmt: number;
  payableAmt: number;
  receivedAmt: number;
  changeAmt: number;
  mediaUrl: string;
  qrData: string | null;
  qrTitle: string | null;
  qrAmount: number | null;
  custInfo: {
    name: string;
    lastVisit: string;
    point: number;
  } | null;
}

interface ContentViewDialogProps {
  open: boolean;
  size?: ContentSize;
  onClose: () => void;
  onConfirm?: () => void;
}

// ─── Stub Data ───

const STUB_CONTENT: ContentData = {
  storeName: 'Hyojung Restaurant',
  custName: '홍길동',
  orderItems: [
    { name: '짜장면', qty: 2, price: 14000 },
    { name: '짬뽕', qty: 1, price: 9000 },
    { name: '탕수육(소)', qty: 1, price: 18000 },
  ],
  totalAmt: 41000,
  dcAmt: 0,
  payableAmt: 41000,
  receivedAmt: 50000,
  changeAmt: 9000,
  mediaUrl: '',
  qrData: null,
  qrTitle: null,
  qrAmount: null,
  custInfo: {
    name: '홍길동',
    lastVisit: '2026-04-01',
    point: 1500,
  },
};

// ─── Component ───

export default function ContentViewDialog({
  open,
  size = 'full',
  onClose,
  onConfirm,
}: ContentViewDialogProps) {
  const [content] = useState<ContentData>(STUB_CONTENT);
  // TODO: Subscribe to PosRealTimeReceiver for CONTENT:UPDATE, CONTENT:MEDIA_CHANGE events
  // TODO: Use systemApi.getConfig for storeName

  const handleConfirm = useCallback(() => {
    // TODO: customer confirmation callback
    console.log('[ContentViewDialog] customer confirm');
    onConfirm?.();
  }, [onConfirm]);

  const handleFileOpen = useCallback(() => {
    // TODO: P2 - SYSTEM:GET_CONTENT for file open (hidden feature)
    console.log('[ContentViewDialog] file open');
  }, []);

  const handleQrCancel = useCallback(() => {
    // TODO: P1 - QR payment cancel callback
    console.log('[ContentViewDialog] QR cancel');
  }, []);

  const handleQrConfirm = useCallback(() => {
    // TODO: P1 - QR payment confirm callback
    console.log('[ContentViewDialog] QR confirm');
  }, []);

  if (!open) return null;

  const fmt = (n: number) => n.toLocaleString();
  const isFull = size === 'full';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: 'var(--opacity-overlay)' }}
        onClick={onClose}
      />

      {/* Content Panel */}
      <div
        className={`relative bg-pos-bg rounded-pos-2xl shadow-pos-modal flex flex-col overflow-hidden
          ${isFull ? 'w-[525px] h-[383px]' : 'w-[414px] h-[327px]'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-pos-border">
          <span className="text-sm font-bold text-pos-text">{content.storeName}</span>
          <span className="text-sm text-pos-text-muted">{content.custName}</span>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Media Area */}
          <div className={`${isFull ? 'w-1/2' : 'w-2/5'} border-r border-pos-border flex items-center justify-center bg-pos-surface p-2`}>
            {content.qrData ? (
              <div className="flex flex-col items-center gap-2">
                {/* QR Code placeholder */}
                <div className="w-32 h-32 bg-white border border-pos-border rounded-pos-sm flex items-center justify-center">
                  <span className="text-xs text-pos-text-muted">QR Code</span>
                </div>
                {content.qrTitle && (
                  <span className="text-xs font-semibold text-pos-text">{content.qrTitle}</span>
                )}
                {content.qrAmount !== null && (
                  <span className="text-sm font-bold text-primary-500">{fmt(content.qrAmount)}</span>
                )}
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={handleQrCancel}>취소</Button>
                  <Button variant="primary" size="sm" onClick={handleQrConfirm}>확인</Button>
                </div>
              </div>
            ) : content.mediaUrl ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* TODO: render image/video */}
                <span className="text-xs text-pos-text-muted">Media: {content.mediaUrl}</span>
              </div>
            ) : (
              <span className="text-xs text-pos-text-muted">광고/콘텐츠 영역</span>
            )}
          </div>

          {/* Order Grid + Amounts */}
          <div className={`${isFull ? 'w-1/2' : 'w-3/5'} flex flex-col`}>
            {/* Order Items */}
            <div className="flex-1 overflow-y-auto border-b border-pos-border" style={{ scrollbarWidth: 'thin' }}>
              <div className="grid grid-cols-[1fr_40px_60px] bg-pos-surface border-b border-pos-border px-2 py-1">
                <span className="text-xs font-semibold text-pos-text-muted">항목</span>
                <span className="text-xs font-semibold text-pos-text-muted text-center">수량</span>
                <span className="text-xs font-semibold text-pos-text-muted text-right">금액</span>
              </div>
              {content.orderItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_40px_60px] px-2 py-1 border-b border-pos-border">
                  <span className="text-sm text-pos-text">{item.name}</span>
                  <span className="text-sm text-pos-text text-center tabular-nums">{item.qty}</span>
                  <span className="text-sm text-pos-text text-right tabular-nums">{fmt(item.price)}</span>
                </div>
              ))}
            </div>

            {/* Amounts */}
            <div className="px-3 py-2 flex flex-col gap-1 text-sm">
              {isFull ? (
                <div className="grid grid-cols-5 gap-1">
                  <AmountCell label="총금액" value={fmt(content.totalAmt)} />
                  <AmountCell label="할인" value={fmt(content.dcAmt)} />
                  <AmountCell label="받을금액" value={fmt(content.payableAmt)} bold />
                  <AmountCell label="받은금액" value={fmt(content.receivedAmt)} />
                  <AmountCell label="거스름" value={fmt(content.changeAmt)} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1">
                    <AmountCell label="총금액" value={fmt(content.totalAmt)} />
                    <AmountCell label="할인" value={fmt(content.dcAmt)} />
                    <AmountCell label="받을금액" value={fmt(content.payableAmt)} bold />
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <AmountCell label="받은금액" value={fmt(content.receivedAmt)} />
                    <AmountCell label="거스름" value={fmt(content.changeAmt)} />
                  </div>
                </>
              )}
            </div>

            {/* Customer Info (conditional) */}
            {content.custInfo && (
              <div className="px-3 py-1 border-t border-pos-border text-xs text-pos-text-muted flex items-center gap-3">
                <span>{content.custInfo.name}</span>
                <span>방문: {content.custInfo.lastVisit}</span>
                <span>포인트: {fmt(content.custInfo.point)}</span>
              </div>
            )}

            {/* Confirm Button */}
            <div className="px-3 py-2 border-t border-pos-border">
              <Button variant="primary" size="md" onClick={handleConfirm} className="w-full">
                고객확인
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Internal ───

function AmountCell({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-pos-text-muted">{label}</span>
      <span className={`tabular-nums ${bold ? 'font-bold text-primary-500' : 'text-pos-text'}`}>{value}</span>
    </div>
  );
}
