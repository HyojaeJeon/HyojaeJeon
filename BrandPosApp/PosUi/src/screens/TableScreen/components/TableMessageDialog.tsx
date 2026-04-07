'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';
import Label from '@shared/ui/atoms/Label';
import TextInput from '@shared/ui/atoms/TextInput';

/**
 * TableMessageDialog -- 테이블 메시지 설정 모달 (레거시 IDD_TABLEMSG_DLG)
 *
 * 선택된 테이블에 메시지(메모)를 설정/편집하는 모달.
 * 테이블별 특이사항이나 고객 요청을 기록한다.
 *
 * Bridge Commands:
 *   TABLE:SET_MESSAGE
 */

// ─── Types ───

interface MessageItem {
  id: string;
  text: string;
}

interface TableMessageDialogProps {
  tableId: number;
  tableName: string;
  initialMessage: string;
  onClose: () => void;
  onSave: (tableId: number, message: string) => void;
}

// ─── Component ───

export default function TableMessageDialog({
  tableId,
  tableName,
  initialMessage,
  onClose,
  onSave,
}: TableMessageDialogProps) {
  // 편집 중 메시지 목록 (그리드 형태로 여러 행)
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    if (!initialMessage) return [{ id: '1', text: '' }];
    // 초기 메시지를 줄별로 분리
    const lines = initialMessage.split('\n').filter(Boolean);
    return lines.length > 0
      ? lines.map((text, i) => ({ id: String(i + 1), text }))
      : [{ id: '1', text: '' }];
  });
  const [newMessageText, setNewMessageText] = useState('');

  // ─── Handlers ───

  const handleUpdateMessage = useCallback((id: string, text: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));
  }, []);

  const handleDeleteMessage = useCallback((id: string) => {
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      return filtered.length > 0 ? filtered : [{ id: '1', text: '' }];
    });
  }, []);

  const handleAddMessage = useCallback(() => {
    if (!newMessageText.trim()) return;
    const newId = String(Date.now());
    setMessages((prev) => [...prev, { id: newId, text: newMessageText.trim() }]);
    setNewMessageText('');
  }, [newMessageText]);

  const handleSave = useCallback(() => {
    // 모든 메시지를 줄바꿈으로 합쳐서 저장
    const combined = messages
      .map((m) => m.text.trim())
      .filter(Boolean)
      .join('\n');
    // TODO: TABLE:SET_MESSAGE Bridge command -> SetTableMessageUseCase
    // Request: { tableId, message: combined }
    // Response: { table: { id, message } }
    onSave(tableId, combined);
  }, [messages, tableId, onSave]);

  // ─── Render ───

  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onClose}>
        취소
      </Button>
      <Button variant="primary" size="sm" onClick={handleSave}>
        저장
      </Button>
    </>
  );

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`테이블 메시지 - ${tableName}`}
      footer={footer}
      size="md"
    >
      <div className="space-y-4">
        {/* 테이블 정보 */}
        <div className="flex items-center gap-2">
          <Label size="xs" color="muted">테이블:</Label>
          <Label size="md" weight="bold">{tableName}</Label>
        </div>

        {/* 메시지 목록 (편집 가능 그리드) */}
        <div className="space-y-2">
          <Label size="xs" weight="semibold" color="secondary">메시지 목록</Label>
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-center gap-2">
              <div className="flex-1">
                <TextInput
                  value={msg.text}
                  onChange={(value) => handleUpdateMessage(msg.id, value)}
                  placeholder="메시지 입력..."
                  fullWidth
                />
              </div>
              <button
                type="button"
                onClick={() => handleDeleteMessage(msg.id)}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-pos-sm text-pos-text-muted active:bg-red-50 active:text-pos-error cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 새 메시지 추가 */}
        <div className="flex items-center gap-2 pt-2 border-t border-pos-border">
          <div className="flex-1">
            <TextInput
              value={newMessageText}
              onChange={setNewMessageText}
              placeholder="새 메시지 추가..."
              fullWidth
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddMessage}
            disabled={!newMessageText.trim()}
          >
            추가
          </Button>
        </div>

        {/* 안내 */}
        <div className="pt-2">
          <Label size="xs" color="muted">
            메시지는 다른 POS에서도 확인할 수 있습니다. 빈 메시지 저장 시 기존 메시지가 삭제됩니다.
          </Label>
        </div>
      </div>
    </Modal>
  );
}
