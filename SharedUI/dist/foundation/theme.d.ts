export declare const sharedUiTheme: {
    readonly name: "platform-shared-ui";
    readonly tokens: {
        readonly colors: {
            readonly page: "var(--surface-0)";
            readonly surface: "var(--surface-1)";
            readonly surfaceMuted: "var(--surface-2)";
            readonly surfaceSoft: "var(--surface-4)";
            readonly text: "var(--fg)";
            readonly textMuted: "var(--fg-muted)";
            readonly textSubtle: "var(--fg-subtle)";
            readonly border: "var(--border)";
            readonly borderStrong: "var(--border-strong)";
            readonly brand: "var(--primary)";
            readonly brandHover: "var(--primary-hover)";
            readonly brandFg: "var(--primary-fg)";
            readonly brandSoft: "var(--primary-soft)";
            readonly success: "var(--success)";
            readonly successSoft: "var(--success-soft)";
            readonly warning: "var(--warn)";
            readonly warningSoft: "var(--warn-soft)";
            readonly danger: "var(--danger)";
            readonly dangerSoft: "var(--danger-soft)";
            readonly info: "var(--info)";
            readonly infoSoft: "var(--info-soft)";
            readonly ring: "var(--ring)";
        };
        readonly spacing: {
            readonly xs: "4px";
            readonly sm: "8px";
            readonly md: "12px";
            readonly lg: "16px";
            readonly xl: "24px";
            readonly '2xl': "32px";
            readonly '3xl': "40px";
            readonly '4xl': "56px";
        };
        readonly radius: {
            readonly xs: "6px";
            readonly sm: "10px";
            readonly md: "14px";
            readonly lg: "18px";
            readonly xl: "24px";
            readonly '2xl': "32px";
            readonly full: "999px";
        };
        readonly shadow: {
            readonly xs: "var(--shadow-xs, 0 1px 2px rgb(16 24 40 / 0.04))";
            readonly sm: "var(--shadow-sm, 0 1px 3px rgb(16 24 40 / 0.06))";
            readonly md: "var(--shadow-md, 0 4px 16px rgb(16 24 40 / 0.06))";
            readonly lg: "var(--shadow-lg, 0 16px 40px rgb(16 24 40 / 0.08))";
        };
        readonly typography: {
            readonly fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
            readonly fontMono: "'Pretendard', ui-monospace, SFMono-Regular, Menlo, monospace";
            readonly headlineWeight: 900;
            readonly bodyWeight: 500;
            readonly emphasisWeight: 700;
        };
        readonly layout: {
            readonly contentWidth: "1280px";
            readonly pageWidth: "1600px";
            readonly navRailWidth: "240px";
            readonly navRailCollapsedWidth: "72px";
            readonly topBarHeight: "64px";
        };
    };
};
export type SharedUiTheme = typeof sharedUiTheme;
