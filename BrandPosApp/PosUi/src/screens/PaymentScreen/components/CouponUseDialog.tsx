'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ────────────────────────────────────────────

interface CouponItem {
  id: string;
  code: string;
  name: string;
  discountAmount: number;
  expiryDate: string;
}

interface CouponUseDialogProps {
  open: boolean;
  onClose: () => void;
  onApply?: (couponId: string) => void;
}

// ─── Stub data ────────────────────────────────────────

const STUB_COUPONS: CouponItem[] = [
  { id: 'c1', code: 'CPN-10000', name: '1만원 할인쿠폰', discountAmount: 10000, expiryDate: '2026-12-31' },
  { id: 'c2', code: 'CPN-5000', name: '5천원 할인쿠폰', discountAmount: 5000, expiryDate: '2026-06-30' },
  { id: 'c3', code: 'CPN-20000', name: '2만원 할인쿠폰', discountAmount: 20000, expiryDate: '2026-09-30' },
];

// ─── Component ────────────────────────────────────────

export default function CouponUseDialog({ open, onClose, onApply }: CouponUseDialogProps) {
  const [couponCode, setCouponCode] = useState('');
  const [coupons] = useState<CouponItem[]>(STUB_COUPONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearch = useCallback(() => {
    // TODO: COUPON:SEARCH bridge call
    // Payload: { code: couponCode }
  }, [couponCode]);

  const handleApply = useCallback(() => {
    if (!selectedId) return;
    // TODO: COUPON:USE bridge call with idempotencyKey
    // Payload: { couponId: selectedId }
    onApply?.(selectedId);
    onClose();
  }, [selectedId, onApply, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="쿠폰 사용"
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>취소</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={!selectedId}
          >
            적용
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <TextInput
              value={couponCode}
              onChange={setCouponCode}
              placeholder="쿠폰 코드를 입력하세요"
              fullWidth
            />
          </div>
          <Button variant="secondary" size="sm" onClick={handleSearch}>검색</Button>
        </div>

        {/* Coupon list */}
        <div className="border border-pos-border rounded-pos-lg overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_80px_90px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted">
            <span>코드</span>
            <span>쿠폰명</span>
            <span className="text-right">할인금액</span>
            <span className="text-center">유효기한</span>
          </div>
          <div className="max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {coupons.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-xs text-pos-text-muted">
                사용 가능한 쿠폰이 없습니다
              </div>
            ) : (
              coupons.map((coupon) => (
                <button
                  key={coupon.id}
                  type="button"
                  onClick={() => setSelectedId(coupon.id)}
                  className={`w-full grid grid-cols-[120px_1fr_80px_90px] gap-2 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                    selectedId === coupon.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  <span className="font-mono tabular-nums">{coupon.code}</span>
                  <span className="truncate">{coupon.name}</span>
                  <span className="text-right tabular-nums">{coupon.discountAmount.toLocaleString()}원</span>
                  <span className="text-center tabular-nums">{coupon.expiryDate}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
