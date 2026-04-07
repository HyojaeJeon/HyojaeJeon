'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ────────────────────────────────────────────

type GiftStatus = 'ACTIVE' | 'USED' | 'VOIDED' | 'EXPIRED';

interface GiftCertificate {
  id: string;
  code: string;
  name: string;
  amount: number;
  status: GiftStatus;
}

interface GiftManageDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub data ────────────────────────────────────────

const STATUS_LABELS: Record<GiftStatus, string> = {
  ACTIVE: '사용가능',
  USED: '사용완료',
  VOIDED: '무효',
  EXPIRED: '만료',
};

const STATUS_COLORS: Record<GiftStatus, string> = {
  ACTIVE: 'text-pos-success',
  USED: 'text-pos-text-muted',
  VOIDED: 'text-pos-error',
  EXPIRED: 'text-pos-text-muted',
};

const STUB_GIFTS: GiftCertificate[] = [
  { id: 'g1', code: 'GFT-2026-0001', name: '5만원 상품권', amount: 50000, status: 'ACTIVE' },
  { id: 'g2', code: 'GFT-2026-0002', name: '3만원 상품권', amount: 30000, status: 'USED' },
  { id: 'g3', code: 'GFT-2026-0003', name: '10만원 상품권', amount: 100000, status: 'ACTIVE' },
  { id: 'g4', code: 'GFT-2026-0004', name: '1만원 상품권', amount: 10000, status: 'VOIDED' },
  { id: 'g5', code: 'GFT-2026-0005', name: '5만원 상품권', amount: 50000, status: 'EXPIRED' },
];

// ─── Component ────────────────────────────────────────

export default function GiftManageDialog({ open, onClose }: GiftManageDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifts] = useState<GiftCertificate[]>(STUB_GIFTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredGifts = searchQuery
    ? gifts.filter(
        (g) =>
          g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : gifts;

  const handleIssue = useCallback(() => {
    // TODO: GIFT:ISSUE bridge call -> open GiftRegisterDialog
  }, []);

  const handleVoid = useCallback(() => {
    if (!selectedId) return;
    // TODO: GIFT:VOID bridge call with idempotencyKey
    // Payload: { giftId: selectedId }
  }, [selectedId]);

  const handleSearch = useCallback(() => {
    // TODO: GIFT:SEARCH bridge call
    // Payload: { query: searchQuery }
  }, [searchQuery]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="상품권 관리"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
      }
    >
      <div className="flex flex-col h-full">
        {/* ─── Action bar ─── */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="flex-1 max-w-xs">
            <TextInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="상품권 코드/이름 검색..."
              fullWidth
            />
          </div>
          <Button variant="secondary" size="sm" onClick={handleSearch}>검색</Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleIssue}>발행</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleVoid}
              disabled={!selectedId}
            >
              무효처리
            </Button>
          </div>
        </div>

        {/* ─── Grid ─── */}
        <div className="flex-1 min-h-0 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden mt-3">
          {/* Header */}
          <div className="grid grid-cols-[140px_1fr_100px_80px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            <span>코드</span>
            <span>이름</span>
            <span className="text-right">금액</span>
            <span className="text-center">상태</span>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {filteredGifts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                상품권이 없습니다
              </div>
            ) : (
              filteredGifts.map((gift) => (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => setSelectedId(gift.id)}
                  className={`w-full grid grid-cols-[140px_1fr_100px_80px] gap-2 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                    selectedId === gift.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  <span className="font-mono tabular-nums">{gift.code}</span>
                  <span className="truncate">{gift.name}</span>
                  <span className="text-right tabular-nums">{gift.amount.toLocaleString()}원</span>
                  <span className={`text-center font-semibold ${STATUS_COLORS[gift.status]}`}>
                    {STATUS_LABELS[gift.status]}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
