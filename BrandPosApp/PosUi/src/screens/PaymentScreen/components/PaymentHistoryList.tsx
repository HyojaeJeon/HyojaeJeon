'use client';

// -------------------------------------------------------------------
// PaymentHistoryList -- 결제내역 리스트
// account-dialog.md IDC_A_ACCOUNTLIST
// -------------------------------------------------------------------

interface PaymentEntry {
  id: string;
  method: string;
  amount: number;
}

interface PaymentHistoryListProps {
  entries: PaymentEntry[];
}

export default function PaymentHistoryList({ entries }: PaymentHistoryListProps) {
  const fmt = (v: number) => v.toLocaleString('ko-KR');

  if (entries.length === 0) {
    return (
      <div className="p-3 text-xs text-pos-text-muted text-center border-t border-pos-border shrink-0">
        결제 내역 없음
      </div>
    );
  }

  return (
    <div className="border-t border-pos-border shrink-0 max-h-24 overflow-auto">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex justify-between items-center px-3 py-1 text-xs border-b border-pos-border"
        >
          <span className="text-pos-text-secondary">{entry.method}</span>
          <span className="text-pos-text font-semibold tabular-nums">{fmt(entry.amount)}원</span>
        </div>
      ))}
    </div>
  );
}
