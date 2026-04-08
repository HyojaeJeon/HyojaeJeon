'use client';

import LoginIcons from './LoginIcons';

/**
 * LoginTopBar — 우측 폼 상단의 시계 + 최소화 버튼.
 * LoginScreen 전용 컴포지션.
 */
interface LoginTopBarProps {
  dateTime: string;
  onMinimize: () => void;
}

export default function LoginTopBar({ dateTime, onMinimize }: LoginTopBarProps) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-pos-border shrink-0">
      <span className="text-xs text-pos-text-muted tabular-nums font-mono">{dateTime}</span>
      <button
        type="button"
        onClick={onMinimize}
        aria-label="minimize"
        className="w-8 h-8 rounded-pos-sm bg-pos-error flex items-center justify-center text-white cursor-pointer active:scale-[0.95]"
      >
        <LoginIcons.Close />
      </button>
    </div>
  );
}
