/**
 * Client-side CSV export utility.
 * Converts an array of objects to a CSV file and triggers a browser download.
 */
export function downloadCsv(
  data: Record<string, unknown>[],
  filename: string,
  headers?: Record<string, string>,
): void {
  if (data.length === 0) return;

  const keys = Object.keys(headers ?? data[0]);
  const headerRow = keys.map((k) => escapeCell(headers?.[k] ?? k)).join(',');

  const rows = data.map((row) =>
    keys.map((k) => escapeCell(String(row[k] ?? ''))).join(','),
  );

  const csv = [headerRow, ...rows].join('\n');
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
