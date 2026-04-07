'use client';

import Button from '@shared/ui/atoms/Button';

// -------------------------------------------------------------------
// DiscountPanel -- 할인/서비스 적용
// account-dialog.md AD-F06, AD-F07
// -------------------------------------------------------------------

interface DiscountPanelProps {
  onApplyDiscount: () => void;
  onApplyService?: () => void;
}

export default function DiscountPanel({
  onApplyDiscount,
  onApplyService,
}: DiscountPanelProps) {
  return (
    <div>
      <div className="text-xs text-pos-text-muted mb-2 font-semibold">할인/서비스</div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => {
            // TODO: PAYMENT:APPLY_DISCOUNT bridge command
            onApplyDiscount();
          }}
        >
          할인
        </Button>
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => {
            // TODO: PAYMENT:APPLY_DISCOUNT bridge command (service type)
            onApplyService?.();
            console.log('[DiscountPanel] apply service');
          }}
        >
          서비스
        </Button>
      </div>
    </div>
  );
}
