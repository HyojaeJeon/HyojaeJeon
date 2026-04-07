'use client';

/**
 * CardReaderManagerDialog (SET-CARDREADER-MGR / CARDREADER_MGR)
 *
 * 카드리더기 연동 설정. 뱅크 선택, IP/PORT/KEY.
 * 카드 결제 없이는 매장 운영 불가 -> P0.
 * 한국 전용 7개 필드 조건부 표시.
 *
 * Legacy: IDD_CARDREADER_MGR
 * Bridge: SETUP:CARD_READER:GET_CONFIG, SETUP:CARD_READER:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ───

interface CardReaderConfig {
  bankType: string;
  ipAddress: string;
  port: string;
  key: string;
}

interface CardReaderManagerDialogProps {
  open?: boolean;
  onClose: () => void;
  region?: 'KR' | 'VN';
}

const BANK_OPTIONS = [
  { value: 'bccard', label: 'BC카드' },
  { value: 'kcp', label: 'KCP' },
  { value: 'nice', label: 'NICE' },
  { value: 'bidv', label: 'BIDV' },
];

// ─── Component ───

export default function CardReaderManagerDialog({
  open = true,
  onClose,
  region = 'VN',
}: CardReaderManagerDialogProps) {
  const [config, setConfig] = useState<CardReaderConfig>({
    bankType: '',
    ipAddress: '',
    port: '',
    key: '',
  });

  // TODO: RTK Query - setupApi.useGetCardReaderConfigQuery()
  // TODO: RTK Query - setupApi.useSaveCardReaderConfigMutation()

  const handleChange = useCallback((field: keyof CardReaderConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:CARD_READER:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="카드리더기 설정"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-2">
            <Label>결제 뱅크</Label>
            <Dropdown
              options={BANK_OPTIONS}
              value={config.bankType}
              onChange={(v) => handleChange('bankType', v)}
              placeholder="선택"
            />
          </div>

          <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
            <Label>연결 설정</Label>
            <TextInput
              label="IP 주소"
              value={config.ipAddress}
              onChange={(v) => handleChange('ipAddress', v)}
              placeholder="192.168.0.100"
            />
            <TextInput
              label="PORT"
              value={config.port}
              onChange={(v) => handleChange('port', v)}
            />
            <TextInput
              label="KEY"
              value={config.key}
              onChange={(v) => handleChange('key', v)}
            />
          </div>

          {region === 'KR' && (
            <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-2">
              <Label>한국 전용 설정</Label>
              <div className="text-sm text-pos-text-muted">
                한국 전용 카드리더기 설정 (7개 필드)
              </div>
            </div>
          )}
        </div>
      </div>
    </FullScreenPanel>
  );
}
