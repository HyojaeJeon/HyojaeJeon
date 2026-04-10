import type { ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
import { PageHeader, type PageHeaderProps } from '../composites/page-header';
import { SummaryStrip } from '../composites/summary-strip';
import type { SharedUiStat } from '../types';

export interface DashboardPageTemplateProps {
  header: PageHeaderProps;
  metrics?: SharedUiStat[];
  primary: ReactNode;
  secondary?: ReactNode;
}

export function DashboardPageTemplate({
  header,
  metrics,
  primary,
  secondary,
}: DashboardPageTemplateProps) {
  return (
    <div
      style={{
        padding: `0 ${T.spacing.xl} ${T.spacing['2xl']}`,
        maxWidth: T.layout.pageWidth,
        margin: '0 auto',
      }}
    >
      <PageHeader {...header} />
      {metrics && metrics.length > 0 && (
        <div style={{ marginBottom: T.spacing.lg }}>
          <SummaryStrip items={metrics} />
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: secondary ? 'minmax(0, 1fr) 380px' : 'minmax(0, 1fr)',
          gap: T.spacing.lg,
        }}
      >
        <section style={{ minWidth: 0, display: 'grid', gap: T.spacing.md }}>{primary}</section>
        {secondary && (
          <aside style={{ display: 'grid', gap: T.spacing.md }}>{secondary}</aside>
        )}
      </div>
    </div>
  );
}
