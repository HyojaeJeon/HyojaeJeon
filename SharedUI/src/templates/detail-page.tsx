import type { ReactNode } from 'react';
import { sharedUiTokens } from '../foundation/tokens';
import { PageHeader, type PageHeaderProps } from '../composites/page-header';
import { SummaryStrip } from '../composites/summary-strip';
import type { SharedUiStat } from '../types';

export interface DetailPageTemplateProps {
  header: PageHeaderProps;
  summaryItems?: SharedUiStat[];
  tabs?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}

export function DetailPageTemplate({ header, summaryItems, tabs, sidebar, children }: DetailPageTemplateProps) {
  return (
    <main style={{ minHeight: '100vh', background: sharedUiTokens.colors.page }}>
      <div style={{ maxWidth: sharedUiTokens.layout.pageWidth, margin: '0 auto', padding: `0 ${sharedUiTokens.spacing.xl} ${sharedUiTokens.spacing['3xl']}` }}>
        <PageHeader {...header} />
        {summaryItems && summaryItems.length > 0 && <SummaryStrip items={summaryItems} />}
        {tabs && <div style={{ marginTop: sharedUiTokens.spacing.xl }}>{tabs}</div>}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: sidebar ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)',
            gap: sharedUiTokens.spacing.xl,
            marginTop: sharedUiTokens.spacing.xl,
          }}
        >
          <section>{children}</section>
          {sidebar && <aside>{sidebar}</aside>}
        </div>
      </div>
    </main>
  );
}

