'use client';

export default function RevenueModelDiagram() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        3-Tier Revenue Model
      </h3>

      <div className="flex flex-col items-center gap-3">
        {/* Tier 1 — Subscription */}
        <div className="flex items-stretch w-full max-w-md gap-4">
          <div className="flex-1 bg-indigo-600 text-white rounded-lg px-5 py-4 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
              Tier 1 — Subscription Revenue
            </div>
            <div className="text-sm leading-relaxed">
              <span className="inline-block bg-indigo-500 rounded px-2 py-0.5 mr-1.5 mb-1">
                Store SaaS Fee
              </span>
              <span className="inline-block bg-indigo-500 rounded px-2 py-0.5 mr-1.5 mb-1">
                Brand License
              </span>
              <span className="inline-block bg-indigo-500 rounded px-2 py-0.5 mr-1.5 mb-1">
                Premium Add-ons
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end min-w-[120px] text-right">
            <div>
              <div className="text-sm font-semibold text-indigo-700">$15–30</div>
              <div className="text-xs text-gray-500">/store/month</div>
            </div>
          </div>
        </div>

        {/* Tier 2 — Ecosystem */}
        <div className="flex items-stretch w-full max-w-lg gap-4">
          <div className="flex-1 bg-emerald-600 text-white rounded-lg px-5 py-4 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
              Tier 2 — Ecosystem Revenue
            </div>
            <div className="text-sm leading-relaxed">
              <span className="inline-block bg-emerald-500 rounded px-2 py-0.5 mr-1.5 mb-1">
                Procurement Commission
              </span>
              <span className="inline-block bg-emerald-500 rounded px-2 py-0.5 mr-1.5 mb-1">
                Financing / Lending
              </span>
              <span className="inline-block bg-emerald-500 rounded px-2 py-0.5 mr-1.5 mb-1">
                Data Licensing
              </span>
              <span className="inline-block bg-emerald-500 rounded px-2 py-0.5 mr-1.5 mb-1">
                Payment Processing
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end min-w-[120px] text-right">
            <div>
              <div className="text-sm font-semibold text-emerald-700">2–5%</div>
              <div className="text-xs text-gray-500">per transaction</div>
            </div>
          </div>
        </div>

        {/* Tier 3 — Channel */}
        <div className="flex items-stretch w-full max-w-2xl gap-4">
          <div className="flex-1 bg-amber-500 text-white rounded-lg px-5 py-4 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
              Tier 3 — Channel Revenue
            </div>
            <div className="text-sm leading-relaxed">
              <span className="inline-block bg-amber-400 rounded px-2 py-0.5 mr-1.5 mb-1">
                Partner Margins
              </span>
              <span className="inline-block bg-amber-400 rounded px-2 py-0.5 mr-1.5 mb-1">
                White-label Licensing
              </span>
              <span className="inline-block bg-amber-400 rounded px-2 py-0.5 mr-1.5 mb-1">
                Consulting &amp; Integration
              </span>
              <span className="inline-block bg-amber-400 rounded px-2 py-0.5 mr-1.5 mb-1">
                Training &amp; Certification
              </span>
              <span className="inline-block bg-amber-400 rounded px-2 py-0.5 mr-1.5 mb-1">
                Custom Development
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end min-w-[120px] text-right">
            <div>
              <div className="text-sm font-semibold text-amber-700">10–30%</div>
              <div className="text-xs text-gray-500">partner margin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend / Funnel indicator */}
      <div className="flex items-center justify-center mt-6 gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-600" />
          <span>Direct &amp; Recurring</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-600" />
          <span>Transactional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Scale &amp; Leverage</span>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">
        Narrower = higher margin per unit &middot; Wider = larger total addressable volume
      </p>
    </div>
  );
}
