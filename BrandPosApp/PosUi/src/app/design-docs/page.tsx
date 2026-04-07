'use client';

import BrandColorPicker from '@design-system/concepts/BrandColorPicker';

export default function DesignSystemHome() {
  return (
    <div className="w-full">
      {/* 브랜드 컬러 시스템 — 최상단 */}
      <BrandColorPicker />

      {/* 헤더 */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-pos-card">
            <span className="text-white text-2xl font-black">H</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform 디자인 시스템</h1>
            <p className="text-sm text-gray-400 mt-0.5">POS 전용 UI 컴포넌트 카탈로그 · 터치스크린 최적화</p>
          </div>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-5 gap-3 mb-12">
        {[
          { label: '화면', value: '6', desc: '테이블·주문·결제·주방·로그인·설정' },
          { label: '컴포넌트', value: '75', desc: '기본/조합/복합/POS전용/템플릿' },
          { label: '디자인 컨셉', value: '3', desc: '소프트 모던·볼드 미니멀·글라스' },
          { label: '해상도', value: '1024×768', desc: '고정 터치 POS' },
          { label: '지원 언어', value: '3', desc: '한국어·영어·베트남어' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-pos-lg p-4 border border-gray-100">
            <div className="text-2xs font-semibold text-gray-400 tracking-wider">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900 mt-1.5">{stat.value}</div>
            <div className="text-2xs text-gray-400 mt-1">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* ═══ 타이포그래피 ═══ */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-gray-900 mb-5 tracking-wider border-b border-gray-100 pb-2">타이포그래피</h2>

        {/* 폰트 패밀리 */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">폰트 패밀리</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-pos-md p-5 border border-gray-100">
              <p className="text-lg font-bold text-gray-900 font-sans mb-1">Pretendard</p>
              <p className="text-xs text-gray-400">본문 · UI 전용 — <code className="text-2xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">font-sans</code></p>
              <p className="text-md text-gray-600 mt-3 font-sans">가나다라마바사 ABCDEFG abcdefg 0123456789</p>
            </div>
            <div className="bg-gray-50 rounded-pos-md p-5 border border-gray-100">
              <p className="text-lg font-bold text-gray-900 font-mono mb-1">JetBrains Mono</p>
              <p className="text-xs text-gray-400">숫자 · 코드 전용 — <code className="text-2xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">font-mono</code></p>
              <p className="text-md text-gray-600 mt-3 font-mono">150,000₫ · 1234567890 · #E63946</p>
            </div>
          </div>
        </div>

        {/* 폰트 크기 스케일 */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">폰트 크기</h3>
          <div className="bg-gray-50 rounded-pos-md border border-gray-100 divide-y divide-gray-100">
            {[
              { name: 'text-2xs', size: '10px', sample: '주문 시간 · 라벨 부가 정보' },
              { name: 'text-xs',  size: '12px', sample: '주문 항목 가격 · 배지 텍스트' },
              { name: 'text-sm',  size: '13px', sample: '카테고리 탭 · 사이드바 메뉴' },
              { name: 'text-md',  size: '14px', sample: '버튼 텍스트 · 본문 기본 크기' },
              { name: 'text-lg',  size: '16px', sample: '섹션 제목 · 테이블 번호' },
              { name: 'text-xl',  size: '20px', sample: '합계 금액 · 중요 수치' },
              { name: 'text-2xl', size: '24px', sample: '화면 제목 · 큰 테이블 번호' },
              { name: 'text-3xl', size: '32px', sample: '결제 금액 대형 표시' },
              { name: 'text-4xl', size: '40px', sample: '결제 완료 금액' },
            ].map((t) => (
              <div key={t.name} className="flex items-baseline px-5 py-3 gap-4">
                <code className="text-2xs font-mono text-primary-500 w-20 shrink-0">{t.name}</code>
                <span className="text-2xs text-gray-400 w-12 shrink-0 tabular-nums">{t.size}</span>
                <span className="text-gray-800 truncate" style={{ fontSize: t.size }}>{t.sample}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 폰트 굵기 */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">폰트 굵기</h3>
          <div className="bg-gray-50 rounded-pos-md border border-gray-100 divide-y divide-gray-100">
            {[
              { name: 'font-regular',  weight: '400', label: '일반' },
              { name: 'font-medium',   weight: '500', label: '중간' },
              { name: 'font-semibold', weight: '600', label: '약간 굵게' },
              { name: 'font-bold',     weight: '700', label: '굵게' },
              { name: 'font-extrabold',weight: '800', label: '매우 굵게' },
              { name: 'font-black',    weight: '900', label: '최대 굵게' },
            ].map((w) => (
              <div key={w.name} className="flex items-center px-5 py-3 gap-4">
                <code className="text-2xs font-mono text-primary-500 w-32 shrink-0">{w.name}</code>
                <span className="text-2xs text-gray-400 w-10 shrink-0">{w.weight}</span>
                <span className="text-lg text-gray-800" style={{ fontWeight: Number(w.weight) }}>
                  {w.label} — 결제 금액 150,000₫
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 자간 */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">자간 (Letter Spacing)</h3>
          <div className="bg-gray-50 rounded-pos-md border border-gray-100 divide-y divide-gray-100">
            {[
              { name: 'tracking-tighter', value: '-0.05em' },
              { name: 'tracking-tight',   value: '-0.025em' },
              { name: 'tracking-normal',  value: '0em' },
              { name: 'tracking-wide',    value: '0.025em' },
              { name: 'tracking-wider',   value: '0.05em' },
              { name: 'tracking-widest',  value: '0.1em' },
            ].map((t) => (
              <div key={t.name} className="flex items-center px-5 py-3 gap-4">
                <code className="text-2xs font-mono text-primary-500 w-36 shrink-0">{t.name}</code>
                <span className="text-2xs text-gray-400 w-16 shrink-0">{t.value}</span>
                <span className="text-md text-gray-800" style={{ letterSpacing: t.value }}>
                  테이블 주문 결제 메뉴 카테고리
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 행간 */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">행간 (Line Height)</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'leading-tight',   value: '1.25', desc: '제목, 라벨' },
              { name: 'leading-normal',  value: '1.5',  desc: '본문 기본' },
              { name: 'leading-relaxed', value: '1.625', desc: '설명문, 도움말' },
            ].map((l) => (
              <div key={l.name} className="bg-gray-50 rounded-pos-md p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-2xs font-mono text-primary-500">{l.name}</code>
                  <span className="text-2xs text-gray-400">{l.value}</span>
                </div>
                <p className="text-sm text-gray-700 border-l-2 border-gray-200 pl-3" style={{ lineHeight: l.value }}>
                  POS 터치스크린에서 읽기 편한 행간입니다.
                  여러 줄의 텍스트가 표시될 때 줄 사이 간격을 조절합니다.
                  {l.desc}에 주로 사용합니다.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 텍스트 색상 */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">텍스트 색상</h3>
          <div className="bg-gray-50 rounded-pos-md border border-gray-100 divide-y divide-gray-100">
            {[
              { name: 'text-pos-text',          color: '#111827', label: '기본 텍스트', sample: '테이블 1번 · 김치찌개' },
              { name: 'text-pos-text-secondary', color: '#6B7280', label: '보조 텍스트', sample: '3명 · 45분 경과' },
              { name: 'text-pos-text-muted',     color: '#9CA3AF', label: '흐린 텍스트', sample: '준비 중인 컴포넌트입니다' },
              { name: 'text-primary-500',        color: '#E63946', label: '강조 (기본 액센트)', sample: '150,000₫ · 결제하기' },
              { name: 'text-pos-success',        color: '#22C55E', label: '성공', sample: '결제 완료' },
              { name: 'text-pos-error',          color: '#EF4444', label: '오류', sample: '결제 실패 · 네트워크 끊김' },
              { name: 'text-pos-warning',        color: '#FBBF24', label: '경고', sample: '재고 부족 · 프린터 확인' },
              { name: 'text-pos-info',           color: '#3B82F6', label: '정보', sample: '동기화 중 · 업데이트 가능' },
            ].map((c) => (
              <div key={c.name} className="flex items-center px-5 py-3 gap-4">
                <div className="w-4 h-4 rounded-full shrink-0 border border-gray-200" style={{ backgroundColor: c.color }} />
                <code className="text-2xs font-mono text-gray-500 w-48 shrink-0">{c.name}</code>
                <span className="text-2xs text-gray-400 w-24 shrink-0">{c.label}</span>
                <span className="text-md truncate" style={{ color: c.color }}>{c.sample}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 텍스트 투명도 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-3">텍스트 투명도</h3>
          <div className="bg-gray-50 rounded-pos-md border border-gray-100 divide-y divide-gray-100">
            {[
              { name: 'opacity 100%', value: 1,   desc: '기본 상태' },
              { name: 'opacity 80%',  value: 0.8, desc: '약간 연하게' },
              { name: 'opacity 60%',  value: 0.6, desc: '보조 정보' },
              { name: 'opacity 40%',  value: 0.4, desc: '비활성화 상태' },
              { name: 'opacity 30%',  value: 0.3, desc: '힌트/플레이스홀더' },
            ].map((o) => (
              <div key={o.value} className="flex items-center px-5 py-3 gap-4">
                <span className="text-2xs text-gray-400 w-24 shrink-0">{o.name}</span>
                <span className="text-2xs text-gray-400 w-20 shrink-0">{o.desc}</span>
                <span className="text-lg font-bold text-gray-900" style={{ opacity: o.value }}>
                  결제 금액 150,000₫
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 색상 팔레트 ═══ */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-gray-900 mb-5 tracking-wider border-b border-gray-100 pb-2">색상 팔레트</h2>

        {/* 브랜드 Primary */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">브랜드 (Primary)</h3>
          <div className="flex gap-2">
            {[
              { shade: '50',  hex: '#FFF1F2' }, { shade: '100', hex: '#FFE4E6' },
              { shade: '200', hex: '#FECDD3' }, { shade: '300', hex: '#F48C95' },
              { shade: '400', hex: '#FB7185' }, { shade: '500', hex: '#E63946' },
              { shade: '600', hex: '#DC2626' }, { shade: '700', hex: '#B92B38' },
            ].map((c) => (
              <div key={c.shade} className="flex-1">
                <div className="h-12 rounded-pos-sm mb-1.5" style={{ backgroundColor: c.hex }} />
                <div className="text-2xs font-semibold text-gray-700">{c.shade}</div>
                <div className="text-2xs text-gray-400 font-mono">{c.hex}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 경고 Yellow */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 mb-3">경고 (Warn)</h3>
          <div className="flex gap-2">
            {[
              { shade: '50',  hex: '#FFFBEB' }, { shade: '100', hex: '#FEF3C7' },
              { shade: '300', hex: '#FDE68A' }, { shade: '500', hex: '#FBBF24' },
              { shade: '700', hex: '#D97706' },
            ].map((c) => (
              <div key={c.shade} className="flex-1">
                <div className="h-12 rounded-pos-sm mb-1.5 border border-gray-100" style={{ backgroundColor: c.hex }} />
                <div className="text-2xs font-semibold text-gray-700">{c.shade}</div>
                <div className="text-2xs text-gray-400 font-mono">{c.hex}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 시맨틱 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 mb-3">시맨틱 (Semantic)</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: '성공', hex: '#22C55E', token: 'pos-success' },
              { name: '정보', hex: '#3B82F6', token: 'pos-info' },
              { name: '경고', hex: '#FBBF24', token: 'pos-warning' },
              { name: '오류', hex: '#EF4444', token: 'pos-error' },
              { name: '배경', hex: '#FFFFFF', token: 'pos-bg', ring: true },
              { name: '표면', hex: '#F9FAFB', token: 'pos-surface', ring: true },
              { name: '테두리', hex: '#E5E7EB', token: 'pos-border', ring: true },
              { name: '강한 테두리', hex: '#D1D5DB', token: 'pos-border-strong', ring: true },
            ].map((c) => (
              <div key={c.token} className="flex items-center gap-3 bg-gray-50 rounded-pos-sm px-3 py-2.5 border border-gray-100">
                <div className={`w-8 h-8 rounded-pos-xs shrink-0 ${c.ring ? 'border border-gray-200' : ''}`} style={{ backgroundColor: c.hex }} />
                <div>
                  <div className="text-xs font-semibold text-gray-700">{c.name}</div>
                  <div className="text-2xs text-gray-400 font-mono">{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 간격 & 터치 크기 ═══ */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-gray-900 mb-5 tracking-wider border-b border-gray-100 pb-2">간격 & 터치 크기</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* 터치 크기 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-3">터치 타깃 최소 크기</h3>
            <div className="space-y-2">
              {[
                { name: 'touch-min',  px: 44, desc: '최소 터치 영역 (WCAG)' },
                { name: 'touch',      px: 48, desc: '일반 버튼' },
                { name: 'touch-lg',   px: 56, desc: '결제/확인 버튼' },
                { name: 'touch-xl',   px: 64, desc: '키패드 키' },
                { name: 'touch-nav',  px: 40, desc: '네비게이션 항목' },
              ].map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <div className="bg-primary-100 rounded-pos-xs flex items-center justify-center text-2xs font-bold text-primary-600 shrink-0" style={{ width: t.px, height: t.px }}>
                    {t.px}px
                  </div>
                  <div>
                    <code className="text-2xs font-mono text-gray-500">{t.name}</code>
                    <div className="text-2xs text-gray-400">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 레이아웃 치수 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-3">레이아웃 고정 치수</h3>
            <div className="bg-gray-50 rounded-pos-md border border-gray-100 divide-y divide-gray-100">
              {[
                { name: '화면',         value: '1024 × 768px' },
                { name: '헤더',         value: '48px' },
                { name: '푸터',         value: '56px' },
                { name: '사이드바',      value: '300px' },
                { name: '카테고리 바',    value: '48px' },
                { name: '네비게이션 칼럼', value: '56px' },
              ].map((l) => (
                <div key={l.name} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-gray-700">{l.name}</span>
                  <span className="text-xs font-mono text-gray-400">{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 둥글기 & 그림자 ═══ */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-gray-900 mb-5 tracking-wider border-b border-gray-100 pb-2">둥글기 & 그림자</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* 둥글기 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-3">둥글기 (Border Radius)</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'pos-xs',  value: '6px' },
                { name: 'pos-sm',  value: '8px' },
                { name: 'pos-md',  value: '12px' },
                { name: 'pos-lg',  value: '16px' },
                { name: 'pos-xl',  value: '20px' },
                { name: 'pos-2xl', value: '24px' },
                { name: 'pos-full',value: '9999px' },
              ].map((r) => (
                <div key={r.name} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-16 h-16 bg-primary-100 border-2 border-primary-300 flex items-center justify-center"
                    style={{ borderRadius: r.value }}
                  >
                    <span className="text-2xs font-mono text-primary-600">{r.value}</span>
                  </div>
                  <code className="text-2xs text-gray-400">{r.name}</code>
                </div>
              ))}
            </div>
          </div>

          {/* 그림자 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-3">그림자 (Box Shadow)</h3>
            <div className="space-y-3">
              {[
                { name: 'pos-soft',    desc: '미세한 입체감' },
                { name: 'pos-card',    desc: '카드 기본' },
                { name: 'pos-hover',   desc: '터치 피드백' },
                { name: 'pos-modal',   desc: '모달/오버레이' },
                { name: 'pos-sidebar', desc: '사이드바' },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <div className={`w-20 h-12 bg-white rounded-pos-md shadow-${s.name}`} />
                  <div>
                    <code className="text-2xs font-mono text-gray-500">{s.name}</code>
                    <div className="text-2xs text-gray-400">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 설계 원칙 ═══ */}
      <section className="mb-12">
        <h2 className="text-sm font-bold text-gray-900 mb-5 tracking-wider border-b border-gray-100 pb-2">설계 원칙</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '👆', title: '터치 우선', desc: '48px 최소 터치 영역. hover 효과 금지. active 터치 피드백만 사용. 넉넉한 간격으로 오터치 방지.' },
            { icon: '📡', title: '오프라인 우선', desc: '로컬 SQLite가 데이터 원본. 네트워크 없이 완전 동작. Mock Transport로 C++ 없이 독립 개발 가능.' },
            { icon: '🎨', title: '토큰 중심', desc: '모든 시각적 속성은 디자인 토큰 참조. 한 곳 변경으로 전체 일괄 반영. 하드코딩 금지.' },
          ].map((p) => (
            <div key={p.title} className="bg-gray-50 rounded-pos-lg p-5 border border-gray-100">
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="text-sm font-bold text-gray-900 mb-1.5">{p.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
