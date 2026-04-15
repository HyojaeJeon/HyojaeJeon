/**
 * VMeal Design System — Central Design Tokens
 *
 * 모든 UI 요소는 이 토큰을 참조한다. 디자인 변경 시 이 파일만 수정하면
 * 전체 앱에 자동 반영된다.
 *
 * 참조: 식권대장 앱 디자인 패턴 (깔끔한 카드, 넉넉한 여백, 뚜렷한 타이포 위계)
 */

/* ─── Colors ─── */
export const colors = {
  /** 브랜드 */
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#EFF6FF',
  primarySoft: '#DBEAFE',

  /** 상태 */
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',

  /** 배경 */
  bg: '#F5F6F8',
  bgWhite: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgInput: '#F9FAFB',

  /** 텍스트 */
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textPlaceholder: '#D1D5DB',
  textInverse: '#FFFFFF',

  /** 테두리/구분선 */
  border: '#F3F4F6',
  borderLight: '#F9FAFB',
  divider: '#F3F4F6',
} as const;

/* ─── Typography ─── */
export const typography = {
  /** 화면 제목 (WalletHome 인사말 등) */
  screenTitle: { fontSize: 26, fontWeight: '800' as const, lineHeight: 34, color: colors.textPrimary },
  /** 섹션 제목 */
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, lineHeight: 26, color: colors.textPrimary },
  /** 카드 내 제목 */
  cardTitle: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22, color: colors.textPrimary },
  /** 본문 */
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: colors.textSecondary },
  /** 보조 텍스트 */
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18, color: colors.textTertiary },
  /** 오버라인 (섹션 레이블) */
  overline: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, color: colors.textTertiary, letterSpacing: 0.5 },
  /** 큰 숫자 (잔액 등) */
  displayLarge: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, color: colors.textPrimary },
  /** 중간 숫자 */
  displayMedium: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32, color: colors.textPrimary },
  /** 버튼 텍스트 */
  button: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  /** 탭 라벨 */
  tabLabel: { fontSize: 10, fontWeight: '500' as const, lineHeight: 14 },
} as const;

/* ─── Spacing ─── */
export const spacing = {
  /** 화면 좌우 패딩 */
  screenHorizontal: 20,
  /** 카드 내부 패딩 */
  cardPadding: 20,
  /** 카드 내부 컴팩트 */
  cardPaddingCompact: 16,
  /** 섹션 간 간격 */
  sectionGap: 28,
  /** 요소 간 간격 (카드 내부) */
  elementGap: 12,
  /** 아이템 간 간격 (리스트) */
  itemGap: 10,
  /** 최소 여백 */
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

/* ─── Border Radius ─── */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

/* ─── Shadows ─── */
export const shadows = {
  /** 카드 기본 (부드럽게 퍼지는) */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },
  /** 카드 호버/강조 */
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  /** 잔액 카드 (브랜드 컬러 섀도) */
  balanceCard: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  /** 버튼 */
  button: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  /** 없음 */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

/* ─── Component-specific tokens ─── */
export const components = {
  /** 카드 */
  card: {
    borderRadius: radius.xl,
    padding: spacing.cardPadding,
    backgroundColor: colors.bgCard,
    ...shadows.card,
  },
  /** 입력 필드 */
  input: {
    height: 52,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgInput,
    fontSize: 15,
  },
  /** 아바타 */
  avatar: {
    sm: { size: 36, fontSize: 14 },
    md: { size: 44, fontSize: 16 },
    lg: { size: 56, fontSize: 20 },
    xl: { size: 72, fontSize: 28 },
  },
  /** 탭 바 */
  tabBar: {
    height: 60,
    backgroundColor: colors.bgWhite,
    activeTint: colors.primary,
    inactiveTint: colors.textTertiary,
  },
} as const;
