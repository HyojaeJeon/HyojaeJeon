'use client';

import type { Concept } from './index';

interface ConceptSectionProps {
  concept: Concept;
  children: React.ReactNode;
}

/**
 * ConceptSection — 컨셉별 프리뷰 섹션 래퍼
 *
 * data-concept 속성으로 CSS 변수를 오버라이드한다.
 * 동일한 컴포넌트가 이 래퍼 안에서 다른 디자인 컨셉으로 렌더링된다.
 *
 * overflow-visible: 드롭다운 등 오버레이 컴포넌트가 잘리지 않도록.
 * bg-pos-bg: 다크 모드 컨셉에서 배경색이 자동 적용되도록 토큰 참조.
 */
export default function ConceptSection({ concept, children }: ConceptSectionProps) {
  return (
    <section className="rounded-2xl border border-pos-border">
      {/* Concept Header */}
      <div
        className="px-6 py-4 flex items-center gap-3 border-b border-pos-border rounded-t-2xl"
        style={{ background: concept.accentBg }}
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: concept.accentColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-bold" style={{ color: concept.id === 'glass' ? '#E8EAF0' : '#111827' }}>
              {concept.name}
            </h3>
            <span className="text-xs" style={{ color: concept.id === 'glass' ? '#9BA1B0' : '#9CA3AF' }}>
              {concept.nameKo}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: concept.id === 'glass' ? '#5C6270' : '#6B7280' }}>
            {concept.description}
          </p>
        </div>
      </div>

      {/* Component Preview — data-concept으로 토큰 오버라이드 */}
      <div
        data-concept={concept.id}
        className="p-6 bg-pos-bg text-pos-text rounded-b-2xl"
      >
        {children}
      </div>
    </section>
  );
}
