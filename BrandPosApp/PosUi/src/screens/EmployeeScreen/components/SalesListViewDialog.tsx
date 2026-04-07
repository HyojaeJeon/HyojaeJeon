'use client';

/**
 * SalesListViewDialog (SCR-SELLLISTVIEW)
 *
 * Sales status list view with tab switching:
 * Sell List / Item List / Cancel List / Table List / Employee List
 * Two grids: main list + summary.
 *
 * Legacy: IDD_SELLLISTVIEW (151), 450x337 DLU, 11 controls
 * Shared UI: Tabs, DataTable (list + summary), Button
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Tabs from '@shared/ui/molecules/Tabs';

// --- Types ---

interface SalesListViewDialogProps {
  open: boolean;
  onClose: () => void;
}

type ViewType = 'SELL_LIST' | 'ITEM_LIST' | 'CANCEL_LIST' | 'TABLE_LIST' | 'EMP_LIST';

interface TabDef {
  key: ViewType;
  label: string;
  hidden?: boolean;
}

const TABS: TabDef[] = [
  { key: 'SELL_LIST', label: 'Sales' },
  { key: 'ITEM_LIST', label: 'By Item' },
  { key: 'CANCEL_LIST', label: 'Cancelled' },
  { key: 'TABLE_LIST', label: 'By Table' },
  { key: 'EMP_LIST', label: 'By Staff', hidden: false }, // TODO: config-based conditional
];

// --- Component ---

export default function SalesListViewDialog({ open, onClose }: SalesListViewDialogProps) {
  const [activeTab, setActiveTab] = useState<ViewType>('SELL_LIST');
  const [analysisBasis, setAnalysisBasis] = useState('');

  // Stub data -- will be replaced by salesApi RTK Query hooks
  // salesApi.getSellSlips({ viewType, startDate, endDate })
  // salesApi.getSalesSummary({ viewType, startDate, endDate })

  // --- Handlers (stubs) ---

  const handlePrint = () => {
    // TODO: Bridge SALES:EXPORT -> async print of current tab data
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey as ViewType);
    // TODO: Trigger RTK Query refetch with new viewType parameter
  };

  // --- Render ---

  const visibleTabs = TABS.filter((t) => !t.hidden).map((t) => ({
    id: t.key,
    label: t.label,
  }));

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="sales.listView.title"
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={handlePrint}>Print</Button>
          <div className="flex-1" />
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Header with analysis basis text */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-sm text-pos-text-secondary">
            {analysisBasis || 'Analysis basis: -'}
          </span>
        </div>

        {/* Tab bar */}
        <div className="shrink-0">
          <Tabs
            tabs={visibleTabs}
            activeId={activeTab}
            onSelect={handleTabChange}
          />
        </div>

        {/* Sales list grid (main) */}
        <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-pos-surface sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Details</th>
                  <th className="text-right px-3 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center py-8 text-pos-text-secondary">
                    {/* TODO: salesApi.getSellSlips -> DataTable */}
                    No data for {activeTab}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales summary grid */}
        <div className="shrink-0 h-32 flex flex-col border border-pos-border rounded overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-pos-surface sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Category</th>
                  <th className="text-right px-3 py-2">Count</th>
                  <th className="text-right px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={3} className="text-center py-4 text-pos-text-secondary">
                    {/* TODO: salesApi.getSalesSummary -> DataTable */}
                    No summary
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
