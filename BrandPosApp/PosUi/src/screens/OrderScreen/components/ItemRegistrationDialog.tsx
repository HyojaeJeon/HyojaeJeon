'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// ─── Types ────────────────────────────────────────────
interface ItemRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ItemFormData>;
  onSave?: (data: ItemFormData) => void;
}

interface ItemFormData {
  barcode: string;
  name: string;
  salePrice: number;
  costPrice: number;
  groupName: string;
  groupCode: string;
}

// ─── ItemRegistrationDialog ───────────────────────────
export default function ItemRegistrationDialog({
  open,
  onClose,
  initialData,
  onSave,
}: ItemRegistrationDialogProps) {
  const [barcode, setBarcode] = useState(initialData?.barcode ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [salePrice, setSalePrice] = useState(initialData?.salePrice ?? 0);
  const [costPrice, setCostPrice] = useState(initialData?.costPrice ?? 0);
  const [groupName, setGroupName] = useState(initialData?.groupName ?? '');
  const [groupCode, setGroupCode] = useState(initialData?.groupCode ?? '');

  // TODO: store config for showing cost price field
  const [showCostPrice] = useState(false);

  const handleSave = useCallback(() => {
    // TODO: ITEM:REGISTER bridge call
    // TODO: validate required fields (name, salePrice > 0)
    if (!name.trim()) return;
    if (salePrice <= 0) return;

    const data: ItemFormData = {
      barcode,
      name,
      salePrice,
      costPrice,
      groupName,
      groupCode,
    };
    onSave?.(data);
    onClose();
  }, [barcode, name, salePrice, costPrice, groupName, groupCode, onSave, onClose]);

  const handleGroupSelect = useCallback(() => {
    // TODO: open GroupSelectModal
  }, []);

  const handleKeyboard = useCallback(() => {
    // TODO: open VirtualKeyboard
  }, []);

  const handleItemSearch = useCallback(() => {
    // TODO: open ItemSearchDialog (F5)
  }, []);

  const handleShelfLabel = useCallback(() => {
    // TODO: print shelf label (F6) via Device/Printer
  }, []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="상품 등록"
      size="md"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSave}>
            저장
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Barcode */}
        <div>
          <label className="block text-xs font-semibold text-pos-text mb-1">바코드</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="바코드 입력 또는 스캔"
              className="flex-1 h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text placeholder:text-pos-text-muted"
            />
            <Button variant="secondary" size="md" onClick={handleKeyboard}>
              키보드
            </Button>
          </div>
        </div>

        {/* Item name */}
        <div>
          <label className="block text-xs font-semibold text-pos-text mb-1">상품명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="상품명 입력"
            className="w-full h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text placeholder:text-pos-text-muted"
          />
        </div>

        {/* Sale price */}
        <div>
          <label className="block text-xs font-semibold text-pos-text mb-1">판매가</label>
          <input
            type="number"
            value={salePrice || ''}
            onChange={(e) => setSalePrice(Number(e.target.value))}
            placeholder="0"
            className="w-full h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text text-right tabular-nums placeholder:text-pos-text-muted"
          />
        </div>

        {/* Cost price (conditionally shown) */}
        {showCostPrice && (
          <div>
            <label className="block text-xs font-semibold text-pos-text mb-1">원가</label>
            <input
              type="number"
              value={costPrice || ''}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              placeholder="0"
              className="w-full h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text text-right tabular-nums placeholder:text-pos-text-muted"
            />
          </div>
        )}

        {/* Category selection */}
        <div>
          <label className="block text-xs font-semibold text-pos-text mb-1">대분류</label>
          <div className="flex gap-2 items-center">
            <div className="flex-1 h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 flex items-center text-xs text-pos-text">
              {groupName || '분류를 선택하세요'}
            </div>
            <Button variant="secondary" size="md" onClick={handleGroupSelect}>
              분류선택
            </Button>
          </div>
        </div>

        {/* Hidden buttons (F5, F6) - available via keyboard shortcut or config */}
        {/* TODO: expose via config toggle */}
      </div>
    </Modal>
  );
}
