'use client';

import { useState, useCallback } from 'react';
import { usePosI18n } from '@i18n/PosI18nProvider';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ────────────────────────────────────────────
interface ServerItem {
  id: string;
  barcode: string;
  itemName: string;
  salePrice: number;
  costPrice: number;
  bigCategory: string;
  midCategory: string;
}

interface GetItemServerDialogProps {
  open: boolean;
  onClose: () => void;
  onSynced?: (count: number) => void;
}

// ─── Stub data ────────────────────────────────────────
const STUB_SERVER_ITEMS: ServerItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `srv-${i + 1}`,
  barcode: `880${String(i + 1).padStart(10, '0')}`,
  itemName: `서버 상품 ${i + 1}`,
  salePrice: (i + 1) * 5000,
  costPrice: (i + 1) * 3000,
  bigCategory: `대분류 ${(i % 3) + 1}`,
  midCategory: `중분류 ${(i % 5) + 1}`,
}));

// ─── Component ────────────────────────────────────────
export default function GetItemServerDialog({
  open,
  onClose,
  onSynced,
}: GetItemServerDialogProps) {
  const { t } = usePosI18n();
  // Form state
  const [barcode, setBarcode] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [bigCategory, setBigCategory] = useState<string>('');
  const [midCategory, setMidCategory] = useState<string>('');

  // Grid state
  const [serverItems] = useState<ServerItem[]>(STUB_SERVER_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // ─── Handlers ─────────────────────────────────────
  const handleSearch = useCallback(() => {
    // TODO: ITEM:SEARCH bridge call with { barcode, itemName }
  }, [barcode, itemName]);

  const handleSave = useCallback(() => {
    // TODO: ITEM:SYNC_FROM_SERVER bridge call
    // Online-only: check connectivity first, block with OFFLINE_BLOCKED if offline
    const syncedCount = serverItems.length;
    onSynced?.(syncedCount);
    onClose();
  }, [serverItems, onSynced, onClose]);

  const handleGetCategories = useCallback(() => {
    // TODO: ITEM:SYNC_FROM_SERVER bridge call for category sync
    setBigCategory('대분류 1');
    setMidCategory('중분류 1');
  }, []);

  const handleSelectItem = useCallback((item: ServerItem) => {
    setSelectedItemId(item.id);
    setBarcode(item.barcode);
    setItemName(item.itemName);
    setSalePrice(String(item.salePrice));
    setCostPrice(String(item.costPrice));
    setBigCategory(item.bigCategory);
    setMidCategory(item.midCategory);
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title={t('stock.title')}
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSave}>{t('stock.save')}</Button>
        </>
      }
    >
      <div className="flex flex-col h-full px-4 py-3 gap-3">
        {/* ─── Form fields ─── */}
        <div className="shrink-0 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {/* Left column */}
          <div className="flex items-center gap-2">
            <span className="w-14 text-pos-text-muted shrink-0">{t('stock.barcode')}</span>
            <TextInput value={barcode} onChange={setBarcode} placeholder={t('stock.barcode')} />
          </div>
          {/* Right column */}
          <div className="flex items-center gap-2">
            <span className="w-14 text-pos-text-muted shrink-0">{t('stock.bigCategory')}</span>
            <span className="font-semibold text-pos-text">{bigCategory || '-'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-14 text-pos-text-muted shrink-0">{t('stock.itemName')}</span>
            <TextInput value={itemName} onChange={setItemName} placeholder={t('stock.itemName')} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 text-pos-text-muted shrink-0">{t('stock.midCategory')}</span>
            <span className="font-semibold text-pos-text">{midCategory || '-'}</span>
            <Button variant="secondary" size="sm" onClick={handleGetCategories}>
              {t('stock.fetchCategories')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-14 text-pos-text-muted shrink-0">{t('stock.salePrice')}</span>
            <TextInput value={salePrice} onChange={setSalePrice} placeholder="0" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleSearch}>{t('stock.search')}</Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-14 text-pos-text-muted shrink-0">{t('stock.costPrice')}</span>
            <TextInput value={costPrice} onChange={setCostPrice} placeholder="0" />
          </div>
          <div />
        </div>

        {/* ─── Server item grid ─── */}
        <div className="flex-1 flex flex-col min-h-0 border border-pos-border rounded-pos-lg overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_80px_80px_80px_80px] gap-2 px-3 py-1.5 bg-pos-surface border-b border-pos-border text-2xs font-semibold text-pos-text-muted shrink-0">
            <span>{t('stock.barcode')}</span>
            <span>{t('stock.itemName')}</span>
            <span className="text-right">{t('stock.salePrice')}</span>
            <span className="text-right">{t('stock.costPrice')}</span>
            <span>{t('stock.bigCategory')}</span>
            <span>{t('stock.midCategory')}</span>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {serverItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-pos-text-muted">
                {t('stock.noServerItems')}
              </div>
            ) : (
              serverItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className={`w-full grid grid-cols-[100px_1fr_80px_80px_80px_80px] gap-2 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                    selectedItemId === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-pos-text active:bg-gray-50'
                  }`}
                >
                  <span className="tabular-nums text-2xs">{item.barcode}</span>
                  <span className="truncate">{item.itemName}</span>
                  <span className="text-right tabular-nums">{item.salePrice.toLocaleString()}</span>
                  <span className="text-right tabular-nums">{item.costPrice.toLocaleString()}</span>
                  <span className="truncate text-2xs">{item.bigCategory}</span>
                  <span className="truncate text-2xs">{item.midCategory}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </FullScreenPanel>
  );
}
