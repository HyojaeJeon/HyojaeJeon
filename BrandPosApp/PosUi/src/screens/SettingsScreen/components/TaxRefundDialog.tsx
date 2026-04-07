'use client';

/**
 * TaxRefundDialog (SET-PAY-TAXREF / PAY_TAXREF)
 *
 * 전자세금계산서 발행사 선택, 인증 정보, 인보이스 설정, 세금 조정 옵션.
 * 한국(면세)과 베트남(전자세금계산서) 지역별 조건부 표시.
 *
 * Legacy: IDD_PAY_TAXREF
 * Bridge: SETUP:TAX:GET_CONFIG, SETUP:TAX:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ───

interface TaxConfig {
  issuerType: string;
  userName: string;
  password: string;
  invoiceType: string;
  invoiceTemplate: string;
  invoiceSeries: string;
  taxAdjustEnabled: boolean;
  taxAdjustRate: number;
  taxExemptEnabled: boolean;
}

interface TaxRefundDialogProps {
  open?: boolean;
  onClose: () => void;
  region?: 'KR' | 'VN';
  onOpenSellerConfig?: () => void;
}

const ISSUER_OPTIONS = [
  { value: 'vnpt', label: 'VNPT' },
  { value: 'bkav', label: 'BKAV' },
  { value: 'viettel', label: 'Viettel' },
];

// ─── Component ───

export default function TaxRefundDialog({
  open = true,
  onClose,
  region = 'VN',
  onOpenSellerConfig,
}: TaxRefundDialogProps) {
  const [config, setConfig] = useState<TaxConfig>({
    issuerType: '',
    userName: '',
    password: '',
    invoiceType: '',
    invoiceTemplate: '',
    invoiceSeries: '',
    taxAdjustEnabled: false,
    taxAdjustRate: 0,
    taxExemptEnabled: false,
  });

  // TODO: RTK Query - setupApi.useGetTaxConfigQuery()
  // TODO: RTK Query - setupApi.useSaveTaxConfigMutation()

  const handleChange = useCallback((field: keyof TaxConfig, value: string | boolean | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:TAX:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="세금 설정"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {region === 'VN' && (
            <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
              <Label>발행사 설정</Label>
              <div className="flex flex-col gap-1">
                <Label>발행사</Label>
                <Dropdown
                  options={ISSUER_OPTIONS}
                  value={config.issuerType}
                  onChange={(v) => handleChange('issuerType', v)}
                  placeholder="선택"
                />
              </div>
              <TextInput
                label="UserName"
                value={config.userName}
                onChange={(v) => handleChange('userName', v)}
              />
              <TextInput
                label="Password"
                value={config.password}
                onChange={(v) => handleChange('password', v)}
              />
            </div>
          )}

          {region === 'VN' && (
            <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
              <Label>인보이스 설정</Label>
              <TextInput
                label="Type"
                value={config.invoiceType}
                onChange={(v) => handleChange('invoiceType', v)}
              />
              <TextInput
                label="Template"
                value={config.invoiceTemplate}
                onChange={(v) => handleChange('invoiceTemplate', v)}
              />
              <TextInput
                label="Series"
                value={config.invoiceSeries}
                onChange={(v) => handleChange('invoiceSeries', v)}
              />
            </div>
          )}

          <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
            <Label>세금 조정</Label>
            <Checkbox
              label="세금 조정 사용"
              checked={config.taxAdjustEnabled}
              onChange={(c) => handleChange('taxAdjustEnabled', c)}
            />
            {config.taxAdjustEnabled && (
              <TextInput
                label="조정 비율 (%)"
                value={String(config.taxAdjustRate)}
                onChange={(v) => handleChange('taxAdjustRate', Number(v))}
              />
            )}
            {region === 'KR' && (
              <Checkbox
                label="면세 사용"
                checked={config.taxExemptEnabled}
                onChange={(c) => handleChange('taxExemptEnabled', c)}
              />
            )}
          </div>

          {region === 'VN' && onOpenSellerConfig && (
            <Button variant="secondary" onClick={onOpenSellerConfig}>
              판매자 설정
            </Button>
          )}
        </div>
      </div>
    </FullScreenPanel>
  );
}
