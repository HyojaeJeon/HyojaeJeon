'use client';

import { useState, useCallback, useMemo } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// ─── Types ────────────────────────────────────────────
type GroupSelectMode = 'select' | 'manage';

interface GroupItem {
  code: string;
  name: string;
  parentCode: string | null;
}

interface GroupSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (group: { code: string; name: string; parentCode: string | null }) => void;
  mode?: GroupSelectMode;
}

// ─── Stub data ────────────────────────────────────────
const STUB_BIG_GROUPS: GroupItem[] = Array.from({ length: 8 }, (_, i) => ({
  code: `BIG-${String(i + 1).padStart(2, '0')}`,
  name: `대분류 ${i + 1}`,
  parentCode: null,
}));

const STUB_MID_GROUPS: GroupItem[] = Array.from({ length: 20 }, (_, i) => ({
  code: `MID-${String(i + 1).padStart(3, '0')}`,
  name: `중분류 ${i + 1}`,
  parentCode: `BIG-${String((i % 8) + 1).padStart(2, '0')}`,
}));

// ─── Component ────────────────────────────────────────
export default function GroupSelectDialog({
  open,
  onClose,
  onSelect,
  mode = 'select',
}: GroupSelectDialogProps) {
  const [bigGroups] = useState<GroupItem[]>(STUB_BIG_GROUPS);
  const [midGroups] = useState<GroupItem[]>(STUB_MID_GROUPS);
  const [selectedBigCode, setSelectedBigCode] = useState<string | null>(null);
  const [selectedMidCode, setSelectedMidCode] = useState<string | null>(null);

  const filteredMidGroups = useMemo(
    () => (selectedBigCode ? midGroups.filter((g) => g.parentCode === selectedBigCode) : []),
    [selectedBigCode, midGroups],
  );

  // ─── Handlers ─────────────────────────────────────
  const handleSelectBig = useCallback((code: string) => {
    setSelectedBigCode(code);
    setSelectedMidCode(null);
  }, []);

  const handleSelectMid = useCallback((code: string) => {
    setSelectedMidCode(code);
  }, []);

  const handleConfirmSelect = useCallback(() => {
    // Prefer mid group if selected, otherwise use big group
    const selected = selectedMidCode
      ? midGroups.find((g) => g.code === selectedMidCode)
      : bigGroups.find((g) => g.code === selectedBigCode);
    if (selected) {
      onSelect?.({ code: selected.code, name: selected.name, parentCode: selected.parentCode });
    }
    onClose();
  }, [selectedBigCode, selectedMidCode, bigGroups, midGroups, onSelect, onClose]);

  const handleSaveGroup = useCallback(() => {
    // TODO: ITEM:REGISTER (group) bridge call for new group creation
    // Only available in 'manage' mode
  }, []);

  const handleDeleteGroup = useCallback(() => {
    // TODO: ITEM:REGISTER (group delete) bridge call
    // Only available in 'manage' mode, check GROUP_HAS_CHILDREN
  }, []);

  const handleSaveSubGroup = useCallback(() => {
    // TODO: ITEM:REGISTER (sub-group) bridge call for new mid-group creation
  }, []);

  const handleDeleteSubGroup = useCallback(() => {
    // TODO: ITEM:REGISTER (sub-group delete) bridge call
  }, []);

  const isManageMode = mode === 'manage';
  const hasSelection = selectedBigCode !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="분류 선택"
      size="md"
      footer={
        <div className="flex items-center gap-2">
          {isManageMode && (
            <>
              <Button variant="secondary" size="sm" onClick={handleSaveGroup}>저장</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteGroup}>삭제</Button>
              <Button variant="secondary" size="sm" onClick={handleSaveSubGroup}>하위저장</Button>
              <Button variant="danger" size="sm" onClick={handleDeleteSubGroup}>하위삭제</Button>
            </>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirmSelect}
            disabled={!hasSelection}
          >
            선택
          </Button>
        </div>
      }
    >
      <div className="flex gap-3" style={{ height: 360 }}>
        {/* Left: Big group + Mid group combined list */}
        <div className="flex-1 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden">
          <div className="px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            대분류 / 중분류
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {bigGroups.map((big) => (
              <div key={big.code}>
                <button
                  type="button"
                  onClick={() => handleSelectBig(big.code)}
                  className={`w-full px-3 py-2.5 text-xs text-left cursor-pointer transition-colors font-semibold ${
                    selectedBigCode === big.code
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  {big.name}
                </button>
                {/* Show mid groups under selected big group */}
                {selectedBigCode === big.code &&
                  filteredMidGroups.map((mid) => (
                    <button
                      key={mid.code}
                      type="button"
                      onClick={() => handleSelectMid(mid.code)}
                      className={`w-full pl-8 pr-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                        selectedMidCode === mid.code
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-pos-text-muted active:bg-gray-50'
                      }`}
                    >
                      {mid.name}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sub-group detail list (for manage mode or wider view) */}
        <div className="w-28 flex flex-col border border-pos-border rounded-pos-lg overflow-hidden shrink-0">
          <div className="px-2 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            하위 분류
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {filteredMidGroups.length === 0 ? (
              <div className="flex items-center justify-center h-full text-2xs text-pos-text-muted">
                대분류를 선택
              </div>
            ) : (
              filteredMidGroups.map((mid) => (
                <button
                  key={mid.code}
                  type="button"
                  onClick={() => handleSelectMid(mid.code)}
                  className={`w-full px-2 py-2 text-xs text-left cursor-pointer transition-colors ${
                    selectedMidCode === mid.code
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  {mid.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
