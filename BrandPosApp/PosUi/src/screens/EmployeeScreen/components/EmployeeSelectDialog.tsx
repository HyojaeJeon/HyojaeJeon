'use client';

/**
 * EmployeeSelectDialog (SCR-EMPSEL)
 *
 * Employee selection/management modal.
 * Called from order/payment/table screens for staff switching.
 * Provides: staff list, add/delete/save, menu permission toggle (24 checkboxes).
 *
 * Legacy: IDD_EMPSEL (412), 450x337 DLU, 33 controls
 * Shared UI: Modal, DataTable (staff list), CheckboxMatrix (4x6 permissions), SearchInput
 */

import { useState, useMemo } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Checkbox from '@shared/ui/atoms/Checkbox';

// --- Types ---

interface StaffMember {
  staffId: string;
  staffName: string;
  staffCode: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface EmployeeSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectStaff?: (staff: StaffMember) => void;
}

// 24 menu permission labels (4 cols x 6 rows)
const PERMISSION_LABELS: string[] = Array.from({ length: 24 }, (_, i) => `menu.permission.${i}`);

// --- Component ---

export default function EmployeeSelectDialog({
  open,
  onClose,
  onSelectStaff,
}: EmployeeSelectDialogProps) {
  // Local state
  const [searchText, setSearchText] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState<Record<number, boolean>>({});

  // Stub data -- will be replaced by staffApi.getStaffList RTK Query hook
  const staffList: StaffMember[] = [];

  // Filtered list (local UI filter)
  const filteredStaff = useMemo(() => {
    if (!searchText) return staffList;
    const lower = searchText.toLowerCase();
    return staffList.filter(
      (s) =>
        s.staffName.toLowerCase().includes(lower) ||
        s.staffCode.toLowerCase().includes(lower),
    );
  }, [staffList, searchText]);

  const selectedStaff = filteredStaff.find((s) => s.staffId === selectedStaffId) ?? null;

  // --- Handlers (stubs) ---

  const handleSelectStaff = (staff: StaffMember) => {
    setSelectedStaffId(staff.staffId);
    // TODO: load permissions for selected staff via staffApi.getStaffPermissions
  };

  const handleConfirmSelect = () => {
    if (selectedStaff && onSelectStaff) {
      onSelectStaff(selectedStaff);
    }
    // TODO: Bridge STAFF:SELECT -> VerifyPermissionUseCase
    onClose();
  };

  const handleAddStaff = () => {
    // TODO: Bridge STAFF:SELECT (add) -> StaffMgr.AddStaff
  };

  const handleDeleteStaff = () => {
    // TODO: Bridge STAFF:SELECT (delete) -> StaffMgr.DeleteStaff
  };

  const handleSave = () => {
    // TODO: Bridge STAFF:SELECT (save) -> StaffMgr.SaveStaff + UpdatePermissions
  };

  const handleTogglePermission = (index: number) => {
    setPermissions((prev) => ({ ...prev, [index]: !prev[index] }));
    // TODO: permission changes will be batched and saved via handleSave
  };

  const handleTogglePermissionsPanel = () => {
    setShowPermissions((prev) => !prev);
  };

  // --- Render ---

  return (
    <Modal open={open} onClose={onClose} title="staff.select.title" size="lg">
      {/* Top action bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-pos-border">
        <Button onClick={handleSave}>
          {/* i18n: staff.action.save */}
          Save
        </Button>
        <Button onClick={onClose}>
          {/* i18n: common.close */}
          Close
        </Button>
        <div className="flex-1" />
        <TextInput
          value={searchText}
          onChange={(v) => setSearchText(v)}
          placeholder="Search staff..."
        />
        <Button onClick={handleAddStaff}>
          {/* i18n: staff.action.add */}
          Add
        </Button>
        <Button onClick={handleDeleteStaff}>
          {/* i18n: staff.action.delete */}
          Delete
        </Button>
        <Button onClick={handleTogglePermissionsPanel}>
          {/* i18n: staff.action.menuPermissions */}
          Menu &gt;&gt;
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Permission checkbox matrix (4x6, conditionally shown) */}
        {showPermissions && (
          <div className="w-64 shrink-0 overflow-y-auto border border-pos-border rounded p-2">
            <div className="grid grid-cols-4 gap-2">
              {PERMISSION_LABELS.map((label, index) => (
                <label key={index} className="flex items-center gap-1 text-xs">
                  <Checkbox
                    checked={!!permissions[index]}
                    onChange={() => handleTogglePermission(index)}
                  />
                  <span className="truncate">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Staff list grid (DataTable replacement) */}
        <div className="flex-1 overflow-y-auto border border-pos-border rounded">
          <table className="w-full text-sm">
            <thead className="bg-pos-surface sticky top-0">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Code</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-pos-text-secondary">
                    {/* i18n: staff.list.empty */}
                    No staff members
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.staffId}
                    className={`cursor-pointer hover:bg-pos-surface ${
                      selectedStaffId === staff.staffId ? 'bg-pos-primary/10' : ''
                    }`}
                    onClick={() => handleSelectStaff(staff)}
                    onDoubleClick={handleConfirmSelect}
                  >
                    <td className="px-3 py-2">{staff.staffName}</td>
                    <td className="px-3 py-2">{staff.staffCode}</td>
                    <td className="px-3 py-2">{staff.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-4 py-3 border-t border-pos-border">
        <Button onClick={handleConfirmSelect} disabled={!selectedStaff}>
          {/* i18n: staff.action.select */}
          Select
        </Button>
      </div>
    </Modal>
  );
}
