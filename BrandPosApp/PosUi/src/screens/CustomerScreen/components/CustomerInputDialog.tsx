'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import TextInput from '@shared/ui/atoms/TextInput';
import Button from '@shared/ui/atoms/Button';

/**
 * CustomerInputDialog -- 고객 관리 메인 화면 (레거시 IDD_CUSTINPUT)
 *
 * 고객 목록 조회, 검색, 추가, 수정, 삭제를 수행하며,
 * 상세설정/포인트이력/상품권/킵상품 등 하위 모달을 호출하는 허브 역할.
 *
 * Bridge Commands: CUSTOMER:SEARCH, CUSTOMER:UPDATE, CUSTOMER:GET_KEEP_ITEMS
 * UseCases: SearchCustomerUseCase, RegisterCustomerUseCase, UpdateCustomerUseCase,
 *           GetCustomerDetailUseCase, GetCustomerKeepItemsUseCase, AddKeepItemUseCase
 */

// ─── Types ───

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  hphone: string;
  address: string;
  point: number;
  isEdited: boolean;
}

interface CustomerInputDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Stub Data ───

const STUB_CUSTOMERS: CustomerRow[] = [
  { id: 'C001', name: '홍길동', phone: '02-1234-5678', hphone: '010-1234-5678', address: '서울시 강남구', point: 1500, isEdited: false },
  { id: 'C002', name: '김철수', phone: '02-9876-5432', hphone: '010-9876-5432', address: '서울시 서초구', point: 3200, isEdited: false },
  { id: 'C003', name: '이영희', phone: '02-5555-1234', hphone: '010-5555-1234', address: '서울시 송파구', point: 800, isEdited: false },
];

// ─── Component ───

export default function CustomerInputDialog({
  open,
  onClose,
}: CustomerInputDialogProps) {
  const [searchPhone, setSearchPhone] = useState('');
  const [customers, setCustomers] = useState<CustomerRow[]>(STUB_CUSTOMERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddress, setShowAddress] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Sub-dialog states
  const [activeSubDialog, setActiveSubDialog] = useState<
    'detail' | 'pointHistory' | 'ticket' | 'keepItem' | null
  >(null);
  const [selectedCustomerForSub, setSelectedCustomerForSub] = useState<string | null>(null);

  // ─── Handlers ───

  const handleSearch = useCallback(async () => {
    if (!searchPhone.trim()) return;
    setIsSearching(true);
    try {
      // TODO: CUSTOMER:SEARCH Bridge command via RTK Query useSearchCustomersQuery
      console.log('[CustomerInputDialog] CUSTOMER:SEARCH', { keyword: searchPhone });
      const filtered = STUB_CUSTOMERS.filter(
        (c) => c.phone.includes(searchPhone) || c.hphone.includes(searchPhone)
      );
      setCustomers(filtered);
    } catch {
      // TODO: handle error
    } finally {
      setIsSearching(false);
    }
  }, [searchPhone]);

  const handleAdd = useCallback(() => {
    // TODO: Open CustomerRegistrationDialog
    console.log('[CustomerInputDialog] open CustomerRegistrationDialog');
  }, []);

  const handleSave = useCallback(async () => {
    const editedCustomers = customers.filter((c) => c.isEdited);
    if (editedCustomers.length === 0) return;

    // TODO: CUSTOMER:UPDATE Bridge command for each edited customer
    // - idempotencyKey: `CUSTOMER:UPDATE:<uuid>` per customer
    console.log('[CustomerInputDialog] CUSTOMER:UPDATE', editedCustomers);
  }, [customers]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    // TODO: CUSTOMER:UPDATE (logical delete) for selected customers
    // - idempotencyKey: `CUSTOMER:UPDATE:<uuid>`
    console.log('[CustomerInputDialog] delete selected', Array.from(selectedIds));
    setCustomers((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleInlineEdit = useCallback((id: string, field: keyof CustomerRow, value: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value, isEdited: true } : c))
    );
  }, []);

  const handleOpenSubDialog = useCallback(
    (dialog: 'detail' | 'pointHistory' | 'ticket' | 'keepItem', customerId: string) => {
      setSelectedCustomerForSub(customerId);
      setActiveSubDialog(dialog);
    },
    []
  );

  const handleToggleAddress = useCallback(() => {
    setShowAddress((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setSearchPhone('');
    setCustomers(STUB_CUSTOMERS);
    setSelectedIds(new Set());
    setActiveSubDialog(null);
    onClose();
  }, [onClose]);

  // ─── Render ───

  return (
    <FullScreenPanel
      open={open}
      onClose={handleClose}
      title="고객 관리"
      footer={
        <Button variant="ghost" size="md" onClick={handleClose}>
          닫기
        </Button>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Toolbar */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" onClick={handleAdd}>추가</Button>
          <Button variant="outline" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="outline" size="sm" onClick={handleDeleteSelected} disabled={selectedIds.size === 0}>
            선택삭제
          </Button>
          <div className="flex-1" />
          <TextInput
            value={searchPhone}
            onChange={setSearchPhone}
            placeholder="전화번호 검색"
          />
          <Button variant="primary" size="sm" onClick={handleSearch} disabled={isSearching}>
            검색
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToggleAddress}>
            {showAddress ? '주소숨기기' : '주소보기'}
          </Button>
        </div>

        {/* Customer Grid */}
        <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-sm overflow-hidden">
          {/* Header */}
          <div
            className={`grid bg-pos-surface border-b border-pos-border ${
              showAddress
                ? 'grid-cols-[32px_60px_100px_120px_120px_1fr_80px]'
                : 'grid-cols-[32px_60px_100px_120px_120px_80px]'
            }`}
          >
            <div className="px-1 py-2" />
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">코드</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">이름</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">전화번호</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">휴대폰</div>
            {showAddress && (
              <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">주소</div>
            )}
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted text-right">포인트</div>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {customers.map((c) => (
              <div
                key={c.id}
                className={`grid border-b border-pos-border last:border-b-0 ${
                  showAddress
                    ? 'grid-cols-[32px_60px_100px_120px_120px_1fr_80px]'
                    : 'grid-cols-[32px_60px_100px_120px_120px_80px]'
                } ${selectedIds.has(c.id) ? 'bg-primary-50' : ''}`}
              >
                <div className="px-1 py-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => handleToggleSelect(c.id)}
                    className="cursor-pointer"
                  />
                </div>
                <div className="px-2 py-1 text-sm text-pos-text">{c.id}</div>
                <div className="px-2 py-1">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => handleInlineEdit(c.id, 'name', e.target.value)}
                    className="w-full text-sm text-pos-text bg-transparent border-b border-transparent focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="px-2 py-1 text-sm text-pos-text tabular-nums">{c.phone}</div>
                <div className="px-2 py-1 text-sm text-pos-text tabular-nums">{c.hphone}</div>
                {showAddress && (
                  <div className="px-2 py-1 text-sm text-pos-text truncate">{c.address}</div>
                )}
                <div className="px-2 py-1 text-sm text-pos-text text-right tabular-nums">
                  {c.point.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Function Buttons */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const first = customers[0]?.id;
              if (first) handleOpenSubDialog('detail', first);
            }}
          >
            상세설정
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Open PointHistoryModal
              console.log('[CustomerInputDialog] open PointHistoryModal');
            }}
          >
            포인트이력
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Open TicketModal
              console.log('[CustomerInputDialog] open TicketModal');
            }}
          >
            상품권
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const first = customers[0]?.id;
              if (first) handleOpenSubDialog('keepItem', first);
            }}
          >
            킵상품
          </Button>
          {/* Conditional buttons (feature flag / permission based) */}
          {/* TODO: P2 - SMS전송, 매장상품권, 담당자, 킵일괄, 일괄적용, 선택저장, 전체삭제 */}
        </div>

        {/* Sub-dialog indicator (actual dialogs would render here) */}
        {activeSubDialog && (
          <div className="text-xs text-pos-text-muted">
            {/* TODO: Render actual sub-dialogs (CustomerDetailDialog, PointHistoryModal, TicketModal, KeepItemModal) */}
            Active sub-dialog: {activeSubDialog} for customer {selectedCustomerForSub}
          </div>
        )}
      </div>
    </FullScreenPanel>
  );
}
