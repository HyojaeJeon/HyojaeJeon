'use client';

interface ColumnDef {
  key: string;
  label: string;
  editable?: boolean;
}

interface EditableDataGridProps {
  columns: ColumnDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Array<{ id: string } & Record<string, any>>;
  selectedRowIds: Set<string>;
  onSelectedRowIdsChange: (ids: Set<string>) => void;
  onRowChange: (rowId: string, key: string, value: string) => void;
}

/**
 * EditableDataGrid -- inline-editable table grid
 *
 * POS Settings CRUD grids: inline cell editing with row selection.
 */
export default function EditableDataGrid({
  columns,
  rows,
  selectedRowIds,
  onSelectedRowIdsChange,
  onRowChange,
}: EditableDataGridProps) {
  const toggleRow = (id: string) => {
    const next = new Set(selectedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectedRowIdsChange(next);
  };

  const toggleAll = () => {
    if (selectedRowIds.size === rows.length) {
      onSelectedRowIdsChange(new Set());
    } else {
      onSelectedRowIdsChange(new Set(rows.map((r) => r.id)));
    }
  };

  return (
    <div className="overflow-auto rounded border border-pos-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-pos-surface border-b border-pos-border">
            <th className="w-8 px-2 py-1">
              <input
                type="checkbox"
                checked={rows.length > 0 && selectedRowIds.size === rows.length}
                onChange={toggleAll}
                className="accent-primary-600"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-2 py-1 text-left text-xs font-semibold text-pos-text-muted"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-6 text-center text-sm text-pos-text-muted"
              >
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-pos-border ${
                  selectedRowIds.has(row.id) ? 'bg-primary-50' : ''
                }`}
              >
                <td className="w-8 px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    className="accent-primary-600"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-2 py-1">
                    {col.editable ? (
                      <input
                        type="text"
                        value={String(row[col.key] ?? '')}
                        onChange={(e) => onRowChange(row.id, col.key, e.target.value)}
                        className="w-full bg-transparent text-sm text-pos-text outline-none border-b border-transparent focus:border-primary-500"
                      />
                    ) : (
                      <span className="text-sm text-pos-text">
                        {String(row[col.key] ?? '')}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
