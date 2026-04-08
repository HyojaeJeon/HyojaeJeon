'use client';

import type { ReactNode } from 'react';

interface IconLabelFieldProps {
  /** 좌측 아이콘 슬롯 */
  icon: ReactNode;
  /** 짧은 인라인 라벨 (필드 안에 표시) */
  label: string;
  /** 표시할 값. 빈 값이면 placeholder 가 표시된다. */
  value: string;
  placeholder?: string;
  /** 활성 상태 (포커스/선택) */
  isActive?: boolean;
  /** 읽기 전용. 클릭 무시 + 비활성 스타일은 아님(label/value 는 그대로 표시). */
  readOnly?: boolean;
  /** 숫자/금액 표시: tabular-nums + monospace */
  mono?: boolean;
  onClick?: () => void;
}

/**
 * IconLabelField -- 아이콘 + 인라인 라벨 + 값 표시 한 줄 입력 셀
 *
 * 키패드/외부 입력 장치로 값이 채워지는 POS 환경에서 사용한다.
 * input element 가 아니라 click 으로 active field 를 전환하는 패턴이다.
 *
 * 사용처: LoginScreen, SettingsScreen 의 키패드 기반 입력 화면.
 * (HTML input 기반 폼은 atoms/TextInput + molecules/FormField 를 사용한다.)
 */
export default function IconLabelField({
  icon,
  label,
  value,
  placeholder = '',
  isActive = false,
  readOnly = false,
  mono = false,
  onClick,
}: IconLabelFieldProps) {
  return (
    <div
      role={readOnly ? undefined : 'button'}
      tabIndex={readOnly ? undefined : 0}
      onClick={readOnly ? undefined : onClick}
      className={`
        flex items-center gap-3 h-touch px-4 rounded-pos-input border
        ${readOnly ? 'cursor-default bg-pos-surface' : 'cursor-pointer'}
        ${isActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-pos-border bg-pos-bg'}
      `}
    >
      <span className="text-pos-text-muted shrink-0">{icon}</span>
      <span className="text-xs text-pos-text-muted w-14 shrink-0">{label}</span>
      <span
        className={`
          flex-1 text-md font-semibold text-pos-text min-h-[1.25rem]
          ${mono ? 'tabular-nums font-mono' : ''}
        `}
      >
        {value || (
          <span className="text-pos-text-muted font-normal">{placeholder}</span>
        )}
      </span>
    </div>
  );
}
