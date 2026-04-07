'use client';

interface MaintenanceScreenProps {
  onClose?: () => void;
}

export default function MaintenanceScreen({ onClose }: MaintenanceScreenProps) {
  return (
    <div className="flex h-full w-full flex-col bg-pos-surface text-pos-text">
      <div className="flex items-center justify-between border-b border-pos-border px-5 py-3">
        <div>
          <h1 className="text-2xl font-bold">유지보수 모드</h1>
          <p className="mt-1 text-sm text-pos-text-muted">
            장치 점검, 로컬 복구, 설정 확인 작업을 처리한다.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-pos-sm border border-pos-border bg-pos-bg text-pos-text-muted transition active:scale-[0.97]"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center" />
    </div>
  );
}
