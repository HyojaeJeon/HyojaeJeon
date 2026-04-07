'use client';

import { useState, useCallback } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import TextInput from '@shared/ui/atoms/TextInput';
import Button from '@shared/ui/atoms/Button';
import Radio from '@shared/ui/atoms/Radio';

/**
 * CustomerRegistrationDialog -- 고객 신규 등록 모달 (레거시 IDD_CUSTREGI)
 *
 * 회원번호, 고객명, 휴대폰번호, 전화번호, 주소, 메모, 고객 유형을 입력받아 저장한다.
 *
 * Bridge Commands: CUSTOMER:REGISTER (idempotencyKey 필수)
 * UseCase: RegisterCustomerUseCase
 * Manager: CustMgr.RegisterCustomer()
 */

// ─── Types ───

type CustomerType = 'NORMAL' | 'VIP' | 'STAFF';

interface FormState {
  cardNo: string;
  name: string;
  hphone: string;
  phone: string;
  address: string;
  memo: string;
  custType: CustomerType;
}

interface FormErrors {
  name?: string;
  hphone?: string;
  [key: string]: string | undefined;
}

interface CustomerRegistrationDialogProps {
  open: boolean;
  onClose: () => void;
  onRegistered: (customerId: string) => void;
  /** Pre-fill phone number (e.g., from CallerID or search) */
  initialPhone?: string;
}

// ─── Constants ───

const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: 'NORMAL', label: '일반' },
  { value: 'VIP', label: 'VIP' },
  { value: 'STAFF', label: '직원' },
];

const INITIAL_FORM: FormState = {
  cardNo: '',
  name: '',
  hphone: '',
  phone: '',
  address: '',
  memo: '',
  custType: 'NORMAL',
};

// ─── Component ───

export default function CustomerRegistrationDialog({
  open,
  onClose,
  onRegistered,
  initialPhone = '',
}: CustomerRegistrationDialogProps) {
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM, hphone: initialPhone });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Field Updater ───

  const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // ─── Validation ───

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) {
      newErrors.name = '고객명은 필수입니다';
    }
    if (!form.hphone.trim()) {
      newErrors.hphone = '휴대폰번호는 필수입니다';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // ─── Handlers ───

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // TODO: CUSTOMER:REGISTER Bridge command via RTK Query useRegisterCustomerMutation
      // - idempotencyKey: `CUSTOMER:REGISTER:<uuid>`
      // - params: { name, phone, address, memo, cardNo, custType }
      // - on success: onRegistered(data.customer.id)
      // - on DUPLICATE_PHONE error: setErrors({ hphone: '이미 등록된 휴대폰번호입니다' })
      console.log('[CustomerRegistrationDialog] CUSTOMER:REGISTER', form);

      // Stub: simulate success
      onRegistered('NEW_CUST_001');
    } catch {
      // TODO: handle error from Bridge response
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validate, isSubmitting, onRegistered]);

  const handleClose = useCallback(() => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    onClose();
  }, [onClose]);

  const handlePhoneAutoFill = useCallback(() => {
    // TODO: P1 - 외부 장치 또는 클립보드에서 휴대폰번호 자동입력
    console.log('[CustomerRegistrationDialog] phone auto-fill');
  }, []);

  // ─── Render ───

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="회원등록"
      size="md"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? '저장중...' : '저장'}
          </Button>
          <Button variant="ghost" size="md" onClick={handleClose}>
            닫기
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Header actions */}
        <div className="flex items-center justify-end gap-2 mb-2">
          {/* TODO: P2 - VirtualKeyboard toggle */}
          <Button variant="ghost" size="sm" onClick={handlePhoneAutoFill}>
            전화번호입력받기
          </Button>
        </div>

        {/* Card Number + Customer Type */}
        <div className="flex items-end gap-4">
          <TextInput
            label="회원번호"
            value={form.cardNo}
            onChange={(v) => updateField('cardNo', v)}
            placeholder="회원번호 (선택)"
          />
          <div className="flex items-center gap-3 pb-1">
            {CUSTOMER_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                <Radio
                  checked={form.custType === opt.value}
                  onChange={() => updateField('custType', opt.value)}
                />
                <span className="text-sm text-pos-text">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <TextInput
          label="고객명"
          value={form.name}
          onChange={(v) => updateField('name', v)}
          error={errors.name}
          placeholder="고객명 (필수)"
          fullWidth
        />

        {/* Mobile Phone */}
        <TextInput
          label="휴대폰"
          value={form.hphone}
          onChange={(v) => updateField('hphone', v)}
          error={errors.hphone}
          placeholder="휴대폰번호 (필수)"
          fullWidth
        />

        {/* Phone */}
        <TextInput
          label="전화번호"
          value={form.phone}
          onChange={(v) => updateField('phone', v)}
          placeholder="전화번호 (선택)"
          fullWidth
        />

        {/* Address */}
        <TextInput
          label="주소"
          value={form.address}
          onChange={(v) => updateField('address', v)}
          placeholder="주소 (선택)"
          fullWidth
        />

        {/* Memo */}
        <TextInput
          label="메모"
          value={form.memo}
          onChange={(v) => updateField('memo', v)}
          placeholder="메모 (선택)"
          fullWidth
        />
      </div>
    </Modal>
  );
}
