'use client';

import { useState, useCallback } from 'react';
import { usePosI18n } from '@i18n/PosI18nProvider';
import Modal from '@shared/ui/organisms/Modal';
import Button from '@shared/ui/atoms/Button';

// ─── Types ────────────────────────────────────────────
interface SearchResultItem {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  groupName?: string;
}

interface ItemGroup {
  id: string;
  name: string;
}

interface ItemSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (item: SearchResultItem) => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_GROUPS: ItemGroup[] = [
  { id: 'all', name: 'order.all' },
  { id: 'grp-1', name: 'order.drink' },
  { id: 'grp-2', name: 'order.meal' },
  { id: 'grp-3', name: 'order.dessert' },
];

const STUB_RESULTS: SearchResultItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `item-${i + 1}`,
  name: `검색 상품 ${i + 1}`,
  price: (i + 1) * 2000,
  barcode: `8801234${String(i).padStart(5, '0')}`,
  groupName: STUB_GROUPS[i % 3 + 1].name,
}));

// ─── ItemSearchDialog ─────────────────────────────────
export default function ItemSearchDialog({
  open,
  onClose,
  onSelect,
}: ItemSearchDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { t } = usePosI18n();

  const handleSearch = useCallback(() => {
    // TODO: ITEM:SEARCH bridge call with { keyword, groupId }
    // Stub: filter from local data
    setResults(STUB_RESULTS.filter((item) => {
      if (keyword && !item.name.includes(keyword) && !item.barcode?.includes(keyword)) {
        return false;
      }
      if (selectedGroupId !== 'all') {
        const group = STUB_GROUPS.find((g) => g.id === selectedGroupId);
        if (group && item.groupName !== group.name) return false;
      }
      return true;
    }));
    setHasSearched(true);
    setSelectedItemId(null);
  }, [keyword, selectedGroupId]);

  const handleGroupSearch = useCallback(() => {
    // TODO: open GroupSelectModal for category-based search
  }, []);

  const handleSelect = useCallback(() => {
    if (!selectedItemId) return;
    const item = results.find((r) => r.id === selectedItemId);
    if (item) {
      // TODO: ORDER:ADD_ITEM bridge call
      onSelect?.(item);
      onClose();
    }
  }, [selectedItemId, results, onSelect, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('order.searchTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={handleGroupSearch}>
            {t('order.categorySearch')}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSelect}
            disabled={!selectedItemId}
          >
            {t('common.select')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Filter bar */}
        <div className="flex gap-2 items-center">
          {/* Group filter */}
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text cursor-pointer"
          >
            {STUB_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>{t(group.name)}</option>
            ))}
          </select>

          {/* Search input */}
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder={t('order.menuSearchPlaceholder')}
            className="flex-1 h-touch bg-pos-surface border border-pos-border rounded-pos-btn px-3 text-xs text-pos-text placeholder:text-pos-text-muted"
          />

          {/* Search button */}
          <Button variant="primary" size="md" onClick={handleSearch}>
            {t('order.searchButton')}
          </Button>
        </div>

        {/* Results grid */}
        <div className="border border-pos-border rounded-pos-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_120px_100px] gap-2 px-3 py-2 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted">
            <span>{t('order.itemName')}</span>
            <span className="text-right">{t('order.price')}</span>
            <span>{t('order.barcode')}</span>
            <span>{t('order.group')}</span>
          </div>

          {/* Body */}
          <div className="max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {!hasSearched ? (
              <div className="flex items-center justify-center py-12 text-xs text-pos-text-muted">
                {t('order.searchPrompt')}
              </div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-xs text-pos-text-muted">
                {t('order.noResults')}
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={`
                    w-full grid grid-cols-[1fr_100px_120px_100px] gap-2 px-3 py-2.5 text-xs cursor-pointer
                    transition-colors duration-fast text-left
                    ${selectedItemId === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'}
                  `}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-right tabular-nums">{item.price.toLocaleString()}</span>
                  <span className="tabular-nums text-pos-text-muted">{item.barcode}</span>
                  <span className="text-pos-text-muted">{item.groupName}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
