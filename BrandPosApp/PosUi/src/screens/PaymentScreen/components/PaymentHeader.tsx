'use client';

// -------------------------------------------------------------------
// PaymentHeader -- 결제 화면 상단 헤더
// 테이블번호, 날짜, 인원수, 전표번호, 담당자 표시
// -------------------------------------------------------------------

interface PaymentHeaderProps {
  tableCode: string;
  personCount: number;
  slipNo: string;
  staffName: string;
  onBack?: () => void;
  onClose?: () => void;
}

export default function PaymentHeader({
  tableCode,
  personCount,
  slipNo,
  staffName,
  onBack,
  onClose,
}: PaymentHeaderProps) {
  const today = new Date().toLocaleDateString('ko-KR');

  return (
    <header className="h-header flex items-center justify-between px-4 bg-pos-bg border-b border-pos-border shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-primary-500">{tableCode}</span>
        <span className="text-md text-pos-text-secondary">{personCount}명</span>
        <span className="text-md text-pos-text-secondary">{slipNo}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-md text-pos-text-secondary">{today}</span>
        <span className="text-md text-pos-text-secondary">{staffName}</span>
        <button
          type="button"
          onClick={onBack}
          className="ml-2 inline-flex h-8 items-center justify-center rounded-pos-sm border border-pos-border bg-pos-surface px-3 text-xs font-semibold text-pos-text-muted transition active:scale-[0.97]"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-pos-sm bg-pos-error text-white transition active:scale-[0.97]"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </header>
  );
}
