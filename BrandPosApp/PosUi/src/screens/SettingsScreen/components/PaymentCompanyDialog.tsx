'use client';

/**
 * PaymentCompanyDialog (SET-PAYCOSET-DLG / PAYCOSET_DLG)
 *
 * 결제사 연동 설정(PAYCO/vCAT/vORDER/간편결제)과 사용자 정의 결제 과목(4개).
 * 좌측: PAYCO 설정 그룹 (조건부), 우측: 사용자결제 과목 입력.
 *
 * Legacy: IDD_PAYCOSET_DLG
 * Bridge: SETUP:PAYMENT_CO:GET_CONFIG, SETUP:PAYMENT_CO:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ───

interface PaymentCoConfig {
  paycoBusinessNo: string;
  vcatEnabled: boolean;
  vanType: string;
  vanPort: string;
  vorderEnabled: boolean;
  simplePayType: string;
  userPayTitle1: string;
  userPayTitle2: string;
  userPayTitle3: string;
  userPayTitle4: string;
}

interface PaymentCompanyDialogProps {
  open?: boolean;
  onClose: () => void;
  showPaycoSection?: boolean;
}

const VAN_OPTIONS = [
  { value: 'kcp', label: 'KCP' },
  { value: 'nice', label: 'NICE' },
  { value: 'ksnet', label: 'KSNET' },
];

// ─── Component ───

export default function PaymentCompanyDialog({
  open = true,
  onClose,
  showPaycoSection = false,
}: PaymentCompanyDialogProps) {
  const [config, setConfig] = useState<PaymentCoConfig>({
    paycoBusinessNo: '',
    vcatEnabled: false,
    vanType: '',
    vanPort: '',
    vorderEnabled: false,
    simplePayType: '',
    userPayTitle1: '',
    userPayTitle2: '',
    userPayTitle3: '',
    userPayTitle4: '',
  });

  // TODO: RTK Query - setupApi.useGetPaymentCoConfigQuery()
  // TODO: RTK Query - setupApi.useSavePaymentCoConfigMutation()

  const handleChange = useCallback((field: keyof PaymentCoConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:PAYMENT_CO:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="결제사 설정"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex gap-4">
          {showPaycoSection && (
            <div className="flex-1 rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
              <Label>PAYCO 설정</Label>
              <TextInput
                label="사업자번호"
                value={config.paycoBusinessNo}
                onChange={(v) => handleChange('paycoBusinessNo', v)}
              />
              <Checkbox
                label="vCAT 사용"
                checked={config.vcatEnabled}
                onChange={(c) => handleChange('vcatEnabled', c)}
              />
              <div className="flex flex-col gap-1">
                <Label>VAN사</Label>
                <Dropdown
                  options={VAN_OPTIONS}
                  value={config.vanType}
                  onChange={(v) => handleChange('vanType', v)}
                  placeholder="선택"
                />
              </div>
              <TextInput
                label="포트"
                value={config.vanPort}
                onChange={(v) => handleChange('vanPort', v)}
              />
              <Checkbox
                label="vORDER 사용"
                checked={config.vorderEnabled}
                onChange={(c) => handleChange('vorderEnabled', c)}
              />
            </div>
          )}

          <div className="flex-1 rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
            <Label>사용자 결제 과목</Label>
            <TextInput
              label="과목 1"
              value={config.userPayTitle1}
              onChange={(v) => handleChange('userPayTitle1', v)}
            />
            <TextInput
              label="과목 2"
              value={config.userPayTitle2}
              onChange={(v) => handleChange('userPayTitle2', v)}
            />
            <TextInput
              label="과목 3"
              value={config.userPayTitle3}
              onChange={(v) => handleChange('userPayTitle3', v)}
            />
            <TextInput
              label="과목 4"
              value={config.userPayTitle4}
              onChange={(v) => handleChange('userPayTitle4', v)}
            />
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
