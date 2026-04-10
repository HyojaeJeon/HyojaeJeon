import type { ReactNode } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
import type { SharedUiBreadcrumb } from '../types';

export interface PageHeaderProps {
  breadcrumbs?: SharedUiBreadcrumb[];
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function PageHeader({ breadcrumbs, title, description, actions, meta }: PageHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: T.spacing.md,
        paddingBlock: `${T.spacing.xl} ${T.spacing.xl}`,
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            fontSize: 12,
            color: T.colors.textSubtle,
            fontFamily: T.typography.fontFamily,
            fontWeight: 500,
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={`${String(crumb.label)}-${index}`} style={{ display: 'inline-flex', gap: 6 }}>
              {index > 0 && <span style={{ color: T.colors.textSubtle }}>›</span>}
              {crumb.href ? (
                <a href={crumb.href} style={{ color: T.colors.textMuted, textDecoration: 'none', fontWeight: 500 }}>
                  {crumb.label}
                </a>
              ) : (
                crumb.label
              )}
            </span>
          ))}
        </nav>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: T.spacing.lg,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.15,
              letterSpacing: '-0.028em',
              color: T.colors.text,
              fontWeight: T.typography.headlineWeight, // Pretendard Black 900
              fontFamily: T.typography.fontFamily,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13.5,
                lineHeight: 1.6,
                color: T.colors.textMuted,
                fontFamily: T.typography.fontFamily,
                fontWeight: 500,
              }}
            >
              {description}
            </p>
          )}
          {meta && <div style={{ marginTop: 10 }}>{meta}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: T.spacing.sm, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </header>
  );
}
