import { sharedUiTokens } from '../foundation/tokens';
import type { SharedUiStat } from '../types';

export interface SummaryStripProps {
  items: SharedUiStat[];
}

export function SummaryStrip({ items }: SummaryStripProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
        gap: sharedUiTokens.spacing.lg,
      }}
    >
      {items.map((item) => (
        <div
          key={String(item.label)}
          style={{
            background: sharedUiTokens.colors.surface,
            border: `1px solid ${sharedUiTokens.colors.border}`,
            borderRadius: sharedUiTokens.radius.lg,
            padding: sharedUiTokens.spacing.lg,
            boxShadow: sharedUiTokens.shadow.sm,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: sharedUiTokens.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {item.label}
          </div>
          <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800, color: sharedUiTokens.colors.text }}>
            {item.value}
          </div>
          {item.hint && <div style={{ marginTop: 6, fontSize: 13, color: sharedUiTokens.colors.textMuted }}>{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}
