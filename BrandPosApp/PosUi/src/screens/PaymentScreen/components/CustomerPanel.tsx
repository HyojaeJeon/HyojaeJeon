'use client';

import { useState } from 'react';
import Button from '@shared/ui/atoms/Button';

// -------------------------------------------------------------------
// CustomerPanel -- 회원 검색/표시/포인트 정보
// account-dialog.md AD-F12~F14
// -------------------------------------------------------------------

interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  point: number;
}

interface CustomerPanelProps {
  isSearchOpen: boolean;
  onSearch: () => void;
  onCloseSearch: () => void;
}

export default function CustomerPanel({
  isSearchOpen,
  onSearch,
  onCloseSearch,
}: CustomerPanelProps) {
  // Stub: selected customer (to be replaced by RTK Query customerApi.getCustomer)
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);

  const handleClearCustomer = () => {
    // TODO: CUSTOMER:SEARCH bridge command (clear association)
    setCustomer(null);
    console.log('[CustomerPanel] customer cleared');
  };

  const handleApplyPoint = () => {
    if (!customer) return;
    // TODO: PAYMENT:APPLY_POINT bridge command
    console.log('[CustomerPanel] apply point for customer:', customer.id);
  };

  return (
    <div>
      <div className="text-xs text-pos-text-muted mb-2 font-semibold">회원</div>

      {customer ? (
        <div className="flex flex-col gap-2 p-3 bg-pos-bg rounded-pos-card border border-pos-border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-pos-text">{customer.name}</span>
            <span className="text-xs text-pos-text-secondary">{customer.phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-pos-text-secondary">포인트</span>
            <span className="text-sm font-bold text-primary-500 tabular-nums">
              {customer.point.toLocaleString('ko-KR')}P
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" fullWidth onClick={handleApplyPoint}>
              포인트 사용
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={handleClearCustomer}>
              회원 취소
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" fullWidth onClick={onSearch}>
          회원 검색
        </Button>
      )}
    </div>
  );
}
