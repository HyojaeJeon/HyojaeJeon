'use client';

/**
 * PrintRegDialog (SET-PRINTREG-DLG / PRINTREG_DLG)
 *
 * 프린터 등록/삭제/설정 관리.
 *
 * Legacy: IDD_PRINTREG_DLG
 * Bridge: SETUP:PRINTER:GET_LIST, SETUP:PRINTER:SAVE, SETUP:PRINTER:DELETE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Checkbox from '@shared/ui/atoms/Checkbox';
import Dropdown from '@shared/ui/molecules/Dropdown';

// ─── Types ───

type ConnectionType = 'serial' | 'network';

interface PrinterEntry {
  id: string;
  printerName: string;
  connectionType: ConnectionType;
  comPort: string;
  ipAddress: string;
  baudRate: string;
  driver: string;
  posOutput: boolean;
}

interface PrintRegDialogProps {
  open: boolean;
  onClose: () => void;
}

const BAUD_RATES = ['9600', '19200', '38400', '57600', '115200'];
const BAUD_OPTIONS = BAUD_RATES.map((br) => ({ value: br, label: br }));
const CONNECTION_OPTIONS = [
  { value: 'serial', label: '시리얼' },
  { value: 'network', label: '네트워크' },
];

// ─── Component ───

export default function PrintRegDialog({
  open,
  onClose,
}: PrintRegDialogProps) {
  const [printers, setPrinters] = useState<PrinterEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<PrinterEntry | null>(null);

  // TODO: RTK Query - setupApi.useGetPrinterListQuery()
  // TODO: RTK Query - setupApi.useSavePrinterMutation()
  // TODO: RTK Query - setupApi.useDeletePrinterMutation()

  const handleAdd = useCallback(() => {
    const newPrinter: PrinterEntry = {
      id: crypto.randomUUID(),
      printerName: '',
      connectionType: 'serial',
      comPort: '',
      ipAddress: '',
      baudRate: '9600',
      driver: '',
      posOutput: true,
    };
    setEditEntry(newPrinter);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    // TODO: Bridge SETUP:PRINTER:DELETE 호출
    setPrinters((prev) => prev.filter((p) => p.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const handleSave = useCallback(() => {
    if (!editEntry) return;
    // TODO: Bridge SETUP:PRINTER:SAVE 호출
    setPrinters((prev) => {
      const exists = prev.find((p) => p.id === editEntry.id);
      if (exists) return prev.map((p) => (p.id === editEntry.id ? editEntry : p));
      return [...prev, editEntry];
    });
    setEditEntry(null);
  }, [editEntry]);

  const handleEditChange = useCallback((field: keyof PrinterEntry, value: string | boolean) => {
    setEditEntry((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="프린터 등록"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 flex gap-4">
        {/* 좌측: 프린터 목록 */}
        <div className="w-56 flex flex-col rounded-2xl bg-pos-surface shadow-pos-card overflow-hidden">
          <div className="shrink-0 flex items-center gap-2 p-2">
            <Button size="sm" onClick={handleAdd}>추가</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>삭제</Button>
          </div>
          <ul className="flex-1 min-h-0 overflow-y-auto">
            {printers.map((p) => (
              <li
                key={p.id}
                className={`cursor-pointer px-3 py-2 text-sm text-pos-text ${
                  selectedId === p.id ? 'bg-primary-500/10' : ''
                }`}
                onClick={() => {
                  setSelectedId(p.id);
                  setEditEntry({ ...p });
                }}
              >
                {p.printerName || '(이름 없음)'}
              </li>
            ))}
          </ul>
        </div>

        {/* 우측: 프린터 설정 폼 */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl bg-pos-surface shadow-pos-card p-4">
          {editEntry ? (
            <div className="flex flex-col gap-3 max-w-md">
              <TextInput
                label="프린터명"
                value={editEntry.printerName}
                onChange={(v) => handleEditChange('printerName', v)}
                fullWidth
              />
              <div className="flex flex-col gap-1.5">
                <Label size="xs" weight="medium">연결 타입</Label>
                <Dropdown
                  options={CONNECTION_OPTIONS}
                  value={editEntry.connectionType}
                  onChange={(v) => handleEditChange('connectionType', v)}
                />
              </div>
              {editEntry.connectionType === 'serial' ? (
                <>
                  <TextInput
                    label="COM 포트"
                    value={editEntry.comPort}
                    onChange={(v) => handleEditChange('comPort', v)}
                    fullWidth
                  />
                  <div className="flex flex-col gap-1.5">
                    <Label size="xs" weight="medium">Baudrate</Label>
                    <Dropdown
                      options={BAUD_OPTIONS}
                      value={editEntry.baudRate}
                      onChange={(v) => handleEditChange('baudRate', v)}
                    />
                  </div>
                </>
              ) : (
                <TextInput
                  label="IP 주소"
                  value={editEntry.ipAddress}
                  onChange={(v) => handleEditChange('ipAddress', v)}
                  fullWidth
                />
              )}
              <TextInput
                label="드라이버"
                value={editEntry.driver}
                onChange={(v) => handleEditChange('driver', v)}
                fullWidth
              />
              <Checkbox
                checked={editEntry.posOutput}
                onChange={(v) => handleEditChange('posOutput', v)}
                label="POS 출력 사용"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-pos-text-muted">
              프린터를 선택하거나 추가하세요.
            </div>
          )}
        </div>
      </div>
    </FullScreenPanel>
  );
}
