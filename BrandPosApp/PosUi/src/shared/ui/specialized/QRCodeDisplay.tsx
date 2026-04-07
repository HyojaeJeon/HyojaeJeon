'use client';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  label?: string;
}

/**
 * QRCodeDisplay -- QR 코드 표시 플레이스홀더
 *
 * 실제 QR 생성은 외부 라이브러리 필요.
 * 현재는 플레이스홀더 사각형에 "QR" 텍스트를 표시한다.
 */
export default function QRCodeDisplay({
  data,
  size = 200,
  label,
}: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* QR 플레이스홀더 */}
      <div
        className="bg-pos-bg border-2 border-pos-border rounded-pos-sm flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="flex flex-col items-center gap-1">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-pos-text-muted">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="14" y="14" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M21 14v7h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-lg font-bold text-pos-text-muted">QR</span>
        </div>
      </div>

      {/* 라벨 */}
      {label && (
        <span className="text-sm text-pos-text-secondary text-center">{label}</span>
      )}

      {/* 데이터 미리보기 */}
      <span className="text-2xs text-pos-text-muted font-mono truncate max-w-[200px]">
        {data}
      </span>
    </div>
  );
}
