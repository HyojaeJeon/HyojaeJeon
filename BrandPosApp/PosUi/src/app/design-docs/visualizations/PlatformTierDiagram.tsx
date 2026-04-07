'use client';

import { useDesignDocsT } from '../i18n/DesignDocsI18nProvider';

const TIERS = [
  { id: 'super', color: '#1e293b', label: 'SuperAdmin', sub: 'Portal · CentralApi · SyncWorkers', tech: 'Next.js · NestJS · PostgreSQL · Redis', y: 0 },
  { id: 'dist', color: '#334155', label: 'RegionalDistributor', sub: 'Portal', tech: 'Next.js · Apollo Client · GraphQL', y: 1 },
  { id: 'brand', color: '#475569', label: 'BrandHQ', sub: 'Portal · Branch Management', tech: 'Next.js · Apollo Client · GraphQL', y: 2 },
  { id: 'edge', color: '#0891b2', label: 'Edge POS', sub: 'BrandPosApp · Setup/Maintenance', tech: 'C++ · CEF · Next.js · SQLite', y: 3 },
  { id: 'device', color: '#06b6d4', label: 'Device', sub: 'Printer · CardReader · Scanner · Scale', tech: 'Native Drivers', y: 4 },
];

export default function PlatformTierDiagram() {
  const { t } = useDesignDocsT();

  return (
    <div className="my-8">
      <div className="relative">
        {TIERS.map((tier, i) => {
          const widthPct = 100 - i * 8;
          const isEdge = tier.id === 'edge';

          return (
            <div key={tier.id} className="flex justify-center mb-1">
              <div
                className="relative rounded-xl px-6 py-4 transition-all duration-300 hover:scale-[1.02] group"
                style={{
                  width: `${widthPct}%`,
                  background: isEdge
                    ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
                    : tier.color,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm tracking-wide">{tier.label}</div>
                    <div className="text-white/60 text-[11px] mt-0.5">{tier.sub}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/40 text-[10px] font-mono">{tier.tech}</div>
                  </div>
                </div>

                {isEdge && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg">
                    <span className="text-[8px] font-black text-emerald-900">P0</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Arrows */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ zIndex: -1 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center">
              <svg width="20" height="24" viewBox="0 0 20 24" className="text-gray-300/50">
                <path d="M10 0v20M5 15l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-[10px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
          Downstream sync
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="#06b6d4" strokeWidth="1.5" /></svg>
          Upstream report
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          P0 target
        </span>
      </div>
    </div>
  );
}
