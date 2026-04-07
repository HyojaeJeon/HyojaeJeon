'use client';

/**
 * EmployeeScreen - Hub/Index
 *
 * Centralized hub for all employee-related dialogs.
 * Manages which dialog is currently open.
 *
 * Dialogs:
 * - EmployeeSelectDialog (empsel.md)
 * - AttendanceDialog (emp-diligence.md)
 * - AutoWorkDialog (autowork.md)
 * - IniSettingsDialog (iniset.md)
 * - SalesListViewDialog (selllistview.md)
 * - ContentView2Dialog (contentview2.md)
 */

import { useState } from 'react';
import EmployeeSelectDialog from './components/EmployeeSelectDialog';
import AttendanceDialog from './components/AttendanceDialog';
import AutoWorkDialog from './components/AutoWorkDialog';
import IniSettingsDialog from './components/IniSettingsDialog';
import SalesListViewDialog from './components/SalesListViewDialog';
import ContentView2Dialog from './components/ContentView2Dialog';

type DialogType =
  | 'EMPLOYEE_SELECT'
  | 'ATTENDANCE'
  | 'AUTO_WORK'
  | 'INI_SETTINGS'
  | 'SALES_LIST_VIEW'
  | 'CONTENT_VIEW2'
  | null;

interface EmployeeScreenProps {
  onClose?: () => void;
}

export default function EmployeeScreen({ onClose }: EmployeeScreenProps) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);
  const closeDialog = () => setActiveDialog(null);

  return (
    <div className="flex flex-col h-full">
      {/* Navigation / action buttons to open dialogs */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="text-lg font-bold text-pos-text">Employee Center</div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-pos-sm border border-pos-border bg-pos-bg text-pos-text-muted transition active:scale-[0.97]"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        <button
          className="p-4 border border-pos-border rounded text-sm hover:bg-pos-surface"
          onClick={() => openDialog('EMPLOYEE_SELECT')}
        >
          {/* i18n: staff.select.title */}
          Employee Select
        </button>
        <button
          className="p-4 border border-pos-border rounded text-sm hover:bg-pos-surface"
          onClick={() => openDialog('ATTENDANCE')}
        >
          {/* i18n: staff.attendance.title */}
          Attendance
        </button>
        <button
          className="p-4 border border-pos-border rounded text-sm hover:bg-pos-surface"
          onClick={() => openDialog('AUTO_WORK')}
        >
          {/* i18n: accounting.autoClose.title */}
          Daily Close
        </button>
        <button
          className="p-4 border border-pos-border rounded text-sm hover:bg-pos-surface"
          onClick={() => openDialog('INI_SETTINGS')}
        >
          {/* i18n: system.iniSettings.title */}
          INI Settings
        </button>
        <button
          className="p-4 border border-pos-border rounded text-sm hover:bg-pos-surface"
          onClick={() => openDialog('SALES_LIST_VIEW')}
        >
          {/* i18n: sales.listView.title */}
          Sales List
        </button>
        <button
          className="p-4 border border-pos-border rounded text-sm hover:bg-pos-surface"
          onClick={() => openDialog('CONTENT_VIEW2')}
        >
          {/* i18n: content.viewer.title */}
          Content View (Compact)
        </button>
      </div>

      {/* Dialog instances */}
      <EmployeeSelectDialog
        open={activeDialog === 'EMPLOYEE_SELECT'}
        onClose={closeDialog}
      />
      <AttendanceDialog
        open={activeDialog === 'ATTENDANCE'}
        onClose={closeDialog}
      />
      <AutoWorkDialog
        open={activeDialog === 'AUTO_WORK'}
        onClose={closeDialog}
      />
      <IniSettingsDialog
        open={activeDialog === 'INI_SETTINGS'}
        onClose={closeDialog}
      />
      <SalesListViewDialog
        open={activeDialog === 'SALES_LIST_VIEW'}
        onClose={closeDialog}
      />
      <ContentView2Dialog
        open={activeDialog === 'CONTENT_VIEW2'}
        onClose={closeDialog}
      />
    </div>
  );
}
