import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
const toneAccent = {
    neutral: T.colors.borderStrong,
    brand: T.colors.brand,
    success: T.colors.success,
    warning: T.colors.warning,
    danger: T.colors.danger,
    info: T.colors.info,
};
const toneIconBg = {
    neutral: T.colors.surfaceMuted,
    brand: T.colors.brandSoft,
    success: T.colors.successSoft,
    warning: T.colors.warningSoft,
    danger: T.colors.dangerSoft,
    info: T.colors.infoSoft,
};
export function SummaryStrip({ items, columns }) {
    const cols = columns ?? Math.min(items.length, 4);
    return (_jsx("div", { style: {
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: T.spacing.lg,
        }, children: items.map((item, index) => {
            const tone = item.tone ?? 'neutral';
            const cellStyle = {
                position: 'relative',
                background: T.colors.surface,
                borderRadius: T.radius.xl,
                padding: `${T.spacing.xl}`,
                overflow: 'hidden',
                fontFamily: T.typography.fontFamily,
                boxShadow: T.shadow.sm,
                transition: 'box-shadow 160ms ease, transform 160ms ease',
            };
            return (_jsxs("div", { style: cellStyle, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            marginBottom: 12,
                        }, children: [_jsx("div", { style: {
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: T.colors.textMuted,
                                    letterSpacing: '-0.005em',
                                }, children: item.label }), item.icon && (_jsx("div", { style: {
                                    width: 36,
                                    height: 36,
                                    borderRadius: T.radius.md,
                                    background: toneIconBg[tone],
                                    color: toneAccent[tone],
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }, children: item.icon }))] }), _jsx("div", { style: {
                            fontSize: 30,
                            lineHeight: 1.1,
                            fontWeight: T.typography.headlineWeight, // 900
                            color: T.colors.text,
                            fontFamily: T.typography.fontFamily,
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.03em',
                        }, children: item.value }), (item.hint || item.trend) && (_jsxs("div", { style: {
                            marginTop: 8,
                            fontSize: 12,
                            color: T.colors.textMuted,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontWeight: 500,
                        }, children: [item.trend && (_jsxs("span", { style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    padding: '2px 6px',
                                    borderRadius: 999,
                                    background: item.trend.direction === 'up'
                                        ? T.colors.successSoft
                                        : item.trend.direction === 'down'
                                            ? T.colors.dangerSoft
                                            : T.colors.surfaceMuted,
                                    color: item.trend.direction === 'up'
                                        ? T.colors.success
                                        : item.trend.direction === 'down'
                                            ? T.colors.danger
                                            : T.colors.textMuted,
                                    fontWeight: 700,
                                    fontSize: 11,
                                }, children: [item.trend.direction === 'up' ? '↑' : item.trend.direction === 'down' ? '↓' : '—', " ", item.trend.label] })), item.hint] }))] }, index));
        }) }));
}
