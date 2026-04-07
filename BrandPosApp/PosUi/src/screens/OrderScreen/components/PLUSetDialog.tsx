'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// ─── Types ────────────────────────────────────────────
interface PLUSetDialogProps {
  open: boolean;
  onClose: () => void;
  initialSettings?: PLUSettings;
  onSave?: (settings: PLUSettings) => void;
}

interface PLUSettings {
  menuLineCount: number;
  imageTextRatio: string;
  imageRate: string;
}

// ─── Options ──────────────────────────────────────────
const MENU_LINE_OPTIONS = [
  { value: 3, label: '3줄' },
  { value: 4, label: '4줄' },
  { value: 5, label: '5줄' },
  { value: 6, label: '6줄' },
];

const IMAGE_TEXT_RATIO_OPTIONS = [
  { value: '100:0', label: '이미지 100%' },
  { value: '80:20', label: '이미지 80% / 텍스트 20%' },
  { value: '60:40', label: '이미지 60% / 텍스트 40%' },
  { value: '50:50', label: '이미지 50% / 텍스트 50%' },
  { value: '0:100', label: '텍스트 100%' },
];

const IMAGE_RATE_OPTIONS = [
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '100', label: '100%' },
  { value: '125', label: '125%' },
  { value: '150', label: '150%' },
];

const DEFAULT_SETTINGS: PLUSettings = {
  menuLineCount: 5,
  imageTextRatio: '50:50',
  imageRate: '100',
};

// ─── PLUSetDialog ─────────────────────────────────────
export default function PLUSetDialog({
  open,
  onClose,
  initialSettings = DEFAULT_SETTINGS,
  onSave,
}: PLUSetDialogProps) {
  const [menuLineCount, setMenuLineCount] = useState(initialSettings.menuLineCount);
  const [imageTextRatio, setImageTextRatio] = useState(initialSettings.imageTextRatio);
  const [imageRate, setImageRate] = useState(initialSettings.imageRate);

  const handleSave = useCallback(() => {
    // TODO: SYSTEM:SAVE_PLU_SETTINGS bridge call
    const settings: PLUSettings = { menuLineCount, imageTextRatio, imageRate };
    onSave?.(settings);
    onClose();
  }, [menuLineCount, imageTextRatio, imageRate, onSave, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="PLU 설정"
      size="sm"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSave}>
            저장
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Menu line count */}
        <div>
          <label className="block text-xs font-semibold text-pos-text mb-1.5">메뉴 행 수</label>
          <select
            value={menuLineCount}
            onChange={(e) => setMenuLineCount(Number(e.target.value))}
            className="w-full h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text cursor-pointer"
          >
            {MENU_LINE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Image/text ratio */}
        <div>
          <label className="block text-xs font-semibold text-pos-text mb-1.5">이미지/텍스트 비율</label>
          <select
            value={imageTextRatio}
            onChange={(e) => setImageTextRatio(e.target.value)}
            className="w-full h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text cursor-pointer"
          >
            {IMAGE_TEXT_RATIO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Image size rate */}
        <div>
          <label className="block text-xs font-semibold text-pos-text mb-1.5">이미지 크기 비율</label>
          <select
            value={imageRate}
            onChange={(e) => setImageRate(e.target.value)}
            className="w-full h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text cursor-pointer"
          >
            {IMAGE_RATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
