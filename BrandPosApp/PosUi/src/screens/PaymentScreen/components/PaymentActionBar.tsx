'use client';

import Button from '@shared/ui/atoms/Button';

// -------------------------------------------------------------------
// PaymentActionBar -- 결제완료/취소/초기화/인쇄/이전결제
// account-dialog.md AD-F08~F11, AD-F10, AD-F20
// -------------------------------------------------------------------

interface PaymentActionBarProps {
  onComplete: () => void;
  onCancel: () => void;
  onReset: () => void;
  onPrint: () => void;
  onViewPrevious?: () => void;
  onOpenCashDrawer?: () => void;
  onTempSign?: () => void;
}

export default function PaymentActionBar({
  onComplete,
  onCancel,
  onReset,
  onPrint,
  onViewPrevious,
  onOpenCashDrawer,
  onTempSign,
}: PaymentActionBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-pos-bg border-t border-pos-border shrink-0">
      {/* Primary actions */}
      <Button variant="primary" size="lg" onClick={onComplete} className="flex-1">
        결제완료
      </Button>

      <Button variant="danger" size="lg" onClick={onCancel}>
        닫기
      </Button>

      {/* Secondary actions */}
      <div className="flex items-center gap-1 ml-2">
        <Button variant="secondary" size="sm" onClick={onReset}>
          초기화
        </Button>

        <Button variant="secondary" size="sm" onClick={onPrint}>
          영수증
        </Button>

        {onViewPrevious && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // TODO: SALES:VIEW bridge command
              onViewPrevious();
            }}
          >
            이전결제
          </Button>
        )}

        {onOpenCashDrawer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // TODO: open cash drawer device command
              onOpenCashDrawer();
            }}
          >
            시재함
          </Button>
        )}

        {onTempSign && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // TODO: temporary signature command
              onTempSign();
            }}
          >
            임시서명
          </Button>
        )}
      </div>
    </div>
  );
}
