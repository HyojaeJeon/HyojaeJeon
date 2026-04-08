'use client';

const DOMAINS = [
  {
    name: 'Shared Reference',
    color: '#6366f1',
    storage: 'Central PostgreSQL + Edge SQLite cache',
    tables: ['Language', 'Region', 'Currency'],
  },
  {
    name: 'SuperAdmin Governance',
    color: '#1e293b',
    storage: 'Central PostgreSQL',
    tables: ['SuperAdminUser', 'PlatformLicense', 'PlatformPolicy', 'AuditLog', 'DeployPackage', 'DeployRelease'],
  },
  {
    name: 'RegionalDistributor',
    color: '#475569',
    storage: 'Central PostgreSQL',
    tables: ['DistributorProfile', 'Territory', 'DistributorContract', 'BrandAssignment', 'DeploymentScope', 'DistributorUser'],
  },
  {
    name: 'BrandHQ MasterData',
    color: '#0369a1',
    storage: 'Central PostgreSQL → Edge sync',
    tables: ['BrandProfile', 'Branch', 'BrandMenuCategory', 'BrandMenuItem', 'PricePolicy', 'Promotion', 'BranchOverride', 'OperatorTemplate'],
  },
  {
    name: 'EdgePOS Operational',
    color: '#0891b2',
    storage: 'Edge SQLite (source of truth)',
    tables: ['EdgePosTerminal', 'Device', 'DeviceBinding', 'LocalSetting', 'MenuCategorySnapshot', 'MenuItemSnapshot', 'Customer', 'Table', 'OrderSlip', 'OrderItem', 'PaymentSlip', 'Receipt', 'WaitPayment', 'Outbox', 'SyncCursor', 'RecoveryState'],
  },
  {
    name: 'Legacy HJ-POS',
    color: '#dc2626',
    storage: 'Local MSSQL (migration target)',
    tables: ['95+ tables', 'See table master'],
    legacy: true,
  },
];

export default function DbDomainDiagram() {
  return (
    <div className="my-8 space-y-3">
      {DOMAINS.map((domain) => (
        <div
          key={domain.name}
          className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-sm ${domain.legacy ? 'border-dashed opacity-70' : ''}`}
          style={{ borderColor: domain.color + '30' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: domain.color }} />
              <span className="text-sm font-bold" style={{ color: domain.color }}>{domain.name}</span>
              {domain.legacy && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 text-red-500 font-bold">LEGACY</span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{domain.storage}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {domain.tables.map((table) => (
              <span
                key={table}
                className="text-[10px] px-2 py-1 rounded-md font-mono"
                style={{
                  background: domain.color + '0a',
                  color: domain.color,
                  border: `1px solid ${domain.color}20`,
                }}
              >
                {table}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Sync direction indicators */}
      <div className="flex items-center justify-center gap-8 mt-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <svg width="40" height="12" viewBox="0 0 40 12">
            <line x1="0" y1="6" x2="32" y2="6" stroke="#0891b2" strokeWidth="1.5" />
            <path d="M28 2l6 4-6 4" fill="#0891b2" />
          </svg>
          Upstream (Edge → Central)
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <svg width="40" height="12" viewBox="0 0 40 12">
            <line x1="8" y1="6" x2="40" y2="6" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 2" />
            <path d="M12 2l-6 4 6 4" fill="#1e293b" />
          </svg>
          Downstream (Central → Edge)
        </div>
      </div>
    </div>
  );
}
