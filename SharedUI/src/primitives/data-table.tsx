import { sharedUiTokens } from '../foundation/tokens';
import type { DataTableProps } from '../types';

export function DataTable<T>({ columns, rows, rowKey, emptyState, caption }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          border: `1px dashed ${sharedUiTokens.colors.border}`,
          borderRadius: sharedUiTokens.radius.lg,
          background: sharedUiTokens.colors.surfaceMuted,
          padding: sharedUiTokens.spacing['2xl'],
          color: sharedUiTokens.colors.textMuted,
          textAlign: 'center',
        }}
      >
        {emptyState ?? 'No data'}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${sharedUiTokens.colors.border}`, borderRadius: sharedUiTokens.radius.lg }}>
      {caption && (
        <div style={{ padding: sharedUiTokens.spacing.lg, borderBottom: `1px solid ${sharedUiTokens.colors.border}`, color: sharedUiTokens.colors.textMuted, fontSize: 13 }}>
          {caption}
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: sharedUiTokens.colors.surface }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: column.align ?? 'left',
                  padding: '14px 16px',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: sharedUiTokens.colors.textMuted,
                  background: sharedUiTokens.colors.surfaceMuted,
                  whiteSpace: 'nowrap',
                  width: column.width,
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: '14px 16px',
                    borderTop: `1px solid ${sharedUiTokens.colors.border}`,
                    textAlign: column.align ?? 'left',
                    verticalAlign: 'top',
                    color: sharedUiTokens.colors.text,
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
