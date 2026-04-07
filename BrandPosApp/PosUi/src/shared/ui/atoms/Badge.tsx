'use client';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
  default: { bg: 'bg-pos-surface',   text: 'text-pos-text-secondary', dot: 'bg-pos-text-muted',  border: 'border-pos-border' },
  primary: { bg: 'bg-primary-50',    text: 'text-primary-600',        dot: 'bg-primary-500',     border: 'border-primary-100' },
  success: { bg: 'bg-pos-bg',        text: 'text-pos-success',        dot: 'bg-pos-success',     border: 'border-emerald-200' },
  warning: { bg: 'bg-pos-bg',        text: 'text-warn-700',           dot: 'bg-warn-500',        border: 'border-amber-200' },
  error:   { bg: 'bg-pos-bg',        text: 'text-pos-error',          dot: 'bg-pos-error',       border: 'border-red-200' },
  info:    { bg: 'bg-pos-bg',        text: 'text-pos-info',           dot: 'bg-pos-info',        border: 'border-blue-200' },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
};

/**
 * Badge — 상태 배지
 *
 * 흰 배경 + 연한 보더 + 상태 도트 조합.
 * 컬러 배경 블록 대신 텍스트 색상과 작은 도트로 상태를 표현.
 * 절제된 디자인 — 정보 전달이 목적.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = true,
  className = '',
}: BadgeProps) {
  const v = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-pos-full
        font-semibold
        select-none
        border
        ${v.bg} ${v.text} ${v.border}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`} />
      )}
      {children}
    </span>
  );
}
