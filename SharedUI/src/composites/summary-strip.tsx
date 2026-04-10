import type { CSSProperties } from 'react';
import { sharedUiTokens as T } from '../foundation/tokens';
import type { SharedUiStat, SharedUiTone } from '../types';

export interface SummaryStripProps {
  items: SharedUiStat[];
  columns?: number;
}

const toneAccent: Record<SharedUiTone, string> = {
  neutral: T.colors.borderStrong,
  brand: T.colors.brand,
  success: T.colors.success,
  warning: T.colors.warning,
  danger: T.colors.danger,
  info: T.colors.info,
};

const toneIconBg: Record<SharedUiTone, string> = {
  neutral: T.colors.surfaceMuted,
  brand: T.colors.brandSoft,
  success: T.colors.successSoft,
  warning: T.colors.warningSoft,
  danger: T.colors.dangerSoft,
  info: T.colors.infoSoft,
};

export function SummaryStrip({ items, columns }: SummaryStripProps) {
  const cols = columns ?? Math.min(items.length, 4);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: T.spacing.lg,
      }}
    >
      {items.map((item, index) => {
        const tone = item.tone ?? 'neutral';
        const cellStyle: CSSProperties = {
          position: 'relative',
          background: T.colors.surface,
          borderRadius: T.radius.xl,
          padding: `${T.spacing.xl}`,
          overflow: 'hidden',
          fontFamily: T.typography.fontFamily,
          boxShadow: T.shadow.sm,
          transition: 'box-shadow 160ms ease, transform 160ms ease',
        };
        return (
          <div key={index} style={cellStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.colors.textMuted,
                  letterSpacing: '-0.005em',
                }}
              >
                {item.label}
              </div>
              {item.icon && (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: T.radius.md,
                    background: toneIconBg[tone],
                    color: toneAccent[tone],
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.1,
                fontWeight: T.typography.headlineWeight, // 900
                color: T.colors.text,
                fontFamily: T.typography.fontFamily,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.03em',
              }}
            >
              {item.value}
            </div>
            {(item.hint || item.trend) && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: T.colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 500,
                }}
              >
                {item.trend && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      padding: '2px 6px',
                      borderRadius: 999,
                      background:
                        item.trend.direction === 'up'
                          ? T.colors.successSoft
                          : item.trend.direction === 'down'
                          ? T.colors.dangerSoft
                          : T.colors.surfaceMuted,
                      color:
                        item.trend.direction === 'up'
                          ? T.colors.success
                          : item.trend.direction === 'down'
                          ? T.colors.danger
                          : T.colors.textMuted,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    {item.trend.direction === 'up' ? '↑' : item.trend.direction === 'down' ? '↓' : '—'} {item.trend.label}
                  </span>
                )}
                {item.hint}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
