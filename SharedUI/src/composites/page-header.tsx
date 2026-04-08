import type { ReactNode } from 'react';
import { sharedUiTokens } from '../foundation/tokens';
import type { SharedUiBreadcrumb } from '../types';

export interface PageHeaderProps {
  breadcrumbs?: SharedUiBreadcrumb[];
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ breadcrumbs, title, description, actions }: PageHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: sharedUiTokens.spacing.md,
        padding: `${sharedUiTokens.spacing.xl} 0`,
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 13, color: sharedUiTokens.colors.textMuted }}>
          {breadcrumbs.map((crumb, index) => (
            <span key={`${String(crumb.label)}-${index}`}>
              {index > 0 && <span style={{ marginRight: 8 }}>/</span>}
              {crumb.href ? <a href={crumb.href} style={{ color: 'inherit', textDecoration: 'none' }}>{crumb.label}</a> : crumb.label}
            </span>
          ))}
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: sharedUiTokens.spacing.lg }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1, color: sharedUiTokens.colors.text }}>{title}</h1>
          {description && <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: sharedUiTokens.colors.textMuted }}>{description}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}

