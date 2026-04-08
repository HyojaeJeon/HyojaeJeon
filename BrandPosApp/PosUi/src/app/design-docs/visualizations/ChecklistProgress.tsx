'use client';

const P0_ITEMS = [
  { cat: 'Layer Boundaries', items: ['Actions no direct SQL/Manager combo', 'ExternalBridge no PosRealTimeSender', 'Manager no UI event send', 'UseCases only event authority'] },
  { cat: 'Idempotency', items: ['requestId + idempotencyKey on all mutations', 'Ledger status tracking (RECEIVED→SUCCEEDED)', 'Duplicate request rejection'] },
  { cat: 'Transaction', items: ['Business data + Ledger + Outbox in single TX', 'DB commit before external ACK', 'Rollback on partial failure'] },
  { cat: 'Failure Recovery', items: ['PROCESSING tasks resume on restart', 'Recovery from DB, not browser cache', 'Crash loop detection and safe mode'] },
  { cat: 'Operational', items: ['INI feature flag for screen rollback', 'x86/x64 dual build', 'Static export to app:// scheme'] },
];

const P1_ITEMS = [
  { cat: 'Browser/Runtime', items: ['CEF single instance strategy', 'Renderer crash recovery contract', 'No CloseBrowser on screen switch'] },
  { cat: 'Performance', items: ['x86 RSS memory baseline', 'Startup time budget', 'Main thread blocking audit'] },
  { cat: 'Contract', items: ['JSON MessageFrame standard on all messages', 'Device error code-based (no msg strings)', 'Bridge contract type safety'] },
  { cat: 'Observability', items: ['requestId chain in all logs', 'Structured logging format', 'Error rate dashboards'] },
  { cat: 'QA', items: ['Bridge contract tests automated', 'Screen transition regression tests', 'Offline scenario test suite'] },
  { cat: 'Deployment', items: ['Next.js static export verified', 'CEF cache/session persistence', 'Gradual rollout via INI flags'] },
];

function ChecklistSection({ title, groups, color }: { title: string; groups: typeof P0_ITEMS; color: string }) {
  const total = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="rounded-xl border p-5" style={{ borderColor: color + '30' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black px-2.5 py-0.5 rounded-lg text-white" style={{ background: color }}>{title}</span>
          <span className="text-[11px] text-gray-400">{total} items</span>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '0%', background: color }} />
          </div>
          <span className="text-[10px] text-gray-400">0%</span>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.cat}>
            <div className="text-[11px] font-bold text-gray-500 mb-1.5">{group.cat}</div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item} className="flex items-start gap-2 group">
                  <div className="w-4 h-4 rounded border-2 border-gray-200 shrink-0 mt-0.5 group-hover:border-gray-400 transition-colors" />
                  <span className="text-[11px] text-gray-600 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChecklistProgress() {
  return (
    <div className="my-8 space-y-4">
      <ChecklistSection title="P0 — Production Blocker" groups={P0_ITEMS} color="#dc2626" />
      <ChecklistSection title="P1 — Pre-Pilot Required" groups={P1_ITEMS} color="#f59e0b" />
    </div>
  );
}
