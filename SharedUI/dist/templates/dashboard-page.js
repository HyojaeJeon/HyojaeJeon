import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sharedUiTokens as T } from '../foundation/tokens';
import { PageHeader } from '../composites/page-header';
import { SummaryStrip } from '../composites/summary-strip';
export function DashboardPageTemplate({ header, metrics, primary, secondary, }) {
    return (_jsxs("div", { style: {
            padding: `0 ${T.spacing.xl} ${T.spacing['2xl']}`,
            maxWidth: T.layout.pageWidth,
            margin: '0 auto',
        }, children: [_jsx(PageHeader, { ...header }), metrics && metrics.length > 0 && (_jsx("div", { style: { marginBottom: T.spacing.lg }, children: _jsx(SummaryStrip, { items: metrics }) })), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: secondary ? 'minmax(0, 1fr) 380px' : 'minmax(0, 1fr)',
                    gap: T.spacing.lg,
                }, children: [_jsx("section", { style: { minWidth: 0, display: 'grid', gap: T.spacing.md }, children: primary }), secondary && (_jsx("aside", { style: { display: 'grid', gap: T.spacing.md }, children: secondary }))] })] }));
}
