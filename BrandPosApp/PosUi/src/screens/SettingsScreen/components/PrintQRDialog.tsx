'use client';

/**
 * PrintQRDialog (SET-PRINTQR-DLG / PRINTQR_DLG)
 *
 * 영수증/주문서 QR 코드 포함 설정.
 *
 * Legacy: IDD_PRINTQR_DLG
 * Bridge: SETUP:PRINT_QR:GET_CONFIG, SETUP:PRINT_QR:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ───

interface QRPrintConfig {
  dataSource: string;
  title: string;
  dataContent: string;
  enabled: boolean;
}

interface PrintQRDialogProps {
  open: boolean;
  onClose: () => void;
}

const DATA_SOURCE_OPTIONS = [
  { value: '', label: '선택' },
  { value: 'manual', label: '직접입력' },
  { value: 'url', label: 'URL' },
  { value: 'storeInfo', label: '매장정보' },
];

// ─── Component ───

export default function PrintQRDialog({
  open,
  onClose,
}: PrintQRDialogProps) {
  const [config, setConfig] = useState<QRPrintConfig>({
    dataSource: '',
    title: '',
    dataContent: '',
    enabled: false,
  });

  // TODO: RTK Query - setupApi.useGetPrintQRConfigQuery()
  // TODO: RTK Query - setupApi.useSavePrintQRConfigMutation()

  const handleChange = useCallback((field: keyof QRPrintConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:PRINT_QR:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="QR 인쇄 설정"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4 max-w-md flex flex-col gap-4">
          <Checkbox
            checked={config.enabled}
            onChange={(v) => handleChange('enabled', v)}
            label="QR 코드 인쇄 사용"
          />

          <div className="flex flex-col gap-1.5">
            <Label size="xs" weight="medium">데이터 소스</Label>
            <Dropdown
              options={DATA_SOURCE_OPTIONS}
              value={config.dataSource}
              onChange={(v) => handleChange('dataSource', v)}
            />
          </div>

          <TextInput
            label="QR 타이틀"
            value={config.title}
            onChange={(v) => handleChange('title', v)}
            fullWidth
          />

          <div className="flex flex-col gap-1.5">
            <Label size="xs" weight="medium">QR 데이터</Label>
            <textarea
              className="w-full rounded-lg bg-pos-bg shadow-pos-soft px-3 py-2 text-sm text-pos-text outline-none focus:shadow-pos-card"
              rows={4}
              value={config.dataContent}
              onChange={(e) => handleChange('dataContent', e.target.value)}
              placeholder="QR 코드에 포함할 데이터를 입력하세요"
            />
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
