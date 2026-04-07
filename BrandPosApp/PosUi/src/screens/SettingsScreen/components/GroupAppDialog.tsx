'use client';

/**
 * GroupAppDialog (SET-GRPAPPDLG)
 *
 * 그룹 선택/적용 모달. 독립 Screen이 아니라 다른 설정 화면에서 호출되는 공용 모달.
 * mode="apply" => 그룹적용 저장, mode="select" => 그룹 선택 콜백 반환.
 *
 * Legacy: IDD_GRPAPPDLG (리소스 166)
 * Bridge: SETUP:GROUP:GET_LIST, SETUP:GROUP:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

// ─── Types ───

interface GroupItem {
  groupId: string;
  groupName: string;
  description: string;
}

interface GroupAppDialogProps {
  open: boolean;
  onClose: () => void;
  mode?: 'apply' | 'select';
  onSelectGroup?: (group: GroupItem) => void;
}

// ─── Component ───

export default function GroupAppDialog({
  open,
  onClose,
  mode = 'apply',
  onSelectGroup,
}: GroupAppDialogProps) {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // TODO: RTK Query - setupApi.useGetGroupListQuery()
  // TODO: RTK Query - setupApi.useSaveGroupConfigMutation()

  const handleApply = useCallback(() => {
    // TODO: Bridge SETUP:GROUP:SAVE 호출
  }, [selectedGroupId]);

  const handleSelect = useCallback(() => {
    const group = groups.find((g) => g.groupId === selectedGroupId);
    if (group && onSelectGroup) {
      onSelectGroup(group);
    }
    onClose();
  }, [groups, selectedGroupId, onSelectGroup, onClose]);

  const handleConfirm = mode === 'apply' ? handleApply : handleSelect;

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="그룹 선택"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            {mode === 'apply' ? '그룹적용' : '선택'}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </div>
      }
    >
      <div className="flex flex-col h-full gap-3">
        {/* 그룹 목록 */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl bg-pos-bg shadow-pos-card">
          <ul className="divide-y divide-pos-border">
            {groups.map((g) => (
              <li
                key={g.groupId}
                className={`cursor-pointer px-3 py-2 text-pos-text ${
                  selectedGroupId === g.groupId ? 'bg-primary-500/10' : ''
                }`}
                onClick={() => setSelectedGroupId(g.groupId)}
              >
                <span className="font-medium">{g.groupName}</span>
                {g.description && (
                  <span className="ml-2 text-sm text-pos-text-muted">{g.description}</span>
                )}
              </li>
            ))}
            {groups.length === 0 && (
              <li className="px-3 py-4 text-center text-pos-text-muted">
                그룹 목록이 없습니다.
              </li>
            )}
          </ul>
        </div>
      </div>
    </FullScreenPanel>
  );
}
