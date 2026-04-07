'use client';

type LabelSize = 'xs' | 'sm' | 'md' | 'lg';
type LabelWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type LabelColor = 'default' | 'secondary' | 'muted' | 'primary' | 'success' | 'error' | 'warning';

interface LabelProps {
  children: React.ReactNode;
  size?: LabelSize;
  weight?: LabelWeight;
  color?: LabelColor;
  truncate?: boolean;
  className?: string;
}

const sizeStyles: Record<LabelSize, string> = {
  xs: 'text-xs leading-xs',
  sm: 'text-sm leading-sm',
  md: 'text-md leading-md',
  lg: 'text-lg leading-lg',
};

const weightStyles: Record<LabelWeight, string> = {
  regular:  'font-regular',
  medium:   'font-medium',
  semibold: 'font-semibold',
  bold:     'font-bold',
};

const colorStyles: Record<LabelColor, string> = {
  default:   'text-pos-text',
  secondary: 'text-pos-text-secondary',
  muted:     'text-pos-text-muted',
  primary:   'text-primary-500',
  success:   'text-pos-success',
  error:     'text-pos-error',
  warning:   'text-pos-warning',
};

/**
 * Label — 텍스트 레이블
 *
 * 토큰 기반 크기, 굵기, 색상을 조합하여 일관된 텍스트를 표시한다.
 */
export default function Label({
  children,
  size = 'md',
  weight = 'regular',
  color = 'default',
  truncate = false,
  className = '',
}: LabelProps) {
  return (
    <span
      className={`
        ${sizeStyles[size]}
        ${weightStyles[weight]}
        ${colorStyles[color]}
        ${truncate ? 'truncate block' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
