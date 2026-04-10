import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
export function PageHeader({ breadcrumbs, title, description, actions, meta }) {
    return (_jsxs("header", { style: {
            display: 'flex',
            flexDirection: 'column',
            gap: T.spacing.md,
            paddingBlock: `${T.spacing.xl} ${T.spacing.xl}`,
        }, children: [breadcrumbs && breadcrumbs.length > 0 && (_jsx("nav", { style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    fontSize: 12,
                    color: T.colors.textSubtle,
                    fontFamily: T.typography.fontFamily,
                    fontWeight: 500,
                }, children: breadcrumbs.map((crumb, index) => (_jsxs("span", { style: { display: 'inline-flex', gap: 6 }, children: [index > 0 && _jsx("span", { style: { color: T.colors.textSubtle }, children: "\u203A" }), crumb.href ? (_jsx("a", { href: crumb.href, style: { color: T.colors.textMuted, textDecoration: 'none', fontWeight: 500 }, children: crumb.label })) : (crumb.label)] }, `${String(crumb.label)}-${index}`))) })), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: T.spacing.lg,
                    flexWrap: 'wrap',
                }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("h1", { style: {
                                    margin: 0,
                                    fontSize: 28,
                                    lineHeight: 1.15,
                                    letterSpacing: '-0.028em',
                                    color: T.colors.text,
                                    fontWeight: T.typography.headlineWeight, // Pretendard Black 900
                                    fontFamily: T.typography.fontFamily,
                                }, children: title }), description && (_jsx("p", { style: {
                                    margin: '8px 0 0',
                                    fontSize: 13.5,
                                    lineHeight: 1.6,
                                    color: T.colors.textMuted,
                                    fontFamily: T.typography.fontFamily,
                                    fontWeight: 500,
                                }, children: description })), meta && _jsx("div", { style: { marginTop: 10 }, children: meta })] }), actions && _jsx("div", { style: { display: 'flex', gap: T.spacing.sm, flexWrap: 'wrap' }, children: actions })] })] }));
}
