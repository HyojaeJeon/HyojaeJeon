'use client';

/**
 * PrintMessageDialog (SET-PRINTMSG-DLG / PRINTMSG_DLG)
 *
 * 영수증 하단 커스텀 메시지 5개 편집.
 *
 * Legacy: IDD_PRINTMSG_DLG
 * Bridge: SETUP:PRINT_MSG:GET_CONFIG, SETUP:PRINT_MSG:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import Label from '@shared/ui/atoms/Label';

// ─── Types ───

interface PrintMessages {
  message1: string;
  message2: string;
  message3: string;
  message4: string;
  message5: string;
}

interface PrintMessageDialogProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ───

export default function PrintMessageDialog({
  open,
  onClose,
}: PrintMessageDialogProps) {
  const [messages, setMessages] = useState<PrintMessages>({
    message1: '',
    message2: '',
    message3: '',
    message4: '',
    message5: '',
  });

  // TODO: RTK Query - setupApi.useGetPrintMsgConfigQuery()
  // TODO: RTK Query - setupApi.useSavePrintMsgConfigMutation()

  const handleChange = useCallback((field: keyof PrintMessages, value: string) => {
    setMessages((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:PRINT_MSG:SAVE 호출
  }, [messages]);

  const textareaCls =
    'w-full rounded-lg bg-pos-bg shadow-pos-soft px-3 py-2 text-sm text-pos-text outline-none focus:shadow-pos-card';

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="인쇄 메시지 설정"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {/* 소형 메시지 1~3 */}
          <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
            <Label size="sm" weight="semibold">영수증 메시지 (소형)</Label>
            <div className="mt-3 flex flex-col gap-3">
              {([1, 2, 3] as const).map((n) => {
                const key = `message${n}` as keyof PrintMessages;
                return (
                  <div key={key}>
                    <Label size="xs" color="muted">메시지 {n}</Label>
                    <textarea
                      className={textareaCls}
                      rows={2}
                      value={messages[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 대형 메시지 4~5 */}
          <div className="rounded-2xl bg-pos-surface shadow-pos-card p-4">
            <Label size="sm" weight="semibold">광고/프로모션 메시지 (대형)</Label>
            <div className="mt-3 flex flex-col gap-3">
              {([4, 5] as const).map((n) => {
                const key = `message${n}` as keyof PrintMessages;
                return (
                  <div key={key}>
                    <Label size="xs" color="muted">메시지 {n}</Label>
                    <textarea
                      className={textareaCls}
                      rows={4}
                      value={messages[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
