'use client';

interface NumPadProps {
  onInput: (key: string) => void;
  onConfirm?: () => void;
  onClear: () => void;
  onBackspace: () => void;
  disabled?: boolean;
  /**
   * 'standard' (기본): 4x4, '확인' 버튼 포함, '00'/'000' 금액 키 포함.
   * 'compact'        : 4x3, '확인' 없음. 비밀번호/숫자 ID 입력용.
   *                    LoginScreen 등 confirm 액션이 별도 버튼인 화면에서 사용.
   */
  variant?: 'standard' | 'compact';
}

interface KeyDef {
  label: string;
  action: 'input' | 'clear' | 'backspace' | 'confirm';
  variant: 'default' | 'warn' | 'primary';
}

const COMPACT_KEYS: KeyDef[][] = [
  [
    { label: '7',   action: 'input',     variant: 'default' },
    { label: '8',   action: 'input',     variant: 'default' },
    { label: '9',   action: 'input',     variant: 'default' },
    { label: 'C',   action: 'clear',     variant: 'warn' },
  ],
  [
    { label: '4',   action: 'input',     variant: 'default' },
    { label: '5',   action: 'input',     variant: 'default' },
    { label: '6',   action: 'input',     variant: 'default' },
    { label: '←',   action: 'backspace', variant: 'primary' },
  ],
  [
    { label: '1',   action: 'input',     variant: 'default' },
    { label: '2',   action: 'input',     variant: 'default' },
    { label: '3',   action: 'input',     variant: 'default' },
    { label: '0',   action: 'input',     variant: 'default' },
  ],
];

const KEYS: KeyDef[][] = [
  [
    { label: '1',   action: 'input',     variant: 'default' },
    { label: '2',   action: 'input',     variant: 'default' },
    { label: '3',   action: 'input',     variant: 'default' },
    { label: 'C',   action: 'clear',     variant: 'warn' },
  ],
  [
    { label: '4',   action: 'input',     variant: 'default' },
    { label: '5',   action: 'input',     variant: 'default' },
    { label: '6',   action: 'input',     variant: 'default' },
    { label: '←', action: 'backspace', variant: 'default' },
  ],
  [
    { label: '7',   action: 'input',     variant: 'default' },
    { label: '8',   action: 'input',     variant: 'default' },
    { label: '9',   action: 'input',     variant: 'default' },
    { label: '00',  action: 'input',     variant: 'default' },
  ],
  [
    { label: '.',   action: 'input',     variant: 'default' },
    { label: '0',   action: 'input',     variant: 'default' },
    { label: '000', action: 'input',     variant: 'default' },
    { label: '확인', action: 'confirm', variant: 'primary' },
  ],
];

const variantStyles: Record<KeyDef['variant'], string> = {
  default: 'bg-pos-surface text-pos-text active:bg-gray-300',
  warn:    'bg-warn-300 text-pos-text active:bg-warn-500',
  primary: 'bg-primary-500 text-pos-text-inverse active:bg-primary-700',
};

/**
 * NumPad -- POS 숫자 키패드
 *
 * 4x4 그리드. 금액 입력, 수량 입력 등 POS 핵심 입력 컴포넌트.
 */
export default function NumPad({
  onInput,
  onConfirm,
  onClear,
  onBackspace,
  disabled = false,
  variant = 'standard',
}: NumPadProps) {
  const keys = variant === 'compact' ? COMPACT_KEYS : KEYS;

  const handlePress = (key: KeyDef) => {
    if (disabled) return;
    switch (key.action) {
      case 'input':
        onInput(key.label);
        break;
      case 'clear':
        onClear();
        break;
      case 'backspace':
        onBackspace();
        break;
      case 'confirm':
        onConfirm?.();
        break;
    }
  };

  return (
    <div
      className={`
        grid grid-cols-4 gap-1.5
        ${disabled ? 'opacity-[var(--opacity-disabled)] pointer-events-none' : ''}
      `}
    >
      {keys.flat().map((key) => (
        <button
          key={key.label}
          type="button"
          disabled={disabled}
          onClick={() => handlePress(key)}
          className={`
            h-touch-xl
            flex items-center justify-center
            rounded-pos-btn font-semibold text-lg
            transition-transform duration-fast ease-default
            select-none cursor-pointer
            active:scale-[0.95]
            ${variantStyles[key.variant]}
          `}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
}
