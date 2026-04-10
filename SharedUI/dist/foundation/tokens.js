/**
 * SharedUI Design Tokens v2 — "Friendly Operator Console"
 *
 * 소비자 앱 (Portal) 의 globals.css 가 다음 CSS 변수를 정의한다고 가정:
 *   --surface-0~4, --border, --border-strong
 *   --fg, --fg-muted, --fg-subtle, --fg-inverse
 *   --primary, --primary-hover, --primary-fg, --primary-soft
 *   --success(-soft), --warn(-soft), --danger(-soft), --info(-soft), --ring
 *   --shadow-xs, --shadow-sm, --shadow-md, --shadow-lg
 */
export const sharedUiTokens = {
    colors: {
        page: 'var(--surface-0)',
        surface: 'var(--surface-1)',
        surfaceMuted: 'var(--surface-2)',
        surfaceSoft: 'var(--surface-4)',
        text: 'var(--fg)',
        textMuted: 'var(--fg-muted)',
        textSubtle: 'var(--fg-subtle)',
        border: 'var(--border)',
        borderStrong: 'var(--border-strong)',
        brand: 'var(--primary)',
        brandHover: 'var(--primary-hover)',
        brandFg: 'var(--primary-fg)',
        brandSoft: 'var(--primary-soft)',
        success: 'var(--success)',
        successSoft: 'var(--success-soft)',
        warning: 'var(--warn)',
        warningSoft: 'var(--warn-soft)',
        danger: 'var(--danger)',
        dangerSoft: 'var(--danger-soft)',
        info: 'var(--info)',
        infoSoft: 'var(--info-soft)',
        ring: 'var(--ring)',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '56px',
    },
    radius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '24px',
        '2xl': '32px',
        full: '999px',
    },
    shadow: {
        xs: 'var(--shadow-xs, 0 1px 2px rgb(16 24 40 / 0.04))',
        sm: 'var(--shadow-sm, 0 1px 3px rgb(16 24 40 / 0.06))',
        md: 'var(--shadow-md, 0 4px 16px rgb(16 24 40 / 0.06))',
        lg: 'var(--shadow-lg, 0 16px 40px rgb(16 24 40 / 0.08))',
    },
    typography: {
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        fontMono: "'Pretendard', ui-monospace, SFMono-Regular, Menlo, monospace",
        /** 플랫폼 규정: 헤드라인은 Pretendard Black (900) */
        headlineWeight: 900,
        /** 본문 기본 500 */
        bodyWeight: 500,
        /** 강조 semibold 600~700 */
        emphasisWeight: 700,
    },
    layout: {
        contentWidth: '1280px',
        pageWidth: '1600px',
        navRailWidth: '240px',
        navRailCollapsedWidth: '72px',
        topBarHeight: '64px',
    },
};
