'use client';

type ProgressVariant = 'default' | 'success' | 'warning' | 'error';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: ProgressVariant;
  label?: string;
  showPercent?: boolean;
}

const trackColor = 'bg-pos-surface';

const barColors: Record<ProgressVariant, string> = {
  default: 'bg-primary-500',
  success: 'bg-pos-success',
  warning: 'bg-warn-500',
  error:   'bg-pos-error',
};

/**
 * ProgressBar -- 진행 표시기
 *
 * 수평 바. 동기화 진행률, 데이터 처리 상태 등에 사용.
 */
export default function ProgressBar({
  value,
  variant = 'default',
  label,
  showPercent = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full select-none">
      {/* 라벨 / 퍼센트 헤더 */}
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-pos-text">{label}</span>
          )}
          {showPercent && (
            <span className="text-sm font-semibold text-pos-text tabular-nums">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}

      {/* 트랙 */}
      <div className={`w-full h-2.5 rounded-pos-full ${trackColor} overflow-hidden`}>
        <div
          className={`
            h-full rounded-pos-full
            transition-all duration-slow ease-default
            ${barColors[variant]}
          `}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
