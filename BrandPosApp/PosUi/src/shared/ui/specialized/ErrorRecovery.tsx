'use client';

interface ErrorRecoveryProps {
  errorCode: string;
  errorMessage: string;
  suggestions: string[];
  onRetry?: () => void;
  onCancel?: () => void;
}

/**
 * ErrorRecovery -- 오류 복구 안내 패널
 *
 * 오류 아이콘, 코드, 메시지, 조치 안내, 재시도/취소 버튼을 표시한다.
 */
export default function ErrorRecovery({
  errorCode,
  errorMessage,
  suggestions,
  onRetry,
  onCancel,
}: ErrorRecoveryProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-pos-bg rounded-pos-card border border-pos-border max-w-[400px] mx-auto">
      {/* 오류 아이콘 */}
      <div className="w-14 h-14 rounded-pos-full bg-pos-error/10 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-pos-error">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 오류 코드 */}
      <span className="text-2xs font-mono text-pos-text-muted bg-pos-surface px-2 py-0.5 rounded-pos-full">
        {errorCode}
      </span>

      {/* 오류 메시지 */}
      <p className="text-md font-bold text-pos-text text-center">{errorMessage}</p>

      {/* 조치 안내 */}
      {suggestions.length > 0 && (
        <div className="w-full flex flex-col gap-1.5 p-3 bg-pos-surface rounded-pos-sm">
          <span className="text-xs font-semibold text-pos-text-secondary">조치 안내</span>
          <ul className="flex flex-col gap-1">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-pos-text">
                <span className="text-pos-text-muted shrink-0 mt-0.5">{'•'}</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2 w-full mt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-touch rounded-pos-btn bg-pos-surface text-pos-text-secondary text-sm font-semibold active:bg-gray-300 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
          >
            취소
          </button>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 h-touch rounded-pos-btn bg-primary-500 text-pos-text-inverse text-sm font-bold active:bg-primary-700 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
