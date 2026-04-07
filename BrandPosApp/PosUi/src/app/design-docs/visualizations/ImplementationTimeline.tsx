'use client';

const PHASES = [
  {
    phase: '1',
    title: 'Measurement',
    desc: 'Signal collection & instrumentation',
    items: ['Observability logging', 'Transaction ledger', 'Device error codes', 'Sales data pipeline'],
    color: '#6366f1',
    status: 'active',
  },
  {
    phase: '2',
    title: 'Detection',
    desc: 'Anomaly detection & alerting',
    items: ['Revenue leakage detection', 'Transaction anomaly alerts', 'Device failure prediction', 'Edge POS health monitoring'],
    color: '#f59e0b',
    status: 'next',
  },
  {
    phase: '3',
    title: 'Recommendation',
    desc: 'AI-powered suggestions',
    items: ['Demand forecasting', 'Order/inventory recommendations', 'Pricing optimization', 'Operational Copilot'],
    color: '#10b981',
    status: 'planned',
  },
  {
    phase: '4',
    title: 'Automation',
    desc: 'Closed-loop execution',
    items: ['Auto-reorder triggers', 'Dynamic pricing rules', 'Self-healing recovery', 'Zero-UI marketing'],
    color: '#ec4899',
    status: 'future',
  },
];

export default function ImplementationTimeline() {
  return (
    <div className="my-8">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-300 via-amber-300 via-emerald-300 to-pink-200" />

        <div className="space-y-6">
          {PHASES.map((phase) => (
            <div key={phase.phase} className="relative pl-16">
              {/* Phase circle */}
              <div
                className="absolute left-3 top-4 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-md"
                style={{ background: phase.color }}
              >
                {phase.phase}
              </div>

              <div
                className="rounded-xl p-5 border transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: phase.color + '25',
                  background: `linear-gradient(135deg, ${phase.color}05, ${phase.color}0a)`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold" style={{ color: phase.color }}>{phase.title}</span>
                    <span className="text-[11px] text-gray-400 ml-2">{phase.desc}</span>
                  </div>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: phase.status === 'active' ? '#dcfce7' : phase.status === 'next' ? '#fef3c7' : '#f1f5f9',
                      color: phase.status === 'active' ? '#166534' : phase.status === 'next' ? '#92400e' : '#94a3b8',
                    }}
                  >
                    {phase.status === 'active' ? 'IN PROGRESS' : phase.status === 'next' ? 'NEXT' : 'PLANNED'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {phase.items.map((item) => (
                    <span
                      key={item}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white border"
                      style={{ borderColor: phase.color + '20', color: phase.color + 'cc' }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
