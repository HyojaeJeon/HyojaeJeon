'use client';

type PaymentStatusType = '대기' | '승인중' | '승인완료' | '거절됨' | '오류';

interface PaymentStatusProps {
  status: PaymentStatusType;
  message?: string;
  onRetry?: () => void;
}

/**
 * PaymentStatus -- 결제 처리 상태 표시
 *
 * 전체 화면 중앙 배치.
 * 승인중: 스피너, 승인완료: 체크마크, 거절됨/오류: X 표시.
 */
export default function PaymentStatus({
  status,
  message,
  onRetry,
}: PaymentStatusProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-pos-bg">
      {/* 아이콘 */}
      {status === '승인중' && (
        <div className="w-16 h-16 flex items-center justify-center">
          <svg className="animate-pos-spin w-12 h-12 text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {status === '승인완료' && (
        <div className="w-16 h-16 rounded-pos-full bg-pos-success flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-pos-text-inverse">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {(status === '거절됨' || status === '오류') && (
        <div className="w-16 h-16 rounded-pos-full bg-pos-error flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-pos-text-inverse">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {status === '대기' && (
        <div className="w-16 h-16 rounded-pos-full bg-pos-border flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-pos-text-muted">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* 상태 텍스트 */}
      <span className="text-xl font-bold text-pos-text">{status}</span>

      {/* 메시지 */}
      {message && (
        <p className="text-sm text-pos-text-secondary text-center max-w-[280px]">{message}</p>
      )}

      {/* 재시도 버튼 */}
      {onRetry && (status === '거절됨' || status === '오류') && (
        <button
          type="button"
          onClick={onRetry}
          className="h-touch px-6 mt-2 rounded-pos-btn bg-primary-500 text-pos-text-inverse text-md font-bold active:bg-primary-700 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
