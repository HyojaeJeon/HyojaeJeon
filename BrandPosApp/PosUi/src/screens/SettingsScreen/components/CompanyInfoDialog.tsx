'use client';

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';
import Label from '@shared/ui/atoms/Label';

/**
 * CompanyInfoDialog -- Company info settings
 *
 * Design doc: set-companyinfo.md (SET-COMPANYINFO)
 * Legacy: IDD_COMPANYINFO (resource 161)
 *
 * Form fields: bizNo (readonly), companyName, tel, addr, president, hphone
 * P2: Lock settings (hidden in legacy)
 *
 * Bridge Commands:
 *   SETUP:COMPANY:GET_INFO, SETUP:COMPANY:SAVE
 *
 * RTK Query: setupApi.useGetCompanyInfoQuery, setupApi.useSaveCompanyInfoMutation
 * UseCase: SaveCompanyInfoUseCase
 */

interface CompanyInfoDialogProps {
  open?: boolean;
  onClose: () => void;
}

interface CompanyInfoForm {
  bizNo: string;
  companyName: string;
  tel: string;
  addr: string;
  president: string;
  hphone: string;
}

const FIELDS: { key: keyof CompanyInfoForm; label: string; disabled?: boolean; placeholder?: string }[] = [
  { key: 'bizNo', label: '사업자번호', disabled: true, placeholder: '읽기 전용' },
  { key: 'companyName', label: '회사명' },
  { key: 'tel', label: '전화번호' },
  { key: 'addr', label: '주소' },
  { key: 'president', label: '대표자' },
  { key: 'hphone', label: '핸드폰번호' },
];

export default function CompanyInfoDialog({ open = true, onClose }: CompanyInfoDialogProps) {
  const [form, setForm] = useState<CompanyInfoForm>({
    bizNo: '',
    companyName: '',
    tel: '',
    addr: '',
    president: '',
    hphone: '',
  });

  // TODO: Load data with setupApi.useGetCompanyInfoQuery on mount

  const handleChange = useCallback((field: keyof CompanyInfoForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Call setupApi.useSaveCompanyInfoMutation
    // TODO: Validation via SystemMgr.validateCompanyInfo()
  }, []);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="업체정보 설정"
      subtitle="SET-COMPANYINFO"
      footer={
        <>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 rounded-2xl bg-pos-surface shadow-pos-card p-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex items-center gap-3">
            <div className="w-28 shrink-0">
              <Label size="sm" weight="medium">{f.label}</Label>
            </div>
            <TextInput
              value={form[f.key]}
              onChange={(v: string) => handleChange(f.key, v)}
              disabled={f.disabled}
              placeholder={f.placeholder}
              className="flex-1"
            />
          </div>
        ))}

        {/* P2: Lock settings section (hidden in legacy, redesigned for central server) */}
        {/* TODO: P2 - RadioGroup for lock/unlock, DatePicker for lock date */}
      </div>
    </FullScreenPanel>
  );
}
