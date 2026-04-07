'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ────────────────────────────────────────────

interface BarcodeSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

// ─── Stub data ────────────────────────────────────────

const BARCODE_TYPES = [
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'CODE128', label: 'Code 128' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'QR', label: 'QR Code' },
];

// ─── Component ────────────────────────────────────────

export default function BarcodeSettingsDialog({ open, onClose, onSaved }: BarcodeSettingsDialogProps) {
  const [barcodeType, setBarcodeType] = useState<string>('EAN13');
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');

  const handlePrintTest = useCallback(() => {
    // TODO: BARCODE:PRINT_TEST bridge call
    // Payload: { type: barcodeType, prefix, suffix, testData: '1234567890123' }
  }, [barcodeType, prefix, suffix]);

  const handleSave = useCallback(() => {
    // TODO: BARCODE:SAVE_SETTINGS bridge call
    // Payload: { type: barcodeType, prefix, suffix }
    onSaved?.();
    onClose();
  }, [barcodeType, prefix, suffix, onSaved, onClose]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="바코드 설정"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={handlePrintTest}>테스트 인쇄</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4 max-w-md flex flex-col gap-4">
        {/* Barcode type */}
        <div className="flex flex-col gap-1.5">
          <Label size="xs" weight="medium">바코드 타입</Label>
          <Dropdown
            options={BARCODE_TYPES}
            value={barcodeType}
            onChange={setBarcodeType}
            placeholder="바코드 타입 선택"
          />
        </div>

        {/* Prefix */}
        <TextInput
          label="접두어 (Prefix)"
          value={prefix}
          onChange={setPrefix}
          placeholder="접두어를 입력하세요 (선택)"
          fullWidth
        />

        {/* Suffix */}
        <TextInput
          label="접미어 (Suffix)"
          value={suffix}
          onChange={setSuffix}
          placeholder="접미어를 입력하세요 (선택)"
          fullWidth
        />

        {/* Preview */}
        <div className="mt-2 rounded-xl bg-pos-bg shadow-pos-soft p-4">
          <Label size="xs" weight="semibold" color="muted">미리보기</Label>
          <div className="mt-2 flex items-center gap-1 text-sm font-mono tabular-nums text-pos-text">
            {prefix && <span className="text-primary-500">{prefix}</span>}
            <span>1234567890</span>
            {suffix && <span className="text-primary-500">{suffix}</span>}
          </div>
          <div className="mt-1 text-2xs text-pos-text-muted">
            타입: {BARCODE_TYPES.find((t) => t.value === barcodeType)?.label ?? barcodeType}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
