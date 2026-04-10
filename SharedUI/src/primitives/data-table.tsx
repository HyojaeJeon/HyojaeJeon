'use client';

import { sharedUiTokens as T } from '../foundation/tokens';
import type { DataTableProps } from '../types';

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  emptyState,
  caption,
  compact = false,
  onRowClick,
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 220,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.colors.textSubtle,
          fontSize: 13,
          fontFamily: T.typography.fontFamily,
          fontWeight: 500,
        }}
      >
        {emptyState ?? 'No data'}
      </div>
    );
  }

  const cellPaddingY = compact ? '8px' : '12px';
  const cellPaddingX = '14px';

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: T.radius.lg,
        background: T.colors.surface,
      }}
    >
      {caption && (
        <div
          style={{
            padding: `${T.spacing.sm} ${T.spacing.lg}`,
            borderBottom: 'none',
            color: T.colors.textMuted,
            fontSize: 12,
          }}
        >
          {caption}
        </div>
      )}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: T.typography.fontFamily,
        }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: column.align ?? 'left',
                  padding: `10px ${cellPaddingX}`,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: T.colors.textSubtle,
                  background: T.colors.surfaceMuted,
                  borderBottom: 'none',
                  whiteSpace: 'nowrap',
                  width: column.width,
                  position: 'sticky',
                  top: 0,
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              onClick={onRowClick ? () => onRowClick(row, index) : undefined}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) e.currentTarget.style.background = T.colors.surfaceMuted;
              }}
              onMouseLeave={(e) => {
                if (onRowClick) e.currentTarget.style.background = 'transparent';
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: `${cellPaddingY} ${cellPaddingX}`,
                    borderTop: `1px solid rgb(0 0 0 / 0.04)`,
                    textAlign: column.align ?? 'left',
                    verticalAlign: 'middle',
                    color: T.colors.text,
                    fontSize: 13,
                  }}
                >
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
