import type { CSSProperties } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = 14, radius = 6, style }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${T.colors.surfaceMuted} 0%, ${T.colors.surfaceSoft} 50%, ${T.colors.surfaceMuted} 100%)`,
        backgroundSize: '200% 100%',
        animation: 'sharedui-skeleton 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/* 전역 keyframes 가 없을 경우를 대비한 style 주입 태그 — 소비자 앱이 이미 정의했으면 무해 */
if (typeof document !== 'undefined' && !document.getElementById('sharedui-skeleton-kf')) {
  const style = document.createElement('style');
  style.id = 'sharedui-skeleton-kf';
  style.textContent =
    '@keyframes sharedui-skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
  document.head.appendChild(style);
}
