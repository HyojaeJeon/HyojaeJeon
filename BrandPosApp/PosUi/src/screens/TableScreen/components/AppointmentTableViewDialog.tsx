'use client';

/**
 * AppointmentTableViewDialog (TBL-07 / CAppointTableviewDlg)
 *
 * 예약 현황 테이블 뷰 팝업.
 * 테이블 그리드에 예약 현황을 오버레이 표시.
 * 시간대별 예약 상태를 시각적으로 확인.
 *
 * Legacy: CAppointTableviewDlg
 * Bridge: TABLE:APPOINTMENT:GET_TABLE_VIEW
 */

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ───

interface AppointmentSlot {
  appointmentId: string;
  customerName: string;
  appointmentTime: string;
  partySize: number;
  status: 'RESERVED' | 'CONFIRMED' | 'CANCELLED';
}

interface TableAppointmentView {
  tableId: number;
  tableCode: string;
  tableName: string;
  appointments: AppointmentSlot[];
}

interface AppointmentTableViewDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectAppointment?: (appointmentId: string) => void;
}

// ─── Status Colors ───

const STATUS_COLORS: Record<string, string> = {
  RESERVED: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  CONFIRMED: 'bg-green-100 border-green-400 text-green-800',
  CANCELLED: 'bg-gray-100 border-gray-300 text-gray-500',
};

// ─── Component ───

export default function AppointmentTableViewDialog({
  open,
  onClose,
  onSelectAppointment,
}: AppointmentTableViewDialogProps) {
  const [viewDate, setViewDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [tableViews, setTableViews] = useState<TableAppointmentView[]>([]);

  // TODO: RTK Query - tableApi.useGetAppointmentTableViewQuery({ date: viewDate })

  const handleDateChange = useCallback((date: string) => {
    setViewDate(date);
    // TODO: 날짜 변경 시 재조회
  }, []);

  const handleClickAppointment = useCallback(
    (appointmentId: string) => {
      onSelectAppointment?.(appointmentId);
    },
    [onSelectAppointment]
  );

  return (
    <Modal open={open} onClose={onClose} title="예약 현황 (테이블 뷰)">
      <div className="flex flex-col gap-3 p-4">
        {/* 날짜 선택 */}
        <div className="flex items-end gap-2">
          <TextInput
            label="날짜"
            value={viewDate}
            onChange={handleDateChange}
            placeholder="YYYY-MM-DD"
          />
        </div>

        {/* 테이블 그리드 + 예약 오버레이 */}
        <div className="max-h-72 overflow-auto rounded border border-pos-border">
          <div className="grid grid-cols-4 gap-2 p-2">
            {tableViews.map((tv) => (
              <div
                key={tv.tableId}
                className="rounded border border-pos-border bg-pos-surface p-2"
              >
                <div className="mb-1 text-center text-sm font-bold text-pos-text">
                  {tv.tableName}
                </div>
                {tv.appointments.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {tv.appointments.map((slot) => (
                      <button
                        key={slot.appointmentId}
                        className={`rounded border px-1 py-0.5 text-left text-xs ${
                          STATUS_COLORS[slot.status] || ''
                        }`}
                        onClick={() => handleClickAppointment(slot.appointmentId)}
                      >
                        <div className="font-medium">{slot.appointmentTime}</div>
                        <div>
                          {slot.customerName} ({slot.partySize}명)
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-pos-text-muted">
                    예약 없음
                  </div>
                )}
              </div>
            ))}
            {tableViews.length === 0 && (
              <div className="col-span-4 py-8 text-center text-sm text-pos-text-muted">
                테이블 예약 현황이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-yellow-400 bg-yellow-100" />
            예약됨
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-green-400 bg-green-100" />
            확정
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-gray-300 bg-gray-100" />
            취소
          </span>
        </div>

        {/* 닫기 */}
        <div className="flex justify-end border-t border-pos-border pt-3">
          <Button variant="secondary" onClick={onClose}>닫기</Button>
        </div>
      </div>
    </Modal>
  );
}
