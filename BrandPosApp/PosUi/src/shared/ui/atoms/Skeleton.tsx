'use client';

type SkeletonRounded = 'sm' | 'md' | 'lg' | 'full';

interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: SkeletonRounded;
  className?: string;
}

const roundedStyles: Record<SkeletonRounded, string> = {
  sm:   'rounded-pos-sm',
  md:   'rounded-pos-md',
  lg:   'rounded-pos-lg',
  full: 'rounded-pos-full',
};

/**
 * Skeleton — 스켈레톤 로더
 *
 * 콘텐츠 로딩 중 자리 표시 UI.
 * animate-pos-pulse 토큰 기반 펄스 애니메이션.
 */
export default function Skeleton({
  width,
  height,
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pos-pulse
        bg-pos-border
        ${roundedStyles[rounded]}
        ${className}
      `}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
      }}
      aria-hidden="true"
    />
  );
}
