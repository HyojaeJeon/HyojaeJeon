'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dbData from '../db-master-data.json';

// ---------------------------------------------------------------------------
// Types (mirrored from the JSON)
// ---------------------------------------------------------------------------

interface DbColumn {
  name: string;
  type: string;
  nullable: string;
  default: string;
  description: string;
}

interface DbTable {
  id: string;
  name: string;
  section: string;
  owner: string;
  storage: string;
  syncDirection: string;
  columns: DbColumn[];
  constraints: string[];
  indexes: string[];
  scenarios: string[];
  deprecated: boolean;
  deprecatedNote: string;
}

interface DbMasterData {
  platformTables: DbTable[];
  legacyTables: DbTable[];
  totalPlatformCount: number;
  totalLegacyCount: number;
}

const data = dbData as DbMasterData;

// ---------------------------------------------------------------------------
// Section grouping
// ---------------------------------------------------------------------------

interface SectionGroup {
  key: string;
  label: string;
  tables: DbTable[];
}

const SECTION_ORDER = [
  'Shared/ReferenceData',
  'SuperAdmin/Governance',
  'Distributor/ChannelGovernance',
  'BrandHQ/MasterData',
  'EdgePOS/OperationalCore',
  'Legacy',
];

const SECTION_LABELS: Record<string, string> = {
  'Shared/ReferenceData': 'Shared',
  'SuperAdmin/Governance': 'SuperAdmin',
  'Distributor/ChannelGovernance': 'Distributor',
  'BrandHQ/MasterData': 'BrandHQ',
  'EdgePOS/OperationalCore': 'EdgePOS',
  Legacy: 'Legacy HJ-POS',
};

function buildGroups(tables: DbTable[]): SectionGroup[] {
  const map = new Map<string, DbTable[]>();
  for (const t of tables) {
    const list = map.get(t.section) ?? [];
    list.push(t);
    map.set(t.section, list);
  }
  return SECTION_ORDER.filter((k) => map.has(k)).map((k) => ({
    key: k,
    label: SECTION_LABELS[k] ?? k,
    tables: map.get(k)!,
  }));
}

// ---------------------------------------------------------------------------
// Type badge colour
// ---------------------------------------------------------------------------

function typeBadgeClass(rawType: string): string {
  const t = rawType.toLowerCase();
  if (/uuid|text/.test(t)) return 'bg-gray-100 text-gray-600 border-gray-200';
  if (/varchar|char/.test(t)) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (/bool|integer|smallint|int/.test(t)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (/timestamp|date/.test(t)) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (/numeric|decimal|real/.test(t)) return 'bg-red-50 text-red-700 border-red-200';
  if (/jsonb|json/.test(t)) return 'bg-violet-50 text-violet-700 border-violet-200';
  if (/inet/.test(t)) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------

function KeyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block mr-0.5 -mt-px">
      <path
        d="M7.5 1.5a3 3 0 00-2.83 4.01L1.5 8.68V10.5h1.82l.43-.43v-.82h.75v-.75h.75l.76-.76A3 3 0 107.5 1.5z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.25" cy="3.75" r="0.75" fill="currentColor" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block mr-0.5 -mt-px">
      <path
        d="M5 7l2-2m-1.5-.5L7 3a1.77 1.77 0 012.5 2.5l-1.5 1.5m-3 0L3.5 8.5A1.77 1.77 0 006 11l1.5-1.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-400">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <line x1="1.5" y1="5" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="5" y1="5" x2="5" y2="12" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function DeprecatedBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-50 text-red-500 border border-red-200 leading-none">
      폐기후보
    </span>
  );
}

// ---------------------------------------------------------------------------
// Constraint analysis helpers
// ---------------------------------------------------------------------------

function isPrimaryKey(col: DbColumn, constraints: string[]): boolean {
  return constraints.some(
    (c) => /primary key/i.test(c) && c.includes(col.name),
  );
}

function isForeignKey(col: DbColumn, constraints: string[]): boolean {
  return constraints.some(
    (c) => /foreign key/i.test(c) && c.includes(col.name),
  );
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

function Sidebar({
  groups,
  activeId,
  onSelect,
  query,
  onQueryChange,
}: {
  groups: SectionGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;
    const active = sidebarRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeId]);

  const totalCount = groups.reduce((s, g) => s + g.tables.length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-4 pb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="테이블 검색..."
            className="w-full pl-8 pr-3 py-2 text-[12px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="mt-2 text-[10px] text-gray-400 font-medium px-0.5">
          총 {totalCount}개 테이블
        </div>
      </div>

      {/* Groups */}
      <div ref={sidebarRef} className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map((g) => (
          <div key={g.key} className="mb-3">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                {g.label}
              </span>
              <span className="text-[10px] font-medium text-gray-300 tabular-nums">
                {g.tables.length}
              </span>
            </div>
            {g.tables.map((t) => {
              const isActive = t.id === activeId;
              return (
                <button
                  key={t.id}
                  data-active={isActive}
                  onClick={() => onSelect(t.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 active:bg-gray-100'
                  }`}
                >
                  <span className={isActive ? 'text-blue-500' : 'text-gray-300'}>
                    <TableIcon />
                  </span>
                  <span className="truncate flex-1">{t.name}</span>
                  {t.deprecated && <DeprecatedBadge />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function DetailPanel({ table }: { table: DbTable }) {
  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 font-mono">{table.name}</h2>
              {table.deprecated && <DeprecatedBadge />}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {table.section}
            </p>
          </div>
          <div className="text-right text-[11px] text-gray-400 shrink-0">
            {table.columns.length}개 컬럼
          </div>
        </div>

        {/* Metadata chips */}
        {table.owner && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            <MetaChip label="소유" value={table.owner} />
            <MetaChip label="저장위치" value={table.storage} />
            <MetaChip label="동기화" value={table.syncDirection} />
          </div>
        )}

        {table.deprecated && table.deprecatedNote && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-[11px] text-red-600 leading-relaxed">
            {table.deprecatedNote}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-6">
        {/* Column table */}
        <ColumnTable table={table} />

        {/* Constraints */}
        {table.constraints.length > 0 && (
          <SectionBlock title="제약 조건" items={table.constraints} />
        )}

        {/* Indexes */}
        {table.indexes.length > 0 && (
          <SectionBlock title="인덱스" items={table.indexes} />
        )}

        {/* Scenarios */}
        {table.scenarios.length > 0 && (
          <SectionBlock title="사용 시나리오" items={table.scenarios} />
        )}
      </div>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  if (!value || value === '-') return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-600">{value}</span>
    </span>
  );
}

function ColumnTable({ table }: { table: DbTable }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-gray-50/80">
            <th className="sticky top-0 bg-gray-50/95 backdrop-blur-sm text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-200 w-[160px]">
              컬럼명
            </th>
            <th className="sticky top-0 bg-gray-50/95 backdrop-blur-sm text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-200 w-[140px]">
              타입
            </th>
            <th className="sticky top-0 bg-gray-50/95 backdrop-blur-sm text-center px-2 py-2.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-200 w-[56px]">
              Null
            </th>
            <th className="sticky top-0 bg-gray-50/95 backdrop-blur-sm text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-200 w-[90px]">
              Default
            </th>
            <th className="sticky top-0 bg-gray-50/95 backdrop-blur-sm text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase border-b border-gray-200">
              설명
            </th>
          </tr>
        </thead>
        <tbody>
          {table.columns.map((col, ci) => {
            const pk = isPrimaryKey(col, table.constraints);
            const fk = isForeignKey(col, table.constraints);
            return (
              <tr
                key={ci}
                className={ci % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}
              >
                <td className="px-3 py-2 border-b border-gray-100 font-mono text-gray-800 font-medium">
                  <span className="flex items-center gap-1">
                    {pk && (
                      <span className="text-amber-500" title="Primary Key">
                        <KeyIcon />
                      </span>
                    )}
                    {fk && (
                      <span className="text-blue-500" title="Foreign Key">
                        <LinkIcon />
                      </span>
                    )}
                    {col.name}
                  </span>
                </td>
                <td className="px-3 py-2 border-b border-gray-100">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${typeBadgeClass(col.type)}`}
                  >
                    {col.type}
                  </span>
                </td>
                <td className="px-2 py-2 border-b border-gray-100 text-center">
                  {col.nullable === 'Yes' ? (
                    <span className="text-gray-400 text-[10px]">Yes</span>
                  ) : col.nullable === 'No' ? (
                    <span className="text-gray-700 text-[10px] font-semibold">No</span>
                  ) : (
                    <span className="text-gray-300 text-[10px]">{col.nullable}</span>
                  )}
                </td>
                <td className="px-3 py-2 border-b border-gray-100 font-mono text-[11px] text-gray-500">
                  {col.default}
                </td>
                <td className="px-3 py-2 border-b border-gray-100 text-gray-600 leading-relaxed">
                  {renderInlineCode(col.description)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function renderInlineCode(text: string): React.ReactNode {
  if (!text.includes('`')) return text;
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('`') && p.endsWith('`')) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-gray-100 text-[10px] font-mono text-gray-700 border border-gray-200">
          {p.slice(1, -1)}
        </code>
      );
    }
    return p;
  });
}

function SectionBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2">
        {title}
      </h3>
      <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
            <span className="text-gray-300 mt-0.5 shrink-0 select-none">-</span>
            <span className="leading-relaxed">{renderInlineCode(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyDetail() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="9" x2="9" y2="20" />
          </svg>
        </div>
        <p className="text-[12px] text-gray-400">좌측 목록에서 테이블을 선택하세요</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DbTableMasterClient() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>('');

  const allTables = useMemo(
    () => [...data.platformTables, ...data.legacyTables],
    [],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allTables;
    const q = query.trim().toLowerCase();
    return allTables.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.section.toLowerCase().includes(q) ||
        t.columns.some((c) => c.name.toLowerCase().includes(q)),
    );
  }, [allTables, query]);

  const groups = useMemo(() => buildGroups(filtered), [filtered]);

  const activeTable = useMemo(
    () => allTables.find((t) => t.id === activeId) ?? null,
    [allTables, activeId],
  );

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  return (
    <div className="w-full h-full">
      {/* Title bar */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase">
              DB 설계
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              DB 테이블 마스터
            </h1>
            <p className="text-[12px] text-gray-400 mt-1">
              현재 플랫폼 정의 {data.totalPlatformCount}개 + Legacy HJ-POS {data.totalLegacyCount}개 테이블 전수 인벤토리
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatBadge label="Platform" count={data.totalPlatformCount} color="blue" />
            <StatBadge label="Legacy" count={data.totalLegacyCount} color="gray" />
          </div>
        </div>
      </div>

      {/* Content: sidebar + detail */}
      <div className="flex" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Sidebar */}
        <div className="w-[240px] shrink-0 border-r border-gray-100 bg-white overflow-hidden">
          <Sidebar
            groups={groups}
            activeId={activeId}
            onSelect={handleSelect}
            query={query}
            onQueryChange={setQuery}
          />
        </div>

        {/* Detail */}
        <div className="flex-1 bg-white overflow-hidden">
          {activeTable ? (
            <DetailPanel table={activeTable} />
          ) : (
            <EmptyDetail />
          )}
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: 'blue' | 'gray' }) {
  const cls =
    color === 'blue'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${cls}`}>
      <span>{label}</span>
      <span className="font-bold tabular-nums">{count}</span>
    </span>
  );
}
