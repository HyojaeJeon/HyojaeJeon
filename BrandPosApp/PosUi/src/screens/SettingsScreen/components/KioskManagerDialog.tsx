'use client';

/**
 * KioskManagerDialog (SET-KIO-MGR / KIO_MGR)
 *
 * 키오스크/테이블오더 설정 네비게이션 허브.
 * 2개 탭: 키오스크주문 / Table Order.
 *
 * Legacy: IDD_KIO_MGR
 * Bridge: SETUP:KIOSK:GET_CONFIG, SETUP:KIOSK:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Tabs from '@shared/ui/molecules/Tabs';
import Checkbox from '@shared/ui/atoms/Checkbox';

// ─── Types ───

type KioskTab = 'kiosk' | 'tableOrder';

interface KioskConfig {
  kioskEnabled: boolean;
  tableOrderEnabled: boolean;
}

interface KioskManagerDialogProps {
  open?: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'kiosk', label: '키오스크주문' },
  { id: 'tableOrder', label: 'Table Order' },
];

// ─── Component ───

export default function KioskManagerDialog({
  open = true,
  onClose,
}: KioskManagerDialogProps) {
  const [activeTab, setActiveTab] = useState<KioskTab>('kiosk');
  const [config, setConfig] = useState<KioskConfig>({
    kioskEnabled: false,
    tableOrderEnabled: false,
  });

  // TODO: RTK Query - setupApi.useGetKioskConfigQuery()
  // TODO: RTK Query - setupApi.useSaveKioskConfigMutation()

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:KIOSK:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="키오스크 관리"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="shrink-0">
        <Tabs
          tabs={TABS}
          activeId={activeTab}
          onSelect={(id) => setActiveTab(id as KioskTab)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl bg-pos-bg shadow-pos-card p-4">
        {activeTab === 'kiosk' && (
          <div className="flex flex-col gap-3">
            <Checkbox
              label="키오스크 모드 활성화"
              checked={config.kioskEnabled}
              onChange={(checked) => setConfig((p) => ({ ...p, kioskEnabled: checked }))}
            />
            <div className="text-sm text-pos-text-muted">키오스크 주문 설정 콘텐츠</div>
          </div>
        )}
        {activeTab === 'tableOrder' && (
          <div className="flex flex-col gap-3">
            <Checkbox
              label="Table Order 활성화"
              checked={config.tableOrderEnabled}
              onChange={(checked) => setConfig((p) => ({ ...p, tableOrderEnabled: checked }))}
            />
            <div className="text-sm text-pos-text-muted">Table Order 설정 콘텐츠</div>
          </div>
        )}
      </div>
    </FullScreenPanel>
  );
}
