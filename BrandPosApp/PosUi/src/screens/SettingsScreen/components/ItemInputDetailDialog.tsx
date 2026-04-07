'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

/**
 * ItemInputDetailDialog -- Item detail settings (most complex settings screen)
 *
 * Design doc: set-iteminput-detail.md (SCR-SET-ITEMDETAIL)
 * Legacy: IDD_ITEMINPUT_DETAIL (resource 130, 121 UI elements)
 */

interface ItemInputDetailDialogProps {
  onClose: () => void;
}

type SectionId =
  | 'color'
  | 'menuDiscount'
  | 'priceChange'
  | 'stock'
  | 'sizePrice'
  | 'store'
  | 'point'
  | 'vat'
  | 'orderPrinter'
  | 'itemType'
  | 'image'
  | 'timePrice';

interface SectionConfig {
  id: SectionId;
  label: string;
  priority: 'P0' | 'P1' | 'P2';
}

const SECTIONS: SectionConfig[] = [
  { id: 'color', label: '색상', priority: 'P1' },
  { id: 'menuDiscount', label: '메뉴할인', priority: 'P1' },
  { id: 'priceChange', label: '금액변경', priority: 'P1' },
  { id: 'stock', label: '재고관리', priority: 'P1' },
  { id: 'sizePrice', label: '사이즈별가격', priority: 'P1' },
  { id: 'store', label: '매장별설정', priority: 'P2' },
  { id: 'point', label: '포인트', priority: 'P1' },
  { id: 'vat', label: '부가세', priority: 'P0' },
  { id: 'orderPrinter', label: '주문프린터', priority: 'P1' },
  { id: 'itemType', label: '상품유형', priority: 'P1' },
  { id: 'image', label: '이미지', priority: 'P2' },
  { id: 'timePrice', label: '시간별가격', priority: 'P2' },
];

export default function ItemInputDetailDialog({ onClose }: ItemInputDetailDialogProps) {
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
    new Set(['vat', 'color', 'menuDiscount'])
  );

  const handleSaveAll = useCallback(() => {}, []);
  const handleBatchApply = useCallback((_sectionId: SectionId, _scope: 'group' | 'all') => {}, []);
  const toggleSection = useCallback((sectionId: SectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  return (
    <FullScreenPanel
      open
      onClose={onClose}
      title="상품 상세설정"
      footer={
        <Button size="sm" variant="primary" onClick={handleSaveAll}>저장</Button>
      }
    >
      <div className="flex h-full flex-col gap-4">
        {/* Item info */}
        <div className="text-sm text-pos-text-muted">상품명: -- 판매가: --</div>

        {/* Sections accordion */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-3">
            {SECTIONS.map((section) => (
              <div key={section.id} className="rounded-xl bg-pos-bg shadow-pos-card">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-pos-text"
                  onClick={() => toggleSection(section.id)}
                >
                  <span>{section.label}</span>
                  <span className="text-xs text-pos-text-muted">
                    {expandedSections.has(section.id) ? '▼' : '▶'}
                  </span>
                </button>

                {expandedSections.has(section.id) && (
                  <div className="p-3">
                    <p className="mb-2 text-xs text-pos-text-muted">
                      {section.label} 설정 필드가 여기에 표시됩니다.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBatchApply(section.id, 'group')}
                      >
                        그룹적용
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBatchApply(section.id, 'all')}
                      >
                        전체적용
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
