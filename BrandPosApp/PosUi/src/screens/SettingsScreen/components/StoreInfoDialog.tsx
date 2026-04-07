'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';
import Dropdown from '@shared/ui/molecules/Dropdown';

/**
 * StoreInfoDialog -- Store info master-detail settings
 *
 * Design doc: set-storeinfo.md (SCR-SET-STOREINFO)
 * Legacy: IDD_STOREINFO (resource 151)
 *
 * Left panel: Store list grid (DataGrid)
 * Right panel: Store detail form (name, bizNo, condition, type, president, tel, phone, addr, mainStore)
 *
 * Bridge Commands:
 *   SETUP:STORE:SAVE, SETUP:STORE:DELETE, SETUP:STORE:GET_INFO
 *
 * RTK Query: setupStoreApi.getStoreList, getStoreInfo, saveStore, deleteStore
 * UseCase: SaveStoreInfoUseCase, GetStoreInfoUseCase
 * Outbox: Store info changes are synced to CentralApi
 */

interface StoreInfoDialogProps {
  open?: boolean;
  onClose: () => void;
}

interface StoreForm {
  storeNo: string;
  name: string;
  bizNo: string;
  condition: string;
  type: string;
  president: string;
  tel: string;
  phone: string;
  addr: string;
  mainStoreId: string;
}

const TEXT_FIELDS: { key: keyof StoreForm; label: string }[] = [
  { key: 'name', label: '상호명' },
  { key: 'bizNo', label: '사업자번호' },
  { key: 'condition', label: '업태' },
  { key: 'type', label: '업종' },
  { key: 'president', label: '대표자' },
  { key: 'tel', label: '전화번호' },
  { key: 'phone', label: '휴대폰' },
  { key: 'addr', label: '주소' },
];

export default function StoreInfoDialog({ open = true, onClose }: StoreInfoDialogProps) {
  const [, setSelectedStoreId] = useState<string | null>(null);
  const [form, setForm] = useState<StoreForm>({
    storeNo: '',
    name: '',
    bizNo: '',
    condition: '',
    type: '',
    president: '',
    tel: '',
    phone: '',
    addr: '',
    mainStoreId: '',
  });

  // TODO: Load store list with setupStoreApi.getStoreList
  // TODO: Load store detail on selection with setupStoreApi.getStoreInfo

  const handleChange = useCallback((field: keyof StoreForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Call setupStoreApi.saveStore mutation
    // TODO: Outbox record created for CentralApi sync
  }, []);

  const handleDelete = useCallback(() => {
    // TODO: Call setupStoreApi.deleteStore mutation
    // TODO: Validate main store cannot be deleted (IN_USE error)
  }, []);

  // TODO: store selection handler will be wired to grid
  void setSelectedStoreId;

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="매장 정보 설정"
      subtitle="SCR-SET-STOREINFO"
      footer={
        <>
          <Button variant="danger" size="sm" onClick={handleDelete}>삭제</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>추가/저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex h-full gap-4 min-h-0">
        {/* Left: Store list grid */}
        <div className="flex w-1/3 flex-col rounded-2xl bg-pos-surface shadow-pos-card overflow-hidden">
          <div className="px-3 py-2 text-sm font-semibold text-pos-text bg-pos-bg">
            매장 목록
          </div>
          <div className="flex-1 overflow-auto p-2">
            {/* TODO: DataGrid with store list from setupStoreApi.getStoreList */}
            <p className="text-sm text-pos-text-muted">매장 목록이 여기에 표시됩니다.</p>
          </div>
        </div>

        {/* Right: Store detail form */}
        <div className="flex w-2/3 flex-col gap-3 overflow-auto rounded-2xl bg-pos-surface shadow-pos-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-24 shrink-0">
              <Label size="sm" weight="medium">매장번호</Label>
            </div>
            <Label size="sm">{form.storeNo || '--'}</Label>
          </div>

          {TEXT_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <Label size="sm" weight="medium">{f.label}</Label>
              </div>
              <TextInput
                value={form[f.key]}
                onChange={(v: string) => handleChange(f.key, v)}
                className="flex-1"
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <div className="w-24 shrink-0">
              <Label size="sm" weight="medium">본점선택</Label>
            </div>
            <div className="flex-1">
              <Dropdown
                options={[{ value: '', label: '-- 선택 --' }]}
                value={form.mainStoreId}
                onChange={(v) => handleChange('mainStoreId', v)}
              />
            </div>
          </div>

          {/* Main store notice */}
          <p className="text-xs text-pos-text-muted">
            {/* TODO: i18n msgKey - main store bizNo edit restriction */}
            ※ 대표매장은 사업자번호 변경 불가
          </p>
        </div>
      </div>
    </FullScreenPanel>
  );
}
