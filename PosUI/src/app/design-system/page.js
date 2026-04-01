export default function DesignSystemHome() {
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="px-12 pt-12 pb-6 shrink-0">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-soft-red-500 flex items-center justify-center shadow-pos-card">
            <span className="text-white text-xl font-black">H</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hyojung Design System</h1>
            <p className="text-sm text-gray-400 mt-0.5">POS 전용 UI 컴포넌트 카탈로그 · 1024×768</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-12 pb-10 overflow-y-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: '화면', value: '3', desc: 'Table · Order · Payment' },
            { label: '컴포넌트', value: '7', desc: 'Atoms + Organisms' },
            { label: '해상도', value: '1024×768', desc: 'Fixed Touch POS' },
            { label: '테마', value: 'Light', desc: 'Soft Red Accent' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</div>
              <div className="text-xl font-bold text-gray-900 mt-2">{stat.value}</div>
              <div className="text-[11px] text-gray-400 mt-1">{stat.desc}</div>
            </div>
          ))}
        </div>

        {/* Color Palette */}
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Color Palette</h2>
        <div className="flex gap-4 mb-10">
          {[
            { name: 'Soft Red', color: '#E63946', sub: 'Primary Accent' },
            { name: 'Muted Gray', color: '#F3F4F6', sub: 'Border / BG', ring: true },
            { name: 'Warm Yellow', color: '#FBBF24', sub: 'Alert / Paying' },
            { name: 'White', color: '#FFFFFF', sub: 'Background', ring: true },
            { name: 'Dark', color: '#111827', sub: 'Text Primary' },
          ].map((c) => (
            <div key={c.name} className="flex-1">
              <div
                className={`h-14 rounded-xl mb-2 ${c.ring ? 'ring-1 ring-inset ring-gray-200' : ''}`}
                style={{ backgroundColor: c.color }}
              />
              <div className="text-xs font-semibold text-gray-900">{c.name}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Design Principles */}
        <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Principles</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Touch First', desc: '48px 최소 터치 영역, 큰 라운드 코너 (2xl+), 여유 있는 간격' },
            { title: 'Offline Ready', desc: '로컬 MSSQL 기반 동작, Mock Transport로 C++ 없이 독립 개발' },
            { title: 'Minimal & Clean', desc: '화이트 테마, 부드러운 그림자, Soft Red 액센트로 명확한 계층' },
          ].map((p) => (
            <div key={p.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="text-sm font-bold text-gray-900 mb-1.5">{p.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
