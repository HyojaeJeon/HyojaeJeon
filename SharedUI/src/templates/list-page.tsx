import type { ReactNode } from 'react';
import { sharedUiTokens } from '../foundation/tokens';
import { PageHeader, type PageHeaderProps } from '../composites/page-header';
import { SummaryStrip } from '../composites/summary-strip';
import type { SharedUiStat } from '../types';

export interface ListPageTemplateProps {
  header: PageHeaderProps;
  summaryItems?: SharedUiStat[];
  filters?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}

export function ListPageTemplate({ header, summaryItems, filters, children, aside }: ListPageTemplateProps) {
  return (
    <main style={{ minHeight: '100vh', background: sharedUiTokens.colors.page }}>
      <div style={{ maxWidth: sharedUiTokens.layout.pageWidth, margin: '0 auto', padding: `0 ${sharedUiTokens.spacing.xl} ${sharedUiTokens.spacing['3xl']}` }}>
        <PageHeader {...header} />
        {summaryItems && summaryItems.length > 0 && <SummaryStrip items={summaryItems} />}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: aside ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)',
            gap: sharedUiTokens.spacing.xl,
            marginTop: sharedUiTokens.spacing.xl,
          }}
        >
          <section style={{ display: 'grid', gap: sharedUiTokens.spacing.lg }}>
            {filters}
            {children}
          </section>
          {aside && <aside>{aside}</aside>}
        </div>
      </div>
    </main>
  );
}

