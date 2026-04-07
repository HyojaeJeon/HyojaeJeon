'use client';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerSpacing = 'sm' | 'md' | 'lg';

interface DividerProps {
  orientation?: DividerOrientation;
  spacing?: DividerSpacing;
  className?: string;
}

const horizontalSpacing: Record<DividerSpacing, string> = {
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
};

const verticalSpacing: Record<DividerSpacing, string> = {
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
};

/**
 * Divider — 구분선
 *
 * 수평/수직 구분선. border-pos-border 토큰 색상 사용.
 */
export default function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`
          self-stretch
          w-px
          bg-pos-border
          ${verticalSpacing[spacing]}
          ${className}
        `}
      />
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={`
        w-full
        border-0
        border-t
        border-pos-border
        ${horizontalSpacing[spacing]}
        ${className}
      `}
    />
  );
}
