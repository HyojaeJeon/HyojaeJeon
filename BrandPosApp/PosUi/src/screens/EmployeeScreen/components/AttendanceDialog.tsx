'use client';

/**
 * AttendanceDialog (SCR-EMP-DILIGENCE)
 *
 * Employee attendance management screen.
 * Provides: clock in/out, period query, attendance edit, salary payment, print/export.
 *
 * Legacy: IDD_EMP_DILIGENCE (122), 512x384 DLU, 19 controls
 * Shared UI: DataTable (staff list, attendance detail), DatePicker, Button
 */

import { useState } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import DatePicker from '@shared/ui/molecules/DatePicker';

// --- Types ---

interface StaffMember {
  staffId: string;
  staffName: string;
}

interface ClockRecord {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  workHours: number;
}

interface AttendanceDialogProps {
  open: boolean;
  onClose: () => void;
}

// --- Component ---

export default function AttendanceDialog({ open, onClose }: AttendanceDialogProps) {
  // Local state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [expandedGrid, setExpandedGrid] = useState(false);

  // Stub data -- will be replaced by staffApi RTK Query hooks
  const staffList: StaffMember[] = [];
  const clockRecords: ClockRecord[] = [];

  // --- Handlers (stubs) ---

  const handleClockIn = () => {
    // TODO: Bridge STAFF:CLOCK_IN_OUT { staffId, type: "IN" } -> ClockInOutUseCase
  };

  const handleClockOut = () => {
    // TODO: Bridge STAFF:CLOCK_IN_OUT { staffId, type: "OUT" } -> ClockInOutUseCase
  };

  const handleQuery = () => {
    // TODO: Bridge STAFF:GET_HISTORY { staffId, startDate, endDate } -> GetClockHistoryUseCase
  };

  const handleEdit = () => {
    // TODO: Bridge STAFF:CLOCK_IN_OUT (edit mode) -> ClockInOutUseCase
  };

  const handlePaySalary = () => {
    // TODO: Bridge ACCOUNTING:CASH_OUT { amount, reason, staffId } -> CashInOutUseCase
  };

  const handlePrint = () => {
    // TODO: Bridge SYSTEM:GET_CONTENT -> Device/Printer
  };

  const handleExcelExportTop = () => {
    // TODO: Bridge SYSTEM:GET_CONTENT -> Support/Excel
  };

  const handleExcelExportBottom = () => {
    // TODO: Bridge SYSTEM:GET_CONTENT -> Support/Excel
  };

  const handleToggleExpand = () => {
    setExpandedGrid((prev) => !prev);
  };

  // --- Render ---

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="staff.attendance.title"
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={handleToggleExpand}>
            {expandedGrid ? 'Collapse' : 'Expand'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExcelExportBottom}>
            Excel
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* Top action bar */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handlePaySalary}>
            Pay Salary
          </Button>
          <DatePicker value={startDate} onChange={setStartDate} />
          <span className="text-pos-text-secondary">~</span>
          <DatePicker value={endDate} onChange={setEndDate} />
          <Button variant="primary" size="sm" onClick={handleQuery}>
            Search
          </Button>
          <Button variant="secondary" size="sm" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExcelExportTop}>
            Excel
          </Button>
          <div className="flex-1" />
          <Button variant="primary" size="sm" onClick={handleClockIn}>
            Clock In
          </Button>
          <Button variant="secondary" size="sm" onClick={handleClockOut}>
            Clock Out
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex min-h-0 gap-4">
          {/* Staff list (left panel) */}
          <div className="w-48 shrink-0 flex flex-col min-h-0 border border-pos-border rounded overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-pos-surface sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Staff</th>
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 ? (
                  <tr>
                    <td className="text-center py-8 text-pos-text-secondary">
                      No staff
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => (
                    <tr
                      key={staff.staffId}
                      className={`cursor-pointer hover:bg-pos-surface ${
                        selectedStaffId === staff.staffId ? 'bg-pos-primary/10' : ''
                      }`}
                      onClick={() => setSelectedStaffId(staff.staffId)}
                    >
                      <td className="px-3 py-2">{staff.staffName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

          {/* Attendance detail grid (right panel) */}
          <div className={`flex-1 flex flex-col min-h-0 border border-pos-border rounded overflow-hidden ${expandedGrid ? 'absolute inset-4 z-10 bg-pos-bg' : ''}`}>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-pos-surface sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Clock In</th>
                    <th className="text-left px-3 py-2">Clock Out</th>
                    <th className="text-right px-3 py-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {clockRecords.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-pos-text-secondary">
                        No records
                      </td>
                    </tr>
                  ) : (
                    clockRecords.map((record, idx) => (
                      <tr key={idx} className="hover:bg-pos-surface">
                        <td className="px-3 py-2">{record.date}</td>
                        <td className="px-3 py-2">{record.clockIn ?? '-'}</td>
                        <td className="px-3 py-2">{record.clockOut ?? '-'}</td>
                        <td className="px-3 py-2 text-right">{record.workHours.toFixed(1)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
