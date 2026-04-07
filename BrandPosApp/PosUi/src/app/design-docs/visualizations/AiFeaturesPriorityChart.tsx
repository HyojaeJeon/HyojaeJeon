'use client';

const FEATURES = [
  { name: 'Anomaly / Revenue Leakage Detection', priority: 'P0', user: 'HQ / Branch', value: 'Risk Prevention', data: 'Transaction + Inventory' },
  { name: 'Demand Forecasting', priority: 'P0', user: 'HQ / Branch', value: 'Revenue Growth', data: 'Sales History + Weather + Events' },
  { name: 'Order / Inventory Recommendation', priority: 'P0', user: 'Branch / Staff', value: 'Cost Reduction', data: 'Sales + Stock + Supplier' },
  { name: 'Edge POS Fault Diagnosis', priority: 'P0', user: 'HQ / Support', value: 'Uptime', data: 'Device Logs + Error Codes' },
  { name: 'Unified Order Inbox', priority: 'P0', user: 'Branch / Staff', value: 'Efficiency', data: 'Multi-channel Orders' },
  { name: 'Request Auto-structuring', priority: 'P0', user: 'Staff', value: 'Speed', data: 'Order Messages' },
  { name: 'Calc Engine / Payment Simplify', priority: 'P0', user: 'Staff / Customer', value: 'Speed', data: 'Payment Rules' },
  { name: 'Operational Copilot', priority: 'P0', user: 'Branch / HQ', value: 'Decision Support', data: 'All Operational Data' },
  { name: 'Vision-AI POS (CCTV sync)', priority: 'P1', user: 'HQ', value: 'Intelligence', data: 'Video + POS Transactions' },
  { name: 'Cross-Lingual OS', priority: 'P1', user: 'All', value: 'Localization', data: 'UI + Menu + Messages' },
  { name: 'B2B Ingredient Commerce', priority: 'P2', user: 'Branch / Supplier', value: 'Cost Reduction', data: 'Purchase + Market Prices' },
  { name: 'Micro-financing', priority: 'P2', user: 'Branch', value: 'Capital', data: 'Sales + Credit' },
  { name: 'Zero-UI Social Marketing', priority: 'P2', user: 'Branch', value: 'Revenue Growth', data: 'Customer + Social' },
];

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  P0: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  P1: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  P2: { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' },
};

export default function AiFeaturesPriorityChart() {
  return (
    <div className="my-8 overflow-x-auto">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-300 tracking-wide">#</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-300 tracking-wide">AI Feature</th>
              <th className="px-3 py-3 text-center text-[10px] font-semibold text-slate-300 tracking-wide">Priority</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-300 tracking-wide">User</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-300 tracking-wide">Core Value</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-300 tracking-wide">Required Data</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feat, i) => {
              const ps = PRIORITY_STYLES[feat.priority];
              return (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-blue-50/40 transition-colors`}>
                  <td className="px-4 py-2.5 text-[11px] text-gray-300 font-mono">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-2.5 text-[12px] font-medium text-gray-700">{feat.name}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: ps.bg, color: ps.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ps.dot }} />
                      {feat.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-gray-500">{feat.user}</td>
                  <td className="px-4 py-2.5 text-[11px] text-gray-500">{feat.value}</td>
                  <td className="px-4 py-2.5 text-[10px] text-gray-400 font-mono">{feat.data}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 mt-3">
        {Object.entries(PRIORITY_STYLES).map(([p, s]) => {
          const count = FEATURES.filter((f) => f.priority === p).length;
          return (
            <span key={p} className="flex items-center gap-1.5 text-[10px]" style={{ color: s.text }}>
              <span className="w-2.5 h-2.5 rounded" style={{ background: s.dot }} />
              {p}: {count} features
            </span>
          );
        })}
      </div>
    </div>
  );
}
