export interface DateIdCursorPayload {
  createdAt: string;
  id: string;
}

export function encodeDateIdCursor(payload: DateIdCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeDateIdCursor(cursor: string): DateIdCursorPayload {
  const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
  const parsed = JSON.parse(decoded) as Partial<DateIdCursorPayload>;

  if (
    typeof parsed.createdAt !== 'string' ||
    typeof parsed.id !== 'string' ||
    Number.isNaN(Date.parse(parsed.createdAt))
  ) {
    throw new Error('Invalid cursor payload');
  }

  return {
    createdAt: parsed.createdAt,
    id: parsed.id,
  };
}
