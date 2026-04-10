import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
const toneMap = {
    neutral: {
        bg: T.colors.surfaceMuted,
        fg: T.colors.textMuted,
        bdr: T.colors.border,
        dot: T.colors.textMuted,
    },
    brand: {
        bg: T.colors.brandSoft,
        fg: T.colors.brand,
        bdr: T.colors.brand,
        dot: T.colors.brand,
    },
    success: {
        bg: T.colors.successSoft,
        fg: T.colors.success,
        bdr: T.colors.success,
        dot: T.colors.success,
    },
    warning: {
        bg: T.colors.warningSoft,
        fg: T.colors.warning,
        bdr: T.colors.warning,
        dot: T.colors.warning,
    },
    danger: {
        bg: T.colors.dangerSoft,
        fg: T.colors.danger,
        bdr: T.colors.danger,
        dot: T.colors.danger,
    },
    info: {
        bg: T.colors.infoSoft,
        fg: T.colors.info,
        bdr: T.colors.info,
        dot: T.colors.info,
    },
};
export function Badge({ tone = 'neutral', variant = 'soft', size = 'sm', children, startDot = false, }) {
    const m = toneMap[tone];
    // border 금지 — outline 도 soft bg + shadow ring 으로 표현
    const style = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        paddingInline: size === 'sm' ? 10 : 12,
        height: size === 'sm' ? 22 : 26,
        borderRadius: 999,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 700,
        letterSpacing: '-0.005em',
        fontFamily: T.typography.fontFamily,
        background: variant === 'solid' ? m.fg : m.bg,
        color: variant === 'solid' ? '#fff' : m.fg,
        // border 금지 — PosUi 'shadow-pos-soft' 톤만 사용
        boxShadow: variant === 'solid' ? '0 1px 3px rgb(0 0 0 / 0.08)' : 'none',
        whiteSpace: 'nowrap',
    };
    void m.bdr; // deprecated — border 제거
    return (_jsxs("span", { style: style, children: [startDot && (_jsx("span", { style: {
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: m.dot,
                    flexShrink: 0,
                } })), children] }));
}
