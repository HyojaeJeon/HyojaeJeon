'use client';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  title?: string;
  message: string;
  type: AlertType;
  onClose?: () => void;
}

const typeConfig: Record<AlertType, { iconBg: string; iconColor: string; borderColor: string }> = {
  success: { iconBg: 'bg-emerald-50',  iconColor: 'text-pos-success', borderColor: 'border-emerald-200' },
  error:   { iconBg: 'bg-red-50',      iconColor: 'text-pos-error',   borderColor: 'border-red-200' },
  warning: { iconBg: 'bg-amber-50',    iconColor: 'text-warn-700',    borderColor: 'border-amber-200' },
  info:    { iconBg: 'bg-blue-50',     iconColor: 'text-pos-info',    borderColor: 'border-blue-200' },
};

const icons: Record<AlertType, React.ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5.5 9.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="1" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="5.5" r="1" fill="currentColor" />
      <path d="M9 8.5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * Alert -- 알림 메시지
 *
 * 색상 띠(border-left stripe) 없음. 아이콘 원형 배경 + 깔끔한 보더만.
 * 정보가 주인공 — 배경색 없이 흰 바탕, 아이콘 색상으로만 유형 구분.
 */
export default function Alert({ title, message, type, onClose }: AlertProps) {
  const config = typeConfig[type];

  return (
    <div
      className={`
        w-full flex items-start gap-3
        px-4 py-3.5 rounded-pos-md
        bg-pos-bg border ${config.borderColor}
        animate-pos-fade-in
      `}
    >
      {/* 아이콘 — 원형 배경 */}
      <div className={`shrink-0 w-8 h-8 rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center mt-0.5`}>
        {icons[type]}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0 pt-1">
        {title && (
          <p className="text-md font-semibold text-pos-text mb-0.5">{title}</p>
        )}
        <p className="text-sm text-pos-text-secondary leading-relaxed">{message}</p>
      </div>

      {/* 닫기 */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-pos-sm text-pos-text-muted active:bg-gray-100 active:scale-[0.95] transition-transform duration-fast cursor-pointer select-none mt-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
