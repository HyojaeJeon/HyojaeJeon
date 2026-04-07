'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import TextInput from '@shared/ui/atoms/TextInput';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Button from '@shared/ui/atoms/Button';

/**
 * DeliveryPrintDialog -- 배달 전표 일괄 인쇄 모달 (레거시 IDD_CUSTDELI_PRN)
 *
 * 주소 필터 + 미인쇄건 필터로 대상 조회, 체크박스 선택 후 일괄 인쇄.
 *
 * Bridge Commands: DELIVERY:PRINT_SLIP (printType: BATCH)
 * UseCases: SearchDeliveryAddressUseCase, PrintDeliverySlipUseCase
 */

// ─── Types ───

interface DeliverySlip {
  deliveryId: string;
  orderId: string;
  custName: string;
  address: string;
  totalAmt: number;
  isPrinted: boolean;
}

interface DeliveryPrintDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub Data ───

const STUB_SLIPS: DeliverySlip[] = [
  { deliveryId: 'DL001', orderId: 'D001', custName: '홍길동', address: '강남구 테헤란로 123', totalAmt: 41000, isPrinted: false },
  { deliveryId: 'DL002', orderId: 'D002', custName: '김철수', address: '서초구 서초대로 67', totalAmt: 23000, isPrinted: true },
  { deliveryId: 'DL003', orderId: 'D003', custName: '이영희', address: '송파구 올림픽로 89', totalAmt: 15000, isPrinted: false },
  { deliveryId: 'DL004', orderId: 'D004', custName: '박민수', address: '강남구 역삼로 45', totalAmt: 32000, isPrinted: false },
];

// ─── Component ───

export default function DeliveryPrintDialog({
  open,
  onClose,
}: DeliveryPrintDialogProps) {
  const [searchAddr, setSearchAddr] = useState('');
  const [unprintedOnly, setUnprintedOnly] = useState(false);
  const [slips] = useState<DeliverySlip[]>(STUB_SLIPS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPrinting, setIsPrinting] = useState(false);

  // ─── Filtered Data ───

  const filteredSlips = slips.filter((s) => {
    if (searchAddr && !s.address.includes(searchAddr)) return false;
    if (unprintedOnly && s.isPrinted) return false;
    return true;
  });

  // ─── Handlers ───

  const handleSearch = useCallback(() => {
    // TODO: DELIVERY:SEARCH_ADDRESS / GET_SLIPS via RTK Query useGetDeliverySlipsQuery
    // - params: { addr: searchAddr, unprintedOnly }
    console.log('[DeliveryPrintDialog] search', { searchAddr, unprintedOnly });
  }, [searchAddr, unprintedOnly]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredSlips.map((s) => s.deliveryId);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }, [filteredSlips, selectedIds]);

  const handlePrint = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsPrinting(true);
    try {
      // TODO: DELIVERY:PRINT_SLIP Bridge command via RTK Query usePrintDeliverySlipMutation
      // - params: { deliveryIds: [...selectedIds], printType: 'BATCH' }
      // - Async post-commit: UI not blocked
      console.log('[DeliveryPrintDialog] DELIVERY:PRINT_SLIP (BATCH)', Array.from(selectedIds));
    } catch {
      // TODO: handle PRINTER_NOT_CONNECTED error
    } finally {
      setIsPrinting(false);
    }
  }, [selectedIds]);

  const handleAddressLookup = useCallback(() => {
    // TODO: Open DeliveryAddressDialog for address selection
    console.log('[DeliveryPrintDialog] open address lookup');
  }, []);

  const fmt = (n: number) => n.toLocaleString();

  // ─── Render ───

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="배달 리스트 인쇄"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handlePrint} disabled={selectedIds.size === 0 || isPrinting}>
            {isPrinting ? '인쇄중...' : '인쇄'}
          </Button>
          <Button variant="ghost" size="md" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Filter Bar */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-pos-text-muted">주소조회</span>
          <TextInput
            value={searchAddr}
            onChange={setSearchAddr}
            placeholder="주소 검색"
          />
          <Button variant="primary" size="sm" onClick={handleSearch}>조회</Button>
          <Button variant="outline" size="sm" onClick={handleAddressLookup}>주소</Button>
          <label className="flex items-center gap-1.5 cursor-pointer ml-2">
            <Checkbox checked={unprintedOnly} onChange={setUnprintedOnly} />
            <span className="text-sm text-pos-text">미인쇄건만</span>
          </label>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>전체선택/해제</Button>
        </div>

        {/* Slips Grid */}
        <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[32px_80px_100px_1fr_80px_60px] bg-pos-surface border-b border-pos-border">
            <div className="px-1 py-2" />
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">주문번호</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">고객명</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">주소</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted text-right">금액</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted text-center">인쇄</div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {filteredSlips.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-pos-text-muted">
                조회 결과가 없습니다
              </div>
            ) : (
              filteredSlips.map((slip) => (
                <div
                  key={slip.deliveryId}
                  className={`grid grid-cols-[32px_80px_100px_1fr_80px_60px] border-b border-pos-border
                    ${selectedIds.has(slip.deliveryId) ? 'bg-primary-50' : ''}
                  `}
                >
                  <div className="px-1 py-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(slip.deliveryId)}
                      onChange={() => handleToggleSelect(slip.deliveryId)}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="px-2 py-1 text-sm text-pos-text">{slip.orderId}</div>
                  <div className="px-2 py-1 text-sm text-pos-text">{slip.custName}</div>
                  <div className="px-2 py-1 text-sm text-pos-text truncate">{slip.address}</div>
                  <div className="px-2 py-1 text-sm text-pos-text text-right tabular-nums">{fmt(slip.totalAmt)}</div>
                  <div className="px-2 py-1 text-sm text-center">
                    {slip.isPrinted ? (
                      <span className="text-pos-success">O</span>
                    ) : (
                      <span className="text-pos-text-muted">-</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
