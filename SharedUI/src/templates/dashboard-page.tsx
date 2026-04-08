import type { ReactNode } from 'react';
import { sharedUiTokens } from '../foundation/tokens';
import { PageHeader, type PageHeaderProps } from '../composites/page-header';
import { SummaryStrip } from '../composites/summary-strip';
import type { SharedUiStat } from '../types';

export interface DashboardPageTemplateProps {
  header: PageHeaderProps;
  metrics?: SharedUiStat[];
  primary: ReactNode;
  secondary?: ReactNode;
}

export function DashboardPageTemplate({ header, metrics, primary, secondary }: DashboardPageTemplateProps) {
  return (
    <main style={{ minHeight: '100vh', background: sharedUiTokens.colors.page }}>
      <div style={{ maxWidth: sharedUiTokens.layout.pageWidth, margin: '0 auto', padding: `0 ${sharedUiTokens.spacing.xl} ${sharedUiTokens.spacing['3xl']}` }}>
        <PageHeader {...header} />
        {metrics && metrics.length > 0 && <SummaryStrip items={metrics} />}
        <div style={{ display: 'grid', gridTemplateColumns: secondary ? 'minmax(0, 1fr) 360px' : 'minmax(0, 1fr)', gap: sharedUiTokens.spacing.xl, marginTop: sharedUiTokens.spacing.xl }}>
          <section>{primary}</section>
          {secondary && <aside>{secondary}</aside>}
        </div>
      </div>
    </main>
  );
}

