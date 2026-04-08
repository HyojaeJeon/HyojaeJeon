'use client';

export default function DataFlowDiagram() {
  return (
    <div className="my-8">
      <div className="grid grid-cols-2 gap-6">
        {/* PosRequest — bidirectional */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-5">
          <div className="text-xs font-bold text-blue-600 tracking-wide mb-4">PosRequest (UI ↔ C++)</div>

          <div className="space-y-1">
            {[
              { label: 'PosRequestSender.js', side: 'UI', color: '#3b82f6' },
              { label: 'cefTransport / mockTransport', side: '', color: '#94a3b8', small: true },
              { label: 'PosRequestResponder', side: 'C++', color: '#8b5cf6' },
              { label: 'PosRequestActions', side: '', color: '#8b5cf6', note: 'thin router' },
              { label: 'UseCases', side: '', color: '#f59e0b' },
            ].map((node, i) => (
              <div key={i}>
                {i > 0 && (
                  <div className="flex justify-center py-0.5">
                    <svg width="12" height="10" viewBox="0 0 12 10">
                      <path d="M6 0v7M3 5l3 3 3-3" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 rounded-lg px-3 py-1.5 border ${node.small ? 'border-dashed' : ''}`}
                    style={{ borderColor: node.color + '40', background: node.color + '08' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono ${node.small ? 'text-[9px] text-gray-400' : 'text-[11px]'}`} style={{ color: node.small ? undefined : node.color }}>
                        {node.label}
                      </span>
                      {node.side && <span className="text-[8px] font-bold text-gray-400 uppercase">{node.side}</span>}
                      {node.note && <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-500 font-semibold">{node.note}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PosRealTime — unidirectional C++ → UI */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-slate-50 p-5">
          <div className="text-xs font-bold text-emerald-600 tracking-wide mb-4">PosRealTime (C++ → UI)</div>

          <div className="space-y-1">
            {[
              { label: 'UseCases (event decision)', color: '#f59e0b', side: 'C++' },
              { label: 'PosRealTimeSender', color: '#10b981' },
              { label: 'CEF executeJavascript()', color: '#94a3b8', small: true },
              { label: 'PosRealTimeReceiver.js', color: '#3b82f6', side: 'UI' },
              { label: 'RTK Query cache invalidation', color: '#3b82f6' },
            ].map((node, i) => (
              <div key={i}>
                {i > 0 && (
                  <div className="flex justify-center py-0.5">
                    <svg width="12" height="10" viewBox="0 0 12 10">
                      <path d="M6 0v7M3 5l3 3 3-3" stroke="#6ee7b7" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-1.5 border ${node.small ? 'border-dashed' : ''}`}
                  style={{ borderColor: node.color + '40', background: node.color + '08' }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono ${node.small ? 'text-[9px] text-gray-400' : 'text-[11px]'}`} style={{ color: node.small ? undefined : node.color }}>
                      {node.label}
                    </span>
                    {node.side && <span className="text-[8px] font-bold text-gray-400 uppercase">{node.side}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-2.5 rounded-lg bg-red-50 border border-red-200/60">
            <div className="text-[9px] font-bold text-red-500">FORBIDDEN</div>
            <div className="text-[10px] text-red-400 mt-0.5">Manager / ExternalBridge → PosRealTimeSender direct call</div>
          </div>
        </div>
      </div>

      {/* JSON MessageFrame */}
      <div className="mt-4 rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-slate-300 leading-relaxed">
        <div className="text-slate-500 mb-1">// JSON MessageFrame (all messages)</div>
        <div>{'{'}</div>
        <div className="pl-4">
          <span className="text-cyan-400">&quot;v&quot;</span>: <span className="text-amber-300">1</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-400">&quot;requestId&quot;</span>: <span className="text-green-300">&quot;uuid&quot;</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-400">&quot;timestamp&quot;</span>: <span className="text-green-300">&quot;ISO-8601&quot;</span>,
        </div>
        <div className="pl-4">
          <span className="text-cyan-400">&quot;idempotencyKey&quot;</span>: <span className="text-green-300">&quot;optional&quot;</span>
        </div>
        <div>{'}'}</div>
      </div>
    </div>
  );
}
