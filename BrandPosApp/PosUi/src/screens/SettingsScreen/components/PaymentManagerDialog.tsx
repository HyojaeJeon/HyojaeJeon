'use client';

/**
 * PaymentManagerDialog (SET-PAY-MGR / PAY_MGR)
 *
 * 결제 관련 설정 네비게이션 허브.
 * 5개 탭: PAY설정 / 결제계산서 / 세금계산서물품대 / PAY4(예약) / PAY5(예약).
 * 탭 내부 콘텐츠는 하위 컴포넌트로 위임.
 *
 * Legacy: IDD_PAY_MGR
 * Bridge: (탭 전환 전용, 하위 화면에서 개별 Bridge 호출)
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Tabs from '@shared/ui/molecules/Tabs';

// ─── Types ───

type PaymentTab = 'payConfig' | 'taxInvoice' | 'taxGoods' | 'pay4' | 'pay5';

interface PaymentManagerDialogProps {
  open?: boolean;
  onClose: () => void;
  posNumber?: string;
}

const TAB_CONFIG: { id: PaymentTab; label: string }[] = [
  { id: 'payConfig', label: 'PAY설정' },
  { id: 'taxInvoice', label: '결제계산서' },
  { id: 'taxGoods', label: '세금계산서/물품대' },
];

// ─── Component ───

export default function PaymentManagerDialog({
  open = true,
  onClose,
  posNumber,
}: PaymentManagerDialogProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('payConfig');

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="결제 관리"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
      }
    >
      {posNumber && (
        <div className="shrink-0 text-xs text-pos-text-muted">
          POS No. {posNumber}
        </div>
      )}

      <div className="shrink-0">
        <Tabs
          tabs={TAB_CONFIG}
          activeId={activeTab}
          onSelect={(id) => setActiveTab(id as PaymentTab)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl bg-pos-bg shadow-pos-card p-4">
        {activeTab === 'payConfig' && (
          <div className="text-sm text-pos-text-muted">PAY 설정 콘텐츠</div>
        )}
        {activeTab === 'taxInvoice' && (
          <div className="text-sm text-pos-text-muted">결제계산서 설정 콘텐츠</div>
        )}
        {activeTab === 'taxGoods' && (
          <div className="text-sm text-pos-text-muted">세금계산서/물품대 설정 콘텐츠</div>
        )}
      </div>
    </FullScreenPanel>
  );
}
