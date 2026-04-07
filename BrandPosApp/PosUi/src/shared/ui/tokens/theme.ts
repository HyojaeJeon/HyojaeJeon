/**
 * HDS Design Token — 유일한 진실의 원천 (Single Source of Truth)
 *
 * 모든 시각적 속성은 이 파일에서 정의한다.
 * globals.css의 @theme CSS Custom Properties는 이 파일의 값을 반영한다.
 * 컴포넌트는 직접 값을 쓰지 않고 Tailwind 유틸리티 클래스(토큰 기반)만 참조한다.
 *
 * 변경 시: theme.ts 수정 → globals.css 동기화 → 전체 컴포넌트 일괄 반영
 */

// ─── Color ────────────────────────────────────────────────────────
export const color = {
  // Brand — Primary (Soft Red)
  primary: {
    50:  '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#F48C95',
    400: '#FB7185',
    500: '#E63946',  // 메인 액션 색상
    600: '#DC2626',
    700: '#B92B38',
  },

  // Neutral Gray (음소거된 그레이)
  gray: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Warm Yellow (주문중/경고)
  yellow: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    300: '#FDE68A',
    500: '#FBBF24',
    700: '#D97706',
  },

  // Semantic
  semantic: {
    bg:            '#FFFFFF',
    surface:       '#F9FAFB',
    text:          '#111827',
    textSecondary: '#6B7280',
    textMuted:     '#9CA3AF',
    textInverse:   '#FFFFFF',
    border:        '#E5E7EB',
    borderStrong:  '#D1D5DB',
    success:       '#22C55E',
    info:          '#3B82F6',
    warning:       '#FBBF24',
    error:         '#EF4444',
  },

  // Table Status
  table: {
    empty:    '#E5E7EB',
    occupied: '#FDE68A',
    paying:   '#FCA5A5',
    dirty:    '#D1D5DB',
    reserved: '#C4B5FD',
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────
export const spacing = {
  px:   1,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  4:    16,
  5:    20,
  6:    24,
  8:    32,
  10:   40,
  12:   48,
  16:   64,
} as const;

// ─── Border Radius ────────────────────────────────────────────────
export const radius = {
  none: '0',
  xs:   '0.375rem',   // 6px
  sm:   '0.5rem',     // 8px
  md:   '0.75rem',    // 12px — 일반 버튼
  lg:   '1rem',       // 16px — 카드
  xl:   '1.25rem',    // 20px
  '2xl':'1.5rem',     // 24px — 큰 카드
  full: '9999px',     // 배지, 원형
} as const;

// ─── Box Shadow ───────────────────────────────────────────────────
export const shadow = {
  none:    'none',
  soft:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  card:    '0 4px 12px rgba(0,0,0,0.05)',
  hover:   '0 8px 24px rgba(0,0,0,0.08)',
  modal:   '0 16px 48px rgba(0,0,0,0.12)',
  sidebar: '2px 0 16px rgba(0,0,0,0.04)',
  inset:   'inset 0 2px 4px rgba(0,0,0,0.06)',
} as const;

// ─── Typography ───────────────────────────────────────────────────
export const fontFamily = {
  sans: "'Pretendard', 'Noto Sans KR', 'Arial', sans-serif",
  mono: "'JetBrains Mono', 'Consolas', monospace",
} as const;

export const fontSize = {
  '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
  xs:    ['0.75rem',  { lineHeight: '1rem' }],       // 12px
  sm:    ['0.8125rem',{ lineHeight: '1.125rem' }],   // 13px
  md:    ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
  lg:    ['1rem',     { lineHeight: '1.5rem' }],     // 16px
  xl:    ['1.25rem',  { lineHeight: '1.75rem' }],    // 20px
  '2xl': ['1.5rem',   { lineHeight: '2rem' }],       // 24px
  '3xl': ['2rem',     { lineHeight: '2.5rem' }],     // 32px
  '4xl': ['2.5rem',   { lineHeight: '3rem' }],       // 40px
} as const;

export const fontWeight = {
  regular:   400,
  medium:    500,
  semibold:  600,
  bold:      700,
  extrabold: 800,
  black:     900,
} as const;

// ─── Border ───────────────────────────────────────────────────────
export const borderWidth = {
  none:    '0',
  thin:    '1px',
  default: '1px',
  medium:  '1.5px',
  thick:   '2px',
} as const;

// ─── Transition ───────────────────────────────────────────────────
export const transition = {
  duration: {
    instant: '0ms',
    fast:    '100ms',
    normal:  '150ms',
    slow:    '200ms',
    slower:  '300ms',
  },
  easing: {
    default:   'cubic-bezier(0.4, 0, 0.2, 1)',
    in:        'cubic-bezier(0.4, 0, 1, 1)',
    out:       'cubic-bezier(0, 0, 0.2, 1)',
    inOut:     'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────
export const zIndex = {
  base:        0,
  dropdown:    10,
  sticky:      20,
  overlay:     30,
  modal:       40,
  toast:       50,
  tooltip:     60,
  designSystem: 9999,   // 디자인 시스템 카탈로그 전용
} as const;

// ─── Layout ───────────────────────────────────────────────────────
export const layout = {
  screen: {
    width:  1024,
    height: 768,
  },
  header: {
    height: 48,
  },
  footer: {
    height: 56,
  },
  sidebar: {
    width:     300,
    widthSm:   260,
  },
  categoryBar: {
    height: 48,
  },
  navColumn: {
    width: 56,
  },
} as const;

// ─── Touch Target ─────────────────────────────────────────────────
export const touchTarget = {
  min:    44,    // 최소 터치 영역 (WCAG 기준)
  button: 48,   // 일반 버튼
  lg:     56,   // 큰 버튼 (결제, 확인)
  xl:     64,   // 특대 버튼 (키패드 키)
  nav:    40,   // 네비게이션 아이템
  list:   48,   // 목록 아이템
} as const;

// ─── Opacity ──────────────────────────────────────────────────────
export const opacity = {
  disabled:   0.4,
  hover:      0.8,
  overlay:    0.5,
  overlayDark:0.7,
  subtle:     0.6,
  muted:      0.3,
} as const;

// ─── Icon Size ────────────────────────────────────────────────────
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

// ─── Aggregate Export ─────────────────────────────────────────────
const theme = {
  color,
  spacing,
  radius,
  shadow,
  fontFamily,
  fontSize,
  fontWeight,
  borderWidth,
  transition,
  zIndex,
  layout,
  touchTarget,
  opacity,
  iconSize,
} as const;

export default theme;
