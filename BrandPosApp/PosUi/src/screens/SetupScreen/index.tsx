'use client';

interface SetupScreenProps {
  onClose?: () => void;
}

export default function SetupScreen({ onClose }: SetupScreenProps) {
  return (
    <div className="flex h-full w-full flex-col bg-pos-surface text-pos-text">
      <div className="flex items-center justify-between border-b border-pos-border px-5 py-3">
        <div>
          <h1 className="text-2xl font-bold">설정 모드</h1>
          <p className="mt-1 text-sm text-pos-text-muted">
            장치 등록, 네트워크 설정, 초기 커미셔닝을 처리한다.
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
