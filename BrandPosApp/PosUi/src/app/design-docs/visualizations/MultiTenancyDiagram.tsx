'use client';

function ConnectorDown({ color = '#cbd5e1' }: { color?: string }) {
  return (
    <div className="flex justify-center py-1">
      <svg width="2" height="28" viewBox="0 0 2 28">
        <line x1="1" y1="0" x2="1" y2="28" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
      </svg>
    </div>
  );
}

function ConnectorFork({ count, color = '#cbd5e1' }: { count: number; color?: string }) {
  const w = count * 180;
  return (
    <div className="flex justify-center py-1">
      <svg width={w} height="24" viewBox={`0 0 ${w} 24`} className="overflow-visible">
        {/* vertical down from center */}
        <line x1={w / 2} y1="0" x2={w / 2} y2="12" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
        {/* horizontal bar */}
        {count > 1 && (
          <line
            x1={w / count / 2}
            y1="12"
            x2={w - w / count / 2}
            y2="12"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        )}
        {/* vertical down to each child */}
        {Array.from({ length: count }).map((_, i) => {
          const x = w / count / 2 + (w / count) * i;
          return (
            <line key={i} x1={x} y1="12" x2={x} y2="24" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
          );
        })}
      </svg>
    </div>
  );
}

interface TierNodeProps {
  label: string;
  desc: string;
  color: string;
  tag?: string;
  children?: React.ReactNode;
}

function TierNode({ label, desc, color, tag, children }: TierNodeProps) {
  return (
    <div
      className="rounded-xl px-5 py-3.5 shadow-sm min-w-[160px] transition-transform duration-150 hover:scale-[1.03]"
      style={{ background: color }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-white text-[12px] font-bold tracking-wide">{label}</div>
          <div className="text-white/50 text-[10px] mt-0.5">{desc}</div>
        </div>
        {tag && (
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/20 text-white/80 shrink-0">{tag}</span>
        )}
      </div>
      {children}
    </div>
  );
}

const DEVICE_ICONS: Record<string, { label: string; color: string }> = {
  printer: { label: '🖨', color: '#f59e0b' },
  kiosk: { label: 'K', color: '#8b5cf6' },
  kds: { label: 'KD', color: '#10b981' },
  card: { label: '💳', color: '#3b82f6' },
  app: { label: '📱', color: '#ec4899' },
};

function BranchDots({ count, devices }: { count: number; devices?: string[] }) {
  const devs = devices || ['printer', 'card'];
  return (
    <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1.5">
      {/* POS row */}
      <div className="flex items-center gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-5 h-5 rounded bg-cyan-400/90 flex items-center justify-center">
            <span className="text-[7px] font-black text-cyan-900">P</span>
          </div>
        ))}
        <span className="text-[8px] text-white/30 ml-1">{count} POS</span>
      </div>
      {/* Device row */}
      <div className="flex items-center gap-0.5">
        {devs.map((d) => {
          const dev = DEVICE_ICONS[d];
          if (!dev) return null;
          return (
            <div key={d} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: dev.color + '30' }}>
              <span className="text-[7px]" style={{ color: dev.color }}>{dev.label}</span>
            </div>
          );
        })}
        <span className="text-[8px] text-white/25 ml-0.5">Device</span>
      </div>
    </div>
  );
}

export default function MultiTenancyDiagram() {
  return (
    <div className="my-8 rounded-xl bg-gradient-to-b from-slate-50 to-gray-50 border border-gray-200 px-6 py-8">
      {/* Level 1: SuperAdmin */}
      <div className="flex justify-center">
        <TierNode label="SuperAdmin" desc="Platform Governance" color="#1e293b" tag="L1">
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10">
            {['Portal', 'CentralApi', 'SyncWorkers'].map((s) => (
              <span key={s} className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono">{s}</span>
            ))}
          </div>
        </TierNode>
      </div>

      {/* Connector: 1 → 2 */}
      <ConnectorFork count={2} color="#64748b" />

      {/* Level 2: RegionalDistributors */}
      <div className="flex justify-center gap-16">
        <TierNode label="RegDistributor KR" desc="Korea Region" color="#475569" tag="L2" />
        <TierNode label="RegDistributor VN" desc="Vietnam Region" color="#475569" tag="L2" />
      </div>

      {/* Connector: 2 → 3 (two forks) */}
      <div className="flex justify-center gap-16">
        <div className="flex-1 max-w-[360px]">
          <ConnectorFork count={2} color="#64748b" />
        </div>
        <div className="flex-1 max-w-[360px]">
          <ConnectorFork count={2} color="#64748b" />
        </div>
      </div>

      {/* Level 3: BrandHQs */}
      <div className="flex justify-center gap-4">
        <TierNode label="BrandHQ A" desc="Korean Restaurant" color="#0369a1" tag="L3">
          <BranchDots count={3} devices={['printer', 'card', 'kds']} />
        </TierNode>
        <TierNode label="BrandHQ B" desc="Burger Chain" color="#0369a1" tag="L3">
          <BranchDots count={5} devices={['printer', 'card', 'kiosk', 'kds', 'app']} />
        </TierNode>
        <TierNode label="BrandHQ C" desc="Coffee Shop" color="#0369a1" tag="L3">
          <BranchDots count={2} devices={['printer', 'card']} />
        </TierNode>
        <TierNode label="BrandHQ D" desc="Pizza Chain" color="#0369a1" tag="L3">
          <BranchDots count={4} devices={['printer', 'card', 'kiosk', 'app']} />
        </TierNode>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-4 border-t border-gray-200">
        {[
          { color: '#1e293b', label: 'L1 Platform' },
          { color: '#475569', label: 'L2 Region' },
          { color: '#0369a1', label: 'L3 Brand' },
          { color: '#06b6d4', label: 'L4 Edge POS' },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-3 h-3 rounded" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
        <span className="text-[10px] text-gray-300">|</span>
        {[
          { icon: '🖨', label: 'Printer' },
          { icon: '💳', label: 'Card' },
          { icon: 'K', label: 'Kiosk', color: '#8b5cf6' },
          { icon: 'KD', label: 'KDS', color: '#10b981' },
          { icon: '📱', label: 'App' },
        ].map((d) => (
          <span key={d.label} className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="text-[9px]">{d.icon}</span>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
