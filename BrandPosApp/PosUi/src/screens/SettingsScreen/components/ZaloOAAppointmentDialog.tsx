'use client';

/**
 * ZaloOAAppointmentDialog (SET-ZALOOA-APPOINTMENT-DLG / ZALOOA_APPOINTMENT_DLG)
 *
 * Zalo OA 예약 알림 템플릿 필드 매핑 설정 모달.
 * 4개 필드: 예약코드, 주소, 예약시간, 고객이름.
 *
 * Legacy: IDD_ZALOOA_APPOINTMENT_DLG
 * Bridge: SETUP:ZALO_OA_APPOINTMENT:GET_CONFIG, SETUP:ZALO_OA_APPOINTMENT:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ───

interface AppointmentTemplateMapping {
  appointmentCode: string;
  address: string;
  appointmentTime: string;
  customerName: string;
}

interface ZaloOAAppointmentDialogProps {
  open?: boolean;
  onClose: () => void;
  onSave?: (mapping: AppointmentTemplateMapping) => void;
}

const INITIAL_MAPPING: AppointmentTemplateMapping = {
  appointmentCode: '',
  address: '',
  appointmentTime: '',
  customerName: '',
};

const FIELDS: { key: keyof AppointmentTemplateMapping; label: string }[] = [
  { key: 'appointmentCode', label: '예약코드' },
  { key: 'address', label: '주소' },
  { key: 'appointmentTime', label: '예약시간' },
  { key: 'customerName', label: '고객이름' },
];

// ─── Component ───

export default function ZaloOAAppointmentDialog({
  open = true,
  onClose,
  onSave,
}: ZaloOAAppointmentDialogProps) {
  const [mapping, setMapping] = useState<AppointmentTemplateMapping>(INITIAL_MAPPING);

  // TODO: RTK Query - setupApi.useGetZaloOAAppointmentConfigQuery()
  // TODO: RTK Query - setupApi.useSaveZaloOAAppointmentConfigMutation()

  const handleChange = useCallback((field: keyof AppointmentTemplateMapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:ZALO_OA_APPOINTMENT:SAVE 호출
    onSave?.(mapping);
  }, [mapping, onSave]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="Zalo OA 예약 템플릿 매핑"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 flex flex-col gap-3">
          {FIELDS.map((f) => (
            <TextInput
              key={f.key}
              label={f.label}
              value={mapping[f.key]}
              onChange={(v) => handleChange(f.key, v)}
              placeholder="Zalo 템플릿 변수명 입력"
            />
          ))}
        </div>
      </div>
    </FullScreenPanel>
  );
}
