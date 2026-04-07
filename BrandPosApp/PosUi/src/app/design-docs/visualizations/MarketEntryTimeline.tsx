'use client';

const phases = [
  {
    id: 1,
    label: 'Beachhead',
    period: '0–6 mo',
    color: 'bg-rose-500',
    dotColor: 'bg-rose-500',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-700',
    target: '50 stores',
    audience: 'Korean owners in Vietnam',
    metrics: ['Prove product-market fit', 'Unit economics validation', 'NPS > 40'],
  },
  {
    id: 2,
    label: 'Local Expansion',
    period: '6–18 mo',
    color: 'bg-orange-500',
    dotColor: 'bg-orange-500',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
    target: '500 stores',
    audience: 'Vietnamese SMB restaurants',
    metrics: ['Localized UX & payments', 'Self-serve onboarding', 'CAC payback < 6 mo'],
  },
  {
    id: 3,
    label: 'Franchise',
    period: '12–24 mo',
    color: 'bg-sky-500',
    dotColor: 'bg-sky-500',
    borderColor: 'border-sky-300',
    textColor: 'text-sky-700',
    target: '20 brands',
    audience: 'Multi-location brands',
    metrics: ['Brand admin portal', 'Central menu & pricing', 'Cross-store analytics'],
  },
  {
    id: 4,
    label: 'Ecosystem',
    period: '24+ mo',
    color: 'bg-violet-500',
    dotColor: 'bg-violet-500',
    borderColor: 'border-violet-300',
    textColor: 'text-violet-700',
    target: 'Multi-country',
    audience: 'SEA expansion',
    metrics: ['Marketplace & procurement', 'Data licensing', 'White-label platform'],
  },
];

export default function MarketEntryTimeline() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-8 text-center">
        Market Entry Strategy — Phased Rollout
      </h3>

      {/* Timeline bar + dots */}
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 rounded" />

        {/* Nodes */}
        <div className="relative grid grid-cols-4 gap-4">
          {phases.map((phase) => (
            <div key={phase.id} className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={`relative z-10 w-8 h-8 ${phase.dotColor} rounded-full border-4 border-white shadow flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">{phase.id}</span>
              </div>

              {/* Period label */}
              <div className="mt-2 text-xs font-medium text-gray-500">{phase.period}</div>

              {/* Card */}
              <div
                className={`mt-3 w-full border ${phase.borderColor} rounded-lg bg-white shadow-sm p-4`}
              >
                <div className={`text-sm font-bold ${phase.textColor} mb-1`}>
                  {phase.label}
                </div>
                <div className="text-xs text-gray-600 mb-2">{phase.audience}</div>

                {/* Target badge */}
                <div
                  className={`inline-block ${phase.color} text-white text-xs font-semibold rounded-full px-2.5 py-0.5 mb-3`}
                >
                  {phase.target}
                </div>

                {/* Metrics */}
                <ul className="space-y-1">
                  {phase.metrics.map((metric) => (
                    <li key={metric} className="flex items-start gap-1.5 text-xs text-gray-500">
                      <span className="mt-0.5 shrink-0 w-1 h-1 rounded-full bg-gray-400" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="flex items-center justify-center mt-6 text-xs text-gray-400 gap-2">
        <span>Early stage</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <span>Scale &amp; ecosystem</span>
      </div>
    </div>
  );
}
