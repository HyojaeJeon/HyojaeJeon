'use client';

/**
 * AppointmentDialog (TBL-06 / CAppointmentDlg)
 *
 * 예약 관리 팝업. 예약 등록/수정/삭제.
 * 예약 목록 표시, 신규 예약 폼, 예약 상세 편집.
 *
 * Legacy: CAppointmentDlg
 * Bridge: TABLE:APPOINTMENT:GET_LIST, TABLE:APPOINTMENT:SAVE, TABLE:APPOINTMENT:DELETE
 */

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ───

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  tableCode: string;
  partySize: number;
  note: string;
  status: 'RESERVED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  onAppointmentChange?: () => void;
}

const EMPTY_APPOINTMENT: Omit<Appointment, 'id' | 'status'> = {
  customerName: '',
  customerPhone: '',
  appointmentDate: '',
  appointmentTime: '',
  tableCode: '',
  partySize: 1,
  note: '',
};

// ─── Component ───

export default function AppointmentDialog({
  open,
  onClose,
  initialDate,
  onAppointmentChange,
}: AppointmentDialogProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Appointment, 'id' | 'status'>>({
    ...EMPTY_APPOINTMENT,
    appointmentDate: initialDate || '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // TODO: RTK Query - tableApi.useGetAppointmentListQuery()
  // TODO: RTK Query - tableApi.useSaveAppointmentMutation()
  // TODO: RTK Query - tableApi.useDeleteAppointmentMutation()

  const handleNew = useCallback(() => {
    setSelectedId(null);
    setEditForm({ ...EMPTY_APPOINTMENT, appointmentDate: initialDate || '' });
    setIsEditing(true);
  }, [initialDate]);

  const handleSelectAppointment = useCallback((appt: Appointment) => {
    setSelectedId(appt.id);
    setEditForm({
      customerName: appt.customerName,
      customerPhone: appt.customerPhone,
      appointmentDate: appt.appointmentDate,
      appointmentTime: appt.appointmentTime,
      tableCode: appt.tableCode,
      partySize: appt.partySize,
      note: appt.note,
    });
    setIsEditing(true);
  }, []);

  const handleFormChange = useCallback(
    (field: keyof typeof EMPTY_APPOINTMENT, value: string | number) => {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    // TODO: Bridge TABLE:APPOINTMENT:SAVE 호출
    setIsEditing(false);
    onAppointmentChange?.();
  }, [editForm, selectedId, onAppointmentChange]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    // TODO: 확인 후 Bridge TABLE:APPOINTMENT:DELETE 호출
    setAppointments((prev) => prev.filter((a) => a.id !== selectedId));
    setSelectedId(null);
    setIsEditing(false);
    onAppointmentChange?.();
  }, [selectedId, onAppointmentChange]);

  return (
    <Modal open={open} onClose={onClose} title="예약 관리">
      <div className="flex gap-3 p-4">
        {/* 좌측: 예약 목록 */}
        <div className="w-56 rounded border border-pos-border">
          <div className="flex items-center gap-1 border-b border-pos-border p-1">
            <Button size="sm" onClick={handleNew}>신규</Button>
            <Button size="sm" variant="danger" onClick={handleDelete} disabled={!selectedId}>
              삭제
            </Button>
          </div>
          <ul className="max-h-64 overflow-auto">
            {appointments.map((appt) => (
              <li
                key={appt.id}
                className={`cursor-pointer border-b border-pos-border px-2 py-1.5 text-sm ${
                  selectedId === appt.id ? 'bg-pos-primary/10' : ''
                }`}
                onClick={() => handleSelectAppointment(appt)}
              >
                <div className="font-medium">{appt.customerName}</div>
                <div className="text-xs text-pos-text-muted">
                  {appt.appointmentDate} {appt.appointmentTime} / {appt.partySize}명
                </div>
              </li>
            ))}
            {appointments.length === 0 && (
              <li className="px-2 py-4 text-center text-sm text-pos-text-muted">
                예약이 없습니다.
              </li>
            )}
          </ul>
        </div>

        {/* 우측: 예약 상세/편집 */}
        <div className="flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <TextInput
                label="고객명"
                value={editForm.customerName}
                onChange={(v) => handleFormChange('customerName', v)}
              />
              <TextInput
                label="연락처"
                value={editForm.customerPhone}
                onChange={(v) => handleFormChange('customerPhone', v)}
              />
              <div className="flex gap-2">
                <TextInput
                  label="예약일"
                  value={editForm.appointmentDate}
                  onChange={(v) => handleFormChange('appointmentDate', v)}
                  placeholder="YYYY-MM-DD"
                />
                <TextInput
                  label="예약시간"
                  value={editForm.appointmentTime}
                  onChange={(v) => handleFormChange('appointmentTime', v)}
                  placeholder="HH:MM"
                />
              </div>
              <TextInput
                label="테이블"
                value={editForm.tableCode}
                onChange={(v) => handleFormChange('tableCode', v)}
                placeholder="테이블 코드"
              />
              <TextInput
                label="인원수"
                value={String(editForm.partySize)}
                onChange={(v) => handleFormChange('partySize', Number(v) || 1)}
              />
              <div>
                <label className="mb-1 block text-sm text-pos-text">메모</label>
                <textarea
                  className="w-full rounded border border-pos-border px-2 py-1 text-sm"
                  rows={3}
                  value={editForm.note}
                  onChange={(e) => handleFormChange('note', e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave}>저장</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-pos-text-muted">
              예약을 선택하거나 신규를 눌러 추가하세요.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end border-t border-pos-border p-2">
        <Button variant="secondary" onClick={onClose}>닫기</Button>
      </div>
    </Modal>
  );
}
