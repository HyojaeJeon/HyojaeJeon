'use client';

import { useState, useCallback, useEffect } from 'react';
import Modal from '@shared/ui/organisms/Modal';
import TextInput from '@shared/ui/atoms/TextInput';
import Radio from '@shared/ui/atoms/Radio';
import Button from '@shared/ui/atoms/Button';

/**
 * CustomerDetailDialog -- 고객 상세 정보 모달 (레거시 IDD_CUST_DETAIL)
 *
 * 개인정보 + 통계 데이터를 2컬럼 레이아웃 + 하단 통계 섹션으로 표시.
 *
 * Bridge Commands: CUSTOMER:GET_DETAIL, CUSTOMER:UPDATE (idempotencyKey 필수)
 * UseCases: GetCustomerDetailUseCase, UpdateCustomerUseCase
 */

// ─── Types ───

interface CustomerDetail {
  custCode: string;
  custName: string;
  cardNo: string;
  hphone: string;
  custType: number; // 0=일반, 1=VIP, 2=직원
  smsReceive: number; // 0=거부, 1=수신
  inDate: string;
  lastVisit: string;
  jumin: string;
  sex: number; // 0=미지정, 1=남, 2=여
  phone: string;
  addr: string;
  birthType: number; // 1=양력, 2=음력
  birth: string;
  email: string;
  emailDomain: string;
  empCode: string;
  memo: string;
  // Statistics (read-only)
  totalSale: number;
  totalTick: number;
  recvTick: number;
  remainTick: number;
  visitCnt: number;
  totalPoint: number;
  usePoint: number;
  remainPoint: number;
}

interface CustomerDetailDialogProps {
  open: boolean;
  customerId: string;
  onClose: () => void;
}

// ─── Stub Data ───

const STUB_DETAIL: CustomerDetail = {
  custCode: 'C001',
  custName: '홍길동',
  cardNo: 'M00001',
  hphone: '010-1234-5678',
  custType: 0,
  smsReceive: 1,
  inDate: '2024-01-15',
  lastVisit: '2026-04-01',
  jumin: '',
  sex: 1,
  phone: '02-1234-5678',
  addr: '서울시 강남구 테헤란로 123',
  birthType: 1,
  birth: '1990-05-15',
  email: 'hong',
  emailDomain: 'gmail.com',
  empCode: 'E001',
  memo: '단골 고객',
  totalSale: 2450000,
  totalTick: 100000,
  recvTick: 80000,
  remainTick: 20000,
  visitCnt: 48,
  totalPoint: 24500,
  usePoint: 15000,
  remainPoint: 9500,
};

const CUST_TYPE_OPTIONS = [
  { value: 0, label: '일반' },
  { value: 1, label: 'VIP' },
  { value: 2, label: '직원' },
];

const SMS_OPTIONS = [
  { value: 0, label: '거부' },
  { value: 1, label: '수신' },
];

const SEX_OPTIONS = [
  { value: 0, label: '미지정' },
  { value: 1, label: '남' },
  { value: 2, label: '여' },
];

const EMAIL_DOMAINS = ['직접입력', 'gmail.com', 'naver.com', 'daum.net', 'kakao.com'];

// ─── Component ───

export default function CustomerDetailDialog({
  open,
  customerId,
  onClose,
}: CustomerDetailDialogProps) {
  const [form, setForm] = useState<CustomerDetail>(STUB_DETAIL);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Load detail on open ───
  useEffect(() => {
    if (open && customerId) {
      // TODO: CUSTOMER:GET_DETAIL Bridge command via RTK Query useGetCustomerDetailQuery
      console.log('[CustomerDetailDialog] CUSTOMER:GET_DETAIL', { customerId });
      setForm(STUB_DETAIL);
    }
  }, [open, customerId]);

  // ─── Field Updater ───

  const updateField = useCallback(<K extends keyof CustomerDetail>(field: K, value: CustomerDetail[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ─── Handlers ───

  const handleSave = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // TODO: CUSTOMER:UPDATE Bridge command via RTK Query useUpdateCustomerMutation
      // - idempotencyKey: `CUSTOMER:UPDATE:<uuid>`
      // - params: { customerId, fields: { ...changedFields } }
      console.log('[CustomerDetailDialog] CUSTOMER:UPDATE', form);
      onClose();
    } catch {
      // TODO: handle CUSTOMER_NOT_FOUND error
    } finally {
      setIsSubmitting(false);
    }
  }, [form, isSubmitting, onClose]);

  // ─── Helpers ───

  const fmt = (n: number) => n.toLocaleString();

  // ─── Render ───

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="고객 상세 정보"
      size="lg"
      footer={
        <>
          <Button variant="primary" size="md" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? '저장중...' : '저장'}
          </Button>
          <Button variant="ghost" size="md" onClick={onClose}>
            닫기
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* 2-column form */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {/* Left Column: Personal Info */}
          <TextInput label="고객코드" value={form.custCode} onChange={() => {}} disabled fullWidth />
          <TextInput label="주민번호" value={form.jumin} onChange={(v) => updateField('jumin', v)} fullWidth />

          <TextInput label="고객명" value={form.custName} onChange={(v) => updateField('custName', v)} fullWidth />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-pos-text">성별</span>
            <select
              value={form.sex}
              onChange={(e) => updateField('sex', Number(e.target.value))}
              className="h-touch px-3 text-md rounded-pos-input border border-pos-border bg-pos-bg text-pos-text outline-none focus:border-primary-500"
            >
              {SEX_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <TextInput label="회원번호" value={form.cardNo} onChange={(v) => updateField('cardNo', v)} fullWidth />
          <TextInput label="전화번호" value={form.phone} onChange={(v) => updateField('phone', v)} fullWidth />

          <TextInput label="휴대폰" value={form.hphone} onChange={(v) => updateField('hphone', v)} fullWidth />
          <TextInput label="주소" value={form.addr} onChange={(v) => updateField('addr', v)} fullWidth />

          {/* Customer Type Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-pos-text">고객유형</span>
            <select
              value={form.custType}
              onChange={(e) => updateField('custType', Number(e.target.value))}
              className="h-touch px-3 text-md rounded-pos-input border border-pos-border bg-pos-bg text-pos-text outline-none focus:border-primary-500"
            >
              {CUST_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Birth with solar/lunar radio */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-pos-text">생년월일</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <Radio checked={form.birthType === 1} onChange={() => updateField('birthType', 1)} />
                <span className="text-sm">양력</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <Radio checked={form.birthType === 2} onChange={() => updateField('birthType', 2)} />
                <span className="text-sm">음력</span>
              </label>
              <input
                type="text"
                value={form.birth}
                onChange={(e) => updateField('birth', e.target.value)}
                placeholder="YYYY-MM-DD"
                className="flex-1 h-touch px-3 text-md rounded-pos-input border border-pos-border bg-pos-bg text-pos-text outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* SMS Receive */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-pos-text">SMS수신</span>
            <select
              value={form.smsReceive}
              onChange={(e) => updateField('smsReceive', Number(e.target.value))}
              className="h-touch px-3 text-md rounded-pos-input border border-pos-border bg-pos-bg text-pos-text outline-none focus:border-primary-500"
            >
              {SMS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-pos-text">이메일</span>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="flex-1 h-touch px-3 text-md rounded-pos-input border border-pos-border bg-pos-bg text-pos-text outline-none focus:border-primary-500"
              />
              <span className="text-sm text-pos-text-muted">@</span>
              <select
                value={form.emailDomain}
                onChange={(e) => updateField('emailDomain', e.target.value)}
                className="flex-1 h-touch px-3 text-md rounded-pos-input border border-pos-border bg-pos-bg text-pos-text outline-none focus:border-primary-500"
              >
                {EMAIL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Read-only dates */}
          <TextInput label="등록일" value={form.inDate} onChange={() => {}} disabled fullWidth />
          {/* TODO: P2 - 담당자 Select */}
          <TextInput label="담당자" value={form.empCode} onChange={(v) => updateField('empCode', v)} fullWidth />

          <TextInput label="최근방문일" value={form.lastVisit} onChange={() => {}} disabled fullWidth />
          <TextInput label="메모" value={form.memo} onChange={(v) => updateField('memo', v)} fullWidth />
        </div>

        {/* Statistics Section */}
        <div className="border-t border-pos-border pt-3">
          <div className="text-xs font-semibold text-pos-text-muted mb-2">통계</div>
          <div className="grid grid-cols-4 gap-3">
            <StatCell label="총매출액" value={fmt(form.totalSale)} />
            <StatCell label="총상품권" value={fmt(form.totalTick)} />
            <StatCell label="수령상품권" value={fmt(form.recvTick)} />
            <StatCell label="잔여상품권" value={fmt(form.remainTick)} />
            <StatCell label="방문횟수" value={fmt(form.visitCnt)} />
            <StatCell label="총포인트" value={fmt(form.totalPoint)} />
            <StatCell label="사용포인트" value={fmt(form.usePoint)} />
            <StatCell label="잔여포인트" value={fmt(form.remainPoint)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Internal ───

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center p-2 bg-pos-surface rounded-pos-sm">
      <span className="text-xs text-pos-text-muted">{label}</span>
      <span className="text-sm font-semibold text-pos-text tabular-nums">{value}</span>
    </div>
  );
}
