'use client';

/**
 * TaxSellerDialog (SET-PAY-TAXSELLER-DLG / PAY_TAXSELLER_DLG)
 *
 * 베트남 전자세금계산서(VAT Invoice) 발행용 판매자 정보 설정 모달.
 * 13개 텍스트 입력 필드 단순 폼.
 *
 * Legacy: IDD_PAY_TAXSELLER_DLG
 * Bridge: SETUP:TAX_SELLER:GET_CONFIG, SETUP:TAX_SELLER:SAVE
 */

import { useState, useCallback } from 'react';
import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';
import TextInput from '@shared/ui/atoms/TextInput';

// ─── Types ───

interface SellerInfo {
  businessCode: string;
  companyName: string;
  customerCode: string;
  customerName: string;
  taxCode: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  bankAccount: string;
  bankName: string;
  representative: string;
  contactPerson: string;
}

interface TaxSellerDialogProps {
  open?: boolean;
  onClose: () => void;
  onSave?: (info: SellerInfo) => void;
}

const INITIAL_SELLER: SellerInfo = {
  businessCode: '',
  companyName: '',
  customerCode: '',
  customerName: '',
  taxCode: '',
  address: '',
  phone: '',
  fax: '',
  email: '',
  bankAccount: '',
  bankName: '',
  representative: '',
  contactPerson: '',
};

const FIELDS: { key: keyof SellerInfo; label: string }[] = [
  { key: 'businessCode', label: '사업자코드' },
  { key: 'companyName', label: '회사명' },
  { key: 'customerCode', label: '고객코드' },
  { key: 'customerName', label: '고객명' },
  { key: 'taxCode', label: '세금코드' },
  { key: 'address', label: '주소' },
  { key: 'phone', label: '전화번호' },
  { key: 'fax', label: '팩스' },
  { key: 'email', label: '이메일' },
  { key: 'bankAccount', label: '은행 계좌' },
  { key: 'bankName', label: '은행명' },
  { key: 'representative', label: '대표자' },
  { key: 'contactPerson', label: '담당자' },
];

// ─── Component ───

export default function TaxSellerDialog({
  open = true,
  onClose,
  onSave,
}: TaxSellerDialogProps) {
  const [info, setInfo] = useState<SellerInfo>(INITIAL_SELLER);

  // TODO: RTK Query - setupApi.useGetTaxSellerConfigQuery()
  // TODO: RTK Query - setupApi.useSaveTaxSellerConfigMutation()

  const handleChange = useCallback((field: keyof SellerInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Bridge SETUP:TAX_SELLER:SAVE 호출
    onSave?.(info);
  }, [info, onSave]);

  return (
    <FullScreenPanel
      open={open}
      onClose={onClose}
      title="판매자 정보 설정"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>닫기</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="rounded-xl bg-pos-bg shadow-pos-card p-4 grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <TextInput
              key={f.key}
              label={f.label}
              value={info[f.key]}
              onChange={(v) => handleChange(f.key, v)}
            />
          ))}
        </div>
      </div>
    </FullScreenPanel>
  );
}
