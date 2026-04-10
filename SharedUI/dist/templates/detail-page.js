import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
import { PageHeader } from '../composites/page-header';
import { SummaryStrip } from '../composites/summary-strip';
export function DetailPageTemplate({ header, summaryItems, tabs, sidebar, children, }) {
    return (_jsxs("div", { style: {
            padding: `0 ${T.spacing.xl} ${T.spacing['2xl']}`,
            maxWidth: T.layout.pageWidth,
            margin: '0 auto',
        }, children: [_jsx(PageHeader, { ...header }), summaryItems && summaryItems.length > 0 && (_jsx("div", { style: { marginBottom: T.spacing.lg }, children: _jsx(SummaryStrip, { items: summaryItems }) })), tabs && _jsx("div", { style: { marginBottom: T.spacing.lg }, children: tabs }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: sidebar ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)',
                    gap: T.spacing.lg,
                }, children: [_jsx("section", { style: { minWidth: 0 }, children: children }), sidebar && _jsx("aside", { children: sidebar })] })] }));
}
