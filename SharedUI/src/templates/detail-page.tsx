import type { ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
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

export function DetailPageTemplate({
  header,
  summaryItems,
  tabs,
  sidebar,
  children,
}: DetailPageTemplateProps) {
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
      {tabs && <div style={{ marginBottom: T.spacing.lg }}>{tabs}</div>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: sidebar ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)',
          gap: T.spacing.lg,
        }}
      >
        <section style={{ minWidth: 0 }}>{children}</section>
        {sidebar && <aside>{sidebar}</aside>}
      </div>
    </div>
  );
}
