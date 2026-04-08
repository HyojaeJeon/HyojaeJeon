'use client';

/**
 * BrandPanel — LoginScreen 좌측 브랜드 패널.
 *
 * 화면 전용. 다른 화면에서도 동일 패턴이 필요해지면 그 시점에
 * shared/ui/organisms 로 승격한다.
 */
interface BrandPanelProps {
  title: string;
  subtitle: string;
  version: string;
}

export default function BrandPanel({ title, subtitle, version }: BrandPanelProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-pos-surface border-r border-pos-border relative">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-pos-2xl bg-primary-500 flex items-center justify-center shadow-pos-card">
          <span className="text-4xl font-black text-white">H</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-pos-text">{title}</h1>
          <p className="text-xs text-pos-text-muted mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="absolute bottom-6 text-center">
        <p className="text-2xs text-pos-text-muted">{version}</p>
      </div>
    </div>
  );
}
