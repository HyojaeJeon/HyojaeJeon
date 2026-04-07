'use client';

import Button from '@shared/ui/atoms/Button';

// -------------------------------------------------------------------
// QuickPayPanel -- QUICK 1~5 빠른결제
// account-dialog.md AD-F22
// -------------------------------------------------------------------

interface QuickPayPanelProps {
  onQuickPay: (amount: number) => void;
}

const QUICK_AMOUNTS = [10000, 20000, 30000, 50000, 100000];

export default function QuickPayPanel({ onQuickPay }: QuickPayPanelProps) {
  return (
    <div>
      <div className="text-xs text-pos-text-muted mb-2 font-semibold">빠른결제</div>
      <div className="flex gap-1">
        {QUICK_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: PAYMENT:CASH bridge command for quick payment
              onQuickPay(amount);
            }}
            className="flex-1"
          >
            {(amount / 10000).toLocaleString()}만
          </Button>
        ))}
      </div>
    </div>
  );
}
