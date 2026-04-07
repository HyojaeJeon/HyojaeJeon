'use client';

const PLATFORMS = ['SuperAdmin', 'RegDistributor', 'BrandHQ', 'EdgePOS'];

const FEATURES = [
  { name: 'Table & Floor',         coverage: [0, 0, 1, 3] },
  { name: 'Sales & Payment',       coverage: [0, 0, 1, 3] },
  { name: 'Inventory & Menu',      coverage: [0, 0, 3, 2] },
  { name: 'Customer',              coverage: [0, 0, 2, 3] },
  { name: 'System & Admin',        coverage: [3, 1, 2, 2] },
  { name: 'External Bridge',       coverage: [1, 0, 1, 3] },
  { name: 'Kiosk',                 coverage: [0, 0, 1, 3] },
  { name: 'Multi-tenancy',         coverage: [3, 2, 1, 0] },
  { name: 'License & Deploy',      coverage: [3, 2, 0, 0] },
  { name: 'Monitoring',            coverage: [3, 1, 2, 1] },
  { name: 'Report & Settlement',   coverage: [2, 1, 3, 1] },
];

const LEVEL_COLORS = [
  { bg: '#f8fafc', text: '#cbd5e1', label: '—' },
  { bg: '#fef3c7', text: '#92400e', label: 'Low' },
  { bg: '#fed7aa', text: '#9a3412', label: 'Med' },
  { bg: '#bbf7d0', text: '#166534', label: 'High' },
];

export default function FeatureCoverageMatrix() {
  return (
    <div className="my-8">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-800">
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-300 w-48">Feature Domain</th>
              {PLATFORMS.map((p) => (
                <th key={p} className="px-3 py-3 text-center text-[11px] font-semibold text-slate-300">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feat, ri) => (
              <tr key={feat.name} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-2.5 text-[12px] font-medium text-gray-700 border-r border-gray-100">{feat.name}</td>
                {feat.coverage.map((level, ci) => {
                  const c = LEVEL_COLORS[level];
                  return (
                    <td key={ci} className="px-3 py-2.5 text-center border-r border-gray-100 last:border-r-0">
                      <span
                        className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold min-w-[42px]"
                        style={{ background: c.bg, color: c.text }}
                      >
                        {c.label}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 mt-3 text-[10px] text-gray-400">
        {LEVEL_COLORS.slice(1).map((c) => (
          <span key={c.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: c.bg, border: `1px solid ${c.text}30` }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
