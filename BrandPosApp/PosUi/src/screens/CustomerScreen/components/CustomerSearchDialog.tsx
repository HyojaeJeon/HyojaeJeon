'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import TextInput from '@shared/ui/atoms/TextInput';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Button from '@shared/ui/atoms/Button';

/**
 * CustomerSearchDialog -- 고객 검색 모달 (레거시 IDD_CUSTSEL)
 *
 * 고객을 이름, 전화번호, 주소 등으로 검색하고 선택하는 모달.
 * 주문/결제/배달 등 고객 연결이 필요한 모든 흐름에서 공통 호출.
 *
 * Bridge Commands: CUSTOMER:SEARCH, CUSTOMER:GET_DETAIL
 * UseCases: SearchCustomerUseCase, GetCustomerDetailUseCase
 */

// ─── Types ───

interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  address: string;
  point: number;
}

interface CustomerSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelected: (customerId: string) => void;
}

// ─── Stub Data ───

const STUB_RESULTS: CustomerSearchResult[] = [
  { id: 'C001', name: '홍길동', phone: '010-1234-5678', address: '서울시 강남구', point: 1500 },
  { id: 'C002', name: '김철수', phone: '010-9876-5432', address: '서울시 서초구', point: 3200 },
  { id: 'C003', name: '이영희', phone: '010-5555-1234', address: '서울시 송파구', point: 800 },
];

// ─── Component ───

export default function CustomerSearchDialog({
  open,
  onClose,
  onSelected,
}: CustomerSearchDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // ─── Handlers ───

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    try {
      // TODO: CUSTOMER:SEARCH Bridge command via RTK Query useSearchCustomersQuery
      // - params: { keyword, searchType: 'name' | 'phone', phoneOnly }
      // - on success: setResults(data.customers)
      console.log('[CustomerSearchDialog] CUSTOMER:SEARCH', { keyword, phoneOnly });

      // Stub: filter by keyword
      const filtered = STUB_RESULTS.filter(
        (c) =>
          c.name.includes(keyword) ||
          c.phone.includes(keyword) ||
          c.address.includes(keyword)
      );
      setResults(filtered);
    } catch {
      // TODO: handle search error
    } finally {
      setIsSearching(false);
    }
  }, [keyword, phoneOnly]);

  const handleAddressSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    // TODO: CUSTOMER:SEARCH with searchType='address'
    console.log('[CustomerSearchDialog] CUSTOMER:SEARCH (address)', { keyword });
    const filtered = STUB_RESULTS.filter((c) => c.address.includes(keyword));
    setResults(filtered);
  }, [keyword]);

  const handlePhoneAutoFill = useCallback(() => {
    // TODO: P1 - 외부 장치에서 전화번호 입력받기
    console.log('[CustomerSearchDialog] phone auto-fill');
  }, []);

  const handleSelect = useCallback(async () => {
    if (!selectedId) return;
    // TODO: CUSTOMER:GET_DETAIL Bridge command for full detail
    console.log('[CustomerSearchDialog] CUSTOMER:GET_DETAIL', { customerId: selectedId });
    onSelected(selectedId);
  }, [selectedId, onSelected]);

  const handleRowClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setKeyword('');
    setPhoneOnly(false);
    setResults([]);
    setSelectedId(null);
    onClose();
  }, [onClose]);

  // ─── Render ───

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="고객 검색"
      size="lg"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSelect} disabled={!selectedId}>
            선택
          </Button>
          <Button variant="ghost" size="md" onClick={handleClose}>
            닫기
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <TextInput
            value={keyword}
            onChange={setKeyword}
            placeholder="이름 또는 전화번호"
            fullWidth
          />
          <Button variant="primary" size="sm" onClick={handleSearch} disabled={isSearching}>
            검색
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddressSearch}>
            주소검색
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePhoneAutoFill}>
            전화번호입력받기
          </Button>
        </div>

        {/* Phone Only Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={phoneOnly} onChange={setPhoneOnly} />
          <span className="text-sm text-pos-text">휴대폰번호 검색</span>
        </label>

        {/* Results Grid */}
        <div className="border border-pos-border rounded-pos-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr_140px_1fr_80px] bg-pos-surface border-b border-pos-border">
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">코드</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">고객명</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">전화번호</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted">주소</div>
            <div className="px-2 py-2 text-xs font-semibold text-pos-text-muted text-right">포인트</div>
          </div>

          {/* Rows */}
          <div className="max-h-[240px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-pos-text-muted">
                {keyword ? '검색 결과가 없습니다' : '검색어를 입력하세요'}
              </div>
            ) : (
              results.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleRowClick(customer.id)}
                  className={`
                    grid grid-cols-[80px_1fr_140px_1fr_80px] cursor-pointer
                    border-b border-pos-border last:border-b-0
                    active:scale-[0.99]
                    ${selectedId === customer.id
                      ? 'bg-primary-50 border-l-2 border-l-primary-500'
                      : 'active:bg-pos-surface'
                    }
                  `}
                >
                  <div className="px-2 py-2 text-sm text-pos-text">{customer.id}</div>
                  <div className="px-2 py-2 text-sm text-pos-text font-medium">{customer.name}</div>
                  <div className="px-2 py-2 text-sm text-pos-text tabular-nums">{customer.phone}</div>
                  <div className="px-2 py-2 text-sm text-pos-text truncate">{customer.address}</div>
                  <div className="px-2 py-2 text-sm text-pos-text text-right tabular-nums">
                    {customer.point.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TODO: P2 - NumericKeypad / VirtualKeyboard for touch environment */}
      </div>
    </Modal>
  );
}
