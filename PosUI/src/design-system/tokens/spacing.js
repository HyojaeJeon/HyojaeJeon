/**
 * HyojungPOS 간격/터치 타깃 토큰
 * POS 터치스크린 기준 — 최소 터치 영역 44x44px
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const touchTarget = {
  min: 44,       // 최소 터치 영역 (px)
  button: 48,    // 일반 버튼 높이
  buttonLarge: 56, // 큰 버튼 높이
};

export const layout = {
  screenWidth: 1024,
  screenHeight: 768,
  sidebarWidth: 200,
  headerHeight: 48,
  footerHeight: 56,
};
