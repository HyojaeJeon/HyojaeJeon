export const sharedUiTokens = {
  colors: {
    page: '#f8fafc',
    surface: '#ffffff',
    surfaceMuted: '#f1f5f9',
    surfaceSoft: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#475569',
    border: '#dbe2ea',
    brand: '#0f766e',
    brandSoft: '#ccfbf1',
    success: '#047857',
    warning: '#b45309',
    danger: '#b91c1c',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
  },
  radius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '24px',
  },
  shadow: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
    md: '0 10px 30px rgba(15, 23, 42, 0.08)',
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  layout: {
    contentWidth: '1200px',
    pageWidth: '1440px',
  },
} as const;

