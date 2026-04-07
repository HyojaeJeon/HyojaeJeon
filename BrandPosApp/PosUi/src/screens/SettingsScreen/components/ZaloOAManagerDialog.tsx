'use client';

/**
 * ZaloOAManagerDialog (SET-ZALOOA-MGR / ZALOOA_MGR)
 *
 * Zalo OA(Official Account) 메신저 기반 고객 알림 서비스 연동 설정.
 * App ID, App Secret, 결제/예약 템플릿 ID 관리.
 *
 * Legacy: IDD_ZALOOA_MGR
 * Bridge: SETUP:ZALO_OA:GET_CONFIG, SETUP:ZALO_OA:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Checkbox from '@shared/ui/atoms/Checkbox';

// ─── Types ───

interface ZaloOAConfig {
  enabled: boolean;
  appId: string;
  appSecret: string;
  paymentTemplateId: string;
  appointmentTemplateId: string;
}

interface ZaloOAManagerDialogProps {
  open?: boolean;
  onClose: () => void;
  onOpenPaymentTemplate?: () => void;
  onOpenAppointmentTemplate?: () => void;
}

// ─── Component ───

export default function ZaloOAManagerDialog({
  open = true,
  onClose,
  onOpenPaymentTemplate,
  onOpenAppointmentTemplate,
}: ZaloOAManagerDialogProps) {
  const [config, setConfig] = useState<ZaloOAConfig>({
    enabled: false,
    appId: '',
    appSecret: '',
    paymentTemplateId: '',
    appointmentTemplateId: '',
  });

  // TODO: RTK Query - setupApi.useGetZaloOAConfigQuery()
  // TODO: RTK Query - setupApi.useSaveZaloOAConfigMutation()

  const handleChange = useCallback((field: keyof ZaloOAConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:ZALO_OA:SAVE 호출
  }, [config]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="Zalo OA 설정"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-pos-bg shadow-pos-card p-4">
            <Checkbox
              label="Zalo OA 사용"
              checked={config.enabled}
              onChange={(c) => handleChange('enabled', c)}
            />
          </div>

          <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
            <Label>인증 정보</Label>
            <TextInput
              label="App ID"
              value={config.appId}
              onChange={(v) => handleChange('appId', v)}
            />
            <TextInput
              label="App Secret"
              value={config.appSecret}
              onChange={(v) => handleChange('appSecret', v)}
            />
          </div>

          <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
            <Label>템플릿 설정</Label>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <TextInput
                  label="결제 Template ID"
                  value={config.paymentTemplateId}
                  onChange={(v) => handleChange('paymentTemplateId', v)}
                />
              </div>
              {onOpenPaymentTemplate && (
                <Button size="sm" variant="secondary" onClick={onOpenPaymentTemplate}>
                  Change
                </Button>
              )}
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <TextInput
                  label="예약 Template ID"
                  value={config.appointmentTemplateId}
                  onChange={(v) => handleChange('appointmentTemplateId', v)}
                />
              </div>
              {onOpenAppointmentTemplate && (
                <Button size="sm" variant="secondary" onClick={onOpenAppointmentTemplate}>
                  Change
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
