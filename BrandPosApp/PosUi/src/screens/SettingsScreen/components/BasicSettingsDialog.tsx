'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Tabs from '@shared/ui/molecules/Tabs';

/**
 * BasicSettingsDialog -- Basic POS configuration (7-tab category view)
 *
 * Design doc: set-basicset.md (SCR-SET-BASICSET)
 * Legacy: IDD_BASICSET (resource 157)
 *
 * Left panel: settings item list grid (virtualized)
 * Right panel: settings value edit grid (inline editing)
 * 7 tabs: All / Environment(A) / Table(B) / Additional(C) / OrderSale(D) / Printer(E) / Closing(F)
 *
 * Bridge Commands:
 *   SETUP:BASIC:SAVE, SETUP:BASIC:GET_CONFIG
 *
 * RTK Query: setupBasicApi.getBasicConfig, setupBasicApi.saveBasicConfig
 */

type TabCategory = 'all' | 'env' | 'table' | 'additional' | 'orderSale' | 'printer' | 'closing';

interface BasicSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
}

const TABS: { id: TabCategory; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'env', label: '환경(A)' },
  { id: 'table', label: '테이블(B)' },
  { id: 'additional', label: '추가기능(C)' },
  { id: 'orderSale', label: '주문판매(D)' },
  { id: 'printer', label: '프린터(E)' },
  { id: 'closing', label: '마감(F)' },
];

export default function BasicSettingsDialog({ open = true, onClose }: BasicSettingsDialogProps) {
  const [selectedTab, setSelectedTab] = useState<TabCategory>('all');

  const handleSave = useCallback(() => {
    // TODO: Call setupBasicApi.saveBasicConfig mutation
    // TODO: Show confirmation dialog for operation-affecting settings
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setSelectedTab(tabId as TabCategory);
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="기초설정"
      subtitle="SCR-SET-BASICSET"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex h-full flex-col gap-4 min-h-0">
        {/* Tabs */}
        <div className="shrink-0">
          <Tabs
            tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
            activeId={selectedTab}
            onSelect={handleTabChange}
          />
        </div>

        {/* Two-panel grid layout */}
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Left: Settings item list */}
          <div className="flex w-1/2 flex-col rounded-xl bg-pos-surface shadow-pos-card overflow-hidden">
            <div className="px-3 py-2 text-sm font-semibold text-pos-text bg-pos-bg">
              설정 항목 목록
            </div>
            <div className="flex-1 overflow-auto p-2">
              {/* TODO: DataGrid with virtualized scroll for settings items list */}
              {/* TODO: setupBasicApi.getBasicConfig filtered by selectedTab */}
              <p className="text-sm text-pos-text-muted">
                설정 항목이 여기에 표시됩니다. (카테고리: {selectedTab})
              </p>
            </div>
          </div>

          {/* Right: Settings value editor */}
          <div className="flex w-1/2 flex-col rounded-xl bg-pos-surface shadow-pos-card overflow-hidden">
            <div className="px-3 py-2 text-sm font-semibold text-pos-text bg-pos-bg">
              설정값 편집
            </div>
            <div className="flex-1 overflow-auto p-2">
              {/* TODO: DataGrid with inline editing (combo/text/checkbox) */}
              <p className="text-sm text-pos-text-muted">
                선택한 항목의 설정값을 편집합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
