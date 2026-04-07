'use client';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-primary-500 text-white active:bg-primary-700 shadow-pos-soft',
  secondary: 'bg-pos-surface text-pos-text-secondary active:bg-gray-300',
  danger:    'bg-pos-error text-white active:bg-red-700 shadow-pos-soft',
  ghost:     'bg-transparent text-pos-text-secondary active:bg-gray-200',
  outline:   'bg-primary-50 text-primary-500 active:bg-primary-100',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-touch px-4 text-md gap-2',
  lg: 'h-touch-lg px-6 text-lg gap-2.5',
};

/**
 * Button — HDS 기본 요소
 *
 * POS 터치스크린 전용: hover 효과 없음, active(터치) 피드백만 사용.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        rounded-pos-btn font-semibold
        transition-all duration-fast ease-default
        select-none cursor-pointer
        active:scale-[0.97]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-[var(--opacity-disabled)] cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <svg className="animate-pos-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
}
