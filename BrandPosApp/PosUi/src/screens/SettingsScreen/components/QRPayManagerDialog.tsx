'use client';

/**
 * QRPayManagerDialog (SET-QRPAY-MGR / QRPAY_MGR)
 *
 * QR 결제(ZaloPay 등) 연동 인증 정보 설정.
 * QR 타입, App User, App ID, KEY1, KEY2. 베트남 매장 필수 -> P0.
 *
 * Legacy: IDD_QRPAY_MGR
 * Bridge: SETUP:QR_PAY:GET_CONFIG, SETUP:QR_PAY:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ───

interface QRPayConfig {
  qrType: string;
  appUser: string;
  appId: string;
  key1: string;
  key2: string;
  bankType: string;
}

interface QRPayManagerDialogProps {
  open?: boolean;
  onClose: () => void;
  region?: 'KR' | 'VN';
}

const QR_TYPE_OPTIONS = [
  { value: 'zalopay', label: 'ZaloPay' },
  { value: 'momo', label: 'MoMo' },
  { value: 'vnpay', label: 'VNPay' },
];

// ─── Component ───

export default function QRPayManagerDialog({
  open = true,
  onClose,
  region = 'VN',
}: QRPayManagerDialogProps) {
  const [config, setConfig] = useState<QRPayConfig>({
    qrType: '',
    appUser: '',
    appId: '',
    key1: '',
    key2: '',
    bankType: '',
  });

  // TODO: RTK Query - setupApi.useGetQRPayConfigQuery()
  // TODO: RTK Query - setupApi.useSaveQRPayConfigMutation()

  const handleChange = useCallback((field: keyof QRPayConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:QR_PAY:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="QR 결제 설정"
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
            <Label>QR 결제 타입</Label>
            <Dropdown
              options={QR_TYPE_OPTIONS}
              value={config.qrType}
              onChange={(v) => handleChange('qrType', v)}
              placeholder="선택"
            />
          </div>

          <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
            <Label>인증 정보</Label>
            <TextInput
              label="App User"
              value={config.appUser}
              onChange={(v) => handleChange('appUser', v)}
            />
            <TextInput
              label="App ID"
              value={config.appId}
              onChange={(v) => handleChange('appId', v)}
            />
            <TextInput
              label="KEY 1"
              value={config.key1}
              onChange={(v) => handleChange('key1', v)}
            />
            <TextInput
              label="KEY 2"
              value={config.key2}
              onChange={(v) => handleChange('key2', v)}
            />
          </div>

          {region === 'KR' && (
            <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-2">
              <Label>한국 전용 설정</Label>
              <div className="text-sm text-pos-text-muted">한국 전용 QR 결제 설정</div>
            </div>
          )}
        </div>
      </div>
    </FullScreenPanel>
  );
}
