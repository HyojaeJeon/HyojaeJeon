'use client';

/**
 * PrintManagerDialog (SET-PRINT-MGR / PRINT_MGR)
 *
 * 프린터 설정 네비게이션 허브.
 * 4개 탭: 주문프린터 / 일반영수증 / 계산서(간이주문서) / 프린터등록.
 *
 * Legacy: IDD_PRINT_MGR
 * Bridge: (탭 전환 전용, 하위 화면에서 개별 Bridge 호출)
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Tabs from '@shared/ui/molecules/Tabs';

// ─── Types ───

type PrintTab = 'orderPrint' | 'receipt' | 'bill' | 'printerReg';

interface PrintManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

const TABS: { id: PrintTab; label: string }[] = [
  { id: 'orderPrint', label: '주문프린터' },
  { id: 'receipt', label: '일반영수증' },
  { id: 'bill', label: '계산서' },
  { id: 'printerReg', label: '프린터등록' },
];

// ─── Component ───

export default function PrintManagerDialog({
  open,
  onClose,
}: PrintManagerDialogProps) {
  const [activeTab, setActiveTab] = useState<PrintTab>('orderPrint');

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="프린터 관리"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
      }
    >
      <Tabs
        tabs={TABS}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as PrintTab)}
      />

      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl bg-pos-surface shadow-pos-card p-4">
        {activeTab === 'orderPrint' && (
          <div className="text-sm text-pos-text-muted">주문프린터 설정 콘텐츠</div>
        )}
        {activeTab === 'receipt' && (
          <div className="text-sm text-pos-text-muted">일반영수증 설정 콘텐츠</div>
        )}
        {activeTab === 'bill' && (
          <div className="text-sm text-pos-text-muted">계산서 설정 콘텐츠</div>
        )}
        {activeTab === 'printerReg' && (
          <div className="text-sm text-pos-text-muted">프린터등록 콘텐츠</div>
        )}
      </div>
    </FullScreenPanel>
  );
}
