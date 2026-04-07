'use client';

type StepperSize = 'sm' | 'md' | 'lg';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  /** sm: 28px 버튼, md: 44px 버튼 (기본) */
  size?: StepperSize;
}

const sizeConfig: Record<StepperSize, { btn: string; val: string; font: string }> = {
  sm: { btn: 'w-7 h-7 text-sm', val: 'min-w-[1.5rem] text-sm px-1.5', font: 'text-sm' },
  md: { btn: 'w-touch h-touch text-xl', val: 'min-w-[3rem] text-lg px-3', font: 'text-lg' },
  lg: { btn: 'w-14 h-14 text-2xl', val: 'min-w-[4rem] text-2xl px-4', font: 'text-2xl' },
};

/**
 * Stepper — 수량 +/- 조절 컴포넌트
 *
 * POS 주문 화면에서 메뉴 수량 조절에 사용.
 * size="sm"은 주문 카드 내부 등 좁은 공간용.
 */
export default function Stepper({
  value, onChange, min = 0, max, disabled = false, size = 'md',
}: StepperProps) {
  const canDecrement = !disabled && value > (min ?? 0);
  const canIncrement = !disabled && (max == null || value < max);
  const s = sizeConfig[size];

  return (
    <div className={`inline-flex items-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        type="button"
        disabled={!canDecrement}
        onClick={() => canDecrement && onChange(value - 1)}
        className={`${s.btn} flex items-center justify-center rounded-lg font-bold select-none cursor-pointer active:scale-[0.92] transition-transform ${
          canDecrement ? 'bg-pos-surface text-pos-text active:bg-pos-border' : 'bg-pos-surface/60 text-pos-text-muted cursor-not-allowed'
        }`}
      >−</button>

      <div className={`${s.val} h-full flex items-center justify-center`}>
        <span className={`${s.font} font-bold text-pos-text tabular-nums select-none`}>{value}</span>
      </div>

      <button
        type="button"
        disabled={!canIncrement}
        onClick={() => canIncrement && onChange(value + 1)}
        className={`${s.btn} flex items-center justify-center rounded-lg font-bold select-none cursor-pointer active:scale-[0.92] transition-transform ${
          canIncrement ? 'bg-pos-surface text-pos-text active:bg-pos-border' : 'bg-pos-surface/60 text-pos-text-muted cursor-not-allowed'
        }`}
      >+</button>
    </div>
  );
}
