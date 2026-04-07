'use client';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

/**
 * FormField -- 라벨 + 입력 + 에러 래퍼
 *
 * 수직 스택 구조. 폼 입력 필드의 일관된 레이아웃을 제공.
 */
export default function FormField({
  label,
  error,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* 라벨 */}
      <label className="text-sm font-medium text-pos-text select-none">
        {label}
        {required && (
          <span className="text-pos-error ml-0.5">*</span>
        )}
      </label>

      {/* 입력 슬롯 */}
      {children}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-xs text-pos-error select-none animate-pos-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
