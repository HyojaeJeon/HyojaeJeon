'use client';

interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  icon?: React.ReactNode;
}

/**
 * Chip -- 필터 칩
 *
 * 필 모양 토글 칩. 카테고리 필터, 태그 선택 등에 사용.
 */
export default function Chip({
  label,
  selected = false,
  onToggle,
  icon,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center gap-1.5
        h-9 px-3.5
        rounded-pos-full
        text-sm font-medium
        transition-all duration-fast ease-default
        select-none cursor-pointer
        active:scale-[0.95]
        ${selected
          ? 'bg-primary-500 text-white shadow-pos-soft'
          : 'bg-pos-surface text-pos-text-secondary active:bg-gray-200'}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
