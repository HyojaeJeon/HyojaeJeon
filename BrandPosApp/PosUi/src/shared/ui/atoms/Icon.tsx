'use client';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconProps {
  name: string;
  size?: IconSize;
  color?: string;
  className?: string;
}

const sizeMap: Record<IconSize, string> = {
  sm: 'w-[var(--icon-sm)] h-[var(--icon-sm)]',
  md: 'w-[var(--icon-md)] h-[var(--icon-md)]',
  lg: 'w-[var(--icon-lg)] h-[var(--icon-lg)]',
  xl: 'w-[var(--icon-xl)] h-[var(--icon-xl)]',
};

/**
 * SVG 아이콘 경로 맵
 *
 * 각 아이콘은 24x24 viewBox 기준 단일 path.
 * stroke 기반 아이콘은 fill="none" + stroke="currentColor".
 */
const iconPaths: Record<string, { d: string; stroke?: boolean }> = {
  plus:     { d: 'M12 5v14M5 12h14', stroke: true },
  minus:    { d: 'M5 12h14', stroke: true },
  close:    { d: 'M18 6L6 18M6 6l12 12', stroke: true },
  check:    { d: 'M20 6L9 17l-5-5', stroke: true },
  search:   { d: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z', stroke: true },
  back:     { d: 'M15 18l-6-6 6-6', stroke: true },
  forward:  { d: 'M9 18l6-6-6-6', stroke: true },
  up:       { d: 'M18 15l-6-6-6 6', stroke: true },
  down:     { d: 'M6 9l6 6 6-6', stroke: true },
  menu:     { d: 'M4 6h16M4 12h16M4 18h16', stroke: true },
  home:     { d: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10', stroke: true },
  settings: { d: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1.08z', stroke: true },
  print:    { d: 'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z', stroke: true },
  cart:     { d: 'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6M10 21a1 1 0 100-2 1 1 0 000 2zM21 21a1 1 0 100-2 1 1 0 000 2z', stroke: true },
  trash:    { d: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6', stroke: true },
  edit:     { d: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z', stroke: true },
  refresh:  { d: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15', stroke: true },
  user:     { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', stroke: true },
  bell:     { d: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0', stroke: true },
  wifi:     { d: 'M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01', stroke: true },
  'wifi-off': { d: 'M1 1l22 22M16.72 11.06a10.94 10.94 0 012.81 1.49M8.53 16.11a6 6 0 016.95 0M12 20h.01M5 12.55a10.94 10.94 0 015.17-2.39M1.42 9a16 16 0 014.73-2.52M8.89 4.83A16 16 0 0122.58 9', stroke: true },
};

/**
 * Icon — SVG 아이콘 래퍼
 *
 * POS 공통 아이콘을 토큰 기반 크기로 렌더링한다.
 * color prop으로 Tailwind 텍스트 색상 클래스를 전달한다.
 */
export default function Icon({
  name,
  size = 'md',
  color = 'text-pos-text',
  className = '',
}: IconProps) {
  const icon = iconPaths[name];

  if (!icon) {
    return null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`
        ${sizeMap[size]}
        ${color}
        shrink-0
        ${className}
      `}
      aria-hidden="true"
    >
      {icon.stroke ? (
        <path
          d={icon.d}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path d={icon.d} fill="currentColor" />
      )}
    </svg>
  );
}
