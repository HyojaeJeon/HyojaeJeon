import type { ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
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

export function ListPageTemplate({
  header,
  summaryItems,
  filters,
  children,
  aside,
}: ListPageTemplateProps) {
  return (
    <div
      style={{
        padding: `0 ${T.spacing.xl} ${T.spacing['2xl']}`,
        maxWidth: T.layout.pageWidth,
        margin: '0 auto',
      }}
    >
      <PageHeader {...header} />
      {summaryItems && summaryItems.length > 0 && (
        <div style={{ marginBottom: T.spacing.lg }}>
          <SummaryStrip items={summaryItems} />
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: aside ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)',
          gap: T.spacing.lg,
        }}
      >
        <section style={{ display: 'grid', gap: T.spacing.md, minWidth: 0 }}>
          {filters}
          {children}
        </section>
        {aside && <aside>{aside}</aside>}
      </div>
    </div>
  );
}
