'use client';

const LAYERS = [
  {
    id: 'ui',
    label: 'PosUI (Next.js)',
    items: ['screens/', 'store/api/', 'bridge/'],
    color: '#3b82f6',
    bgFrom: '#eff6ff',
    bgTo: '#dbeafe',
  },
  {
    id: 'bridge',
    label: 'InternalBridge',
    items: ['PosRequestResponder', 'PosRequestActions', 'PosRealTimeSender'],
    color: '#8b5cf6',
    bgFrom: '#f5f3ff',
    bgTo: '#ede9fe',
    note: 'thin router only',
  },
  {
    id: 'usecases',
    label: 'UseCases',
    items: ['Transaction', 'Idempotency', 'Lock', 'Ledger', 'Outbox', 'UI Event Decision'],
    color: '#f59e0b',
    bgFrom: '#fffbeb',
    bgTo: '#fef3c7',
    note: 'orchestration center',
  },
  {
    id: 'domain',
    label: 'Domain / Manager',
    items: ['TableMgr', 'OrderMgr', 'SaleMgr', 'CustMgr', 'ItemMgr'],
    color: '#10b981',
    bgFrom: '#ecfdf5',
    bgTo: '#d1fae5',
    note: 'pure business logic',
  },
  {
    id: 'infra',
    label: 'Infrastructure',
    items: ['Persistence/SQLite', 'Device/', 'ExternalBridge/', 'Sync/', 'Observability/'],
    color: '#64748b',
    bgFrom: '#f8fafc',
    bgTo: '#f1f5f9',
  },
];

export default function EdgePosLayerDiagram() {
  return (
    <div className="my-8 space-y-2">
      {LAYERS.map((layer, i) => (
        <div key={layer.id} className="relative">
          {/* Connector arrow */}
          {i > 0 && (
            <div className="absolute -top-2 left-12 z-10">
              <svg width="24" height="16" viewBox="0 0 24 16">
                <path d="M12 0v12M7 8l5 5 5-5" stroke={LAYERS[i - 1].color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              </svg>
            </div>
          )}

          <div
            className="rounded-xl px-5 py-4 transition-all duration-200 hover:shadow-md"
            style={{
              background: `linear-gradient(135deg, ${layer.bgFrom}, ${layer.bgTo})`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: layer.color }}>{layer.label}</span>
                  {layer.note && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: layer.color + '18', color: layer.color }}>
                      {layer.note}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {layer.items.map((item) => (
                    <span key={item} className="text-[11px] px-2 py-0.5 rounded-md bg-white/70 text-gray-600 font-mono border border-gray-200/50">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layer index */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: layer.color + '15', color: layer.color }}>
                L{i + 1}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Golden Rule */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200/60">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l2.47 5.01L16 6.64l-4 3.9.94 5.5L8 13.27 3.06 16l.94-5.5-4-3.9 5.53-.63z" fill="#f59e0b" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-amber-800">Golden Rule</div>
            <div className="text-[11px] text-amber-700 mt-1 leading-relaxed font-mono">
              UI/Bridge → UseCases → Domain → Infrastructure
            </div>
            <div className="text-[10px] text-amber-600 mt-1">
              Unidirectional only. DB must persist before UI displays.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
