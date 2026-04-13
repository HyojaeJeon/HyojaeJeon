'use client';

import { useState, useMemo } from 'react';
import { Check, Minus, ChevronDown, ChevronRight, Star, Search } from 'lucide-react';
import { Input } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import type {
  RbacRoleRow,
  PermissionCategoryDef,
  MenuPermissionNodeDef,
} from '@graphql/queries/rbac';

const LEFT_COL_WIDTH = 400;
const ROLE_COL_WIDTH = 100;

function matchPermission(perms: string[], key: string): boolean {
  if (perms.includes(key)) return true;
  if (perms.includes('*')) return true;
  const parts = key.split(':');
  if (parts.length >= 2 && perms.includes(`${parts[0]}:*`)) return true;
  if (parts.length >= 3 && perms.includes(`${parts[0]}:${parts[1]}:*`)) return true;
  return false;
}

function getCategoryPermKeys(catId: string, categories: PermissionCategoryDef[]): string[] {
  return categories.find((c) => c.category === catId)?.permissions.map((p) => p.key) ?? [];
}

function getAllCats(node: MenuPermissionNodeDef): string[] {
  const cats = [...(node.categories ?? [])];
  if (node.children) for (const c of node.children) cats.push(...getAllCats(c));
  return cats;
}

interface Props {
  roles: RbacRoleRow[];
  categories: PermissionCategoryDef[];
  menuStructure: MenuPermissionNodeDef[];
  onUpdatePermissions: (roleId: string, permissions: string[]) => Promise<void>;
}

export function PermissionMatrixTab({ roles, categories, menuStructure, onUpdatePermissions }: Props) {
  const { t, locale } = useI18n();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = roles.filter((r) => r.scope === 'PLATFORM');

  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleCat = (id: string) => {
    setExpandedCats((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const getStatus = (role: RbacRoleRow, catIds: string[]): 'all' | 'some' | 'none' => {
    const perms = role.permissions ?? [];
    const allKeys = catIds.flatMap((c) => getCategoryPermKeys(c, categories));
    if (allKeys.length === 0) return 'none';
    const matched = allKeys.filter((k) => matchPermission(perms, k));
    if (matched.length === allKeys.length) return 'all';
    if (matched.length > 0) return 'some';
    return 'none';
  };

  const toggleCategoriesForRole = async (role: RbacRoleRow, catIds: string[]) => {
    if (role.isSystem && (role.permissions as string[])?.includes('*')) return;
    const allKeys = catIds.flatMap((c) => getCategoryPermKeys(c, categories));
    const perms = [...(role.permissions ?? [])] as string[];
    const status = getStatus(role, catIds);
    let next: string[];
    if (status === 'all') {
      next = perms.filter((p) => !allKeys.includes(p));
    } else {
      next = [...new Set([...perms, ...allKeys])];
    }
    await onUpdatePermissions(role.id, next);
  };

  const togglePermission = async (role: RbacRoleRow, permKey: string) => {
    if (role.isSystem && (role.permissions as string[])?.includes('*')) return;
    const perms = [...(role.permissions ?? [])] as string[];
    const has = matchPermission(perms, permKey);

    // 와일드카드 확장 처리
    const parts = permKey.split(':');
    const wildcardKey = parts.length >= 2 ? `${parts[0]}:*` : null;
    const hasWildcard = wildcardKey && perms.includes(wildcardKey);

    let next: string[];
    if (has) {
      if (hasWildcard && wildcardKey) {
        const expanded = getCategoryPermKeys(parts[0], categories).filter((k) => k !== permKey);
        next = perms.filter((p) => p !== wildcardKey).concat(expanded);
        next = [...new Set(next)];
      } else {
        next = perms.filter((p) => p !== permKey);
      }
    } else {
      next = [...perms, permKey];
    }
    await onUpdatePermissions(role.id, next);
  };

  const getDepthBg = (depth: number) => {
    const bgs = ['transparent', 'rgba(0,0,0,0.015)', 'rgba(0,0,0,0.03)', 'rgba(0,0,0,0.045)'];
    return bgs[Math.min(depth, bgs.length - 1)];
  };

  const getCellBg = (rowId: string, colId: string | null) => {
    const isRow = hoveredRow === rowId;
    const isCol = colId && hoveredCol === colId;
    if (isRow && isCol) return 'var(--primary-soft)';
    if (isRow) return 'rgba(57,85,255,0.06)';
    if (isCol) return 'rgba(57,85,255,0.04)';
    return 'transparent';
  };

  const renderStatusIcon = (status: 'all' | 'some' | 'none', role: RbacRoleRow, onClick: () => void) => {
    const disabled = role.isSystem && (role.permissions as string[])?.includes('*');
    if (status === 'all') {
      return (
        <button onClick={onClick} disabled={disabled} className="p-1.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}>
          <Check size={14} className="text-green-600" />
        </button>
      );
    }
    if (status === 'some') {
      return (
        <button onClick={onClick} disabled={disabled} className="p-1.5 rounded" style={{ backgroundColor: 'rgba(234,179,8,0.2)' }}>
          <Minus size={14} className="text-yellow-600" />
        </button>
      );
    }
    return (
      <button onClick={onClick} disabled={disabled} className="p-1.5 rounded opacity-30 hover:opacity-60 transition-opacity">
        <div className="w-3.5 h-3.5 border border-fg-subtle rounded" />
      </button>
    );
  };

  const pickLabel = (label: { ko: string; en: string; vi: string }) => {
    if (locale === 'ko') return label.ko;
    if (locale === 'en') return label.en;
    return label.vi;
  };

  const renderMenuItem = (menu: MenuPermissionNodeDef, depth = 0) => {
    const hasChildren = !!menu.children?.length;
    const hasCats = !!menu.categories?.length;
    const isExpanded = expandedMenus.has(menu.id);
    const allCats = getAllCats(menu);

    return (
      <div key={menu.id}>
        {/* 메뉴 헤더 */}
        <div
          className="flex items-stretch transition-colors"
          style={{ backgroundColor: hoveredRow === menu.id ? getCellBg(menu.id, null) : getDepthBg(depth) }}
          onMouseEnter={() => setHoveredRow(menu.id)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          <div
            className="shrink-0 flex items-center gap-2 py-2.5 cursor-pointer select-none"
            style={{ width: LEFT_COL_WIDTH, minWidth: LEFT_COL_WIDTH, paddingLeft: depth * 20 + 16 }}
            onClick={() => (hasChildren || hasCats) && toggleMenu(menu.id)}
          >
            {(hasChildren || hasCats) ? (
              isExpanded ? <ChevronDown size={14} className="text-fg-subtle" /> : <ChevronRight size={14} className="text-fg-subtle" />
            ) : <div className="w-3.5" />}
            <span className="text-[13px] font-semibold text-fg">{t(menu.labelKey)}</span>
            {allCats.length > 0 && (
              <span className="text-[11px] text-fg-subtle">
                ({allCats.reduce((n, c) => n + getCategoryPermKeys(c, categories).length, 0)})
              </span>
            )}
          </div>
          <div className="flex items-stretch">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="shrink-0 flex items-center justify-center py-2 transition-colors"
                style={{ width: ROLE_COL_WIDTH, backgroundColor: getCellBg(menu.id, role.id) }}
                onMouseEnter={() => { setHoveredRow(menu.id); setHoveredCol(role.id); }}
                onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}
              >
                {renderStatusIcon(getStatus(role, allCats), role, () => toggleCategoriesForRole(role, allCats))}
              </div>
            ))}
          </div>
        </div>

        {/* 하위 */}
        {isExpanded && (
          <>
            {hasChildren && menu.children!.map((child) => renderMenuItem(child, depth + 1))}
            {hasCats && menu.categories!.map((catId) => {
              const cat = categories.find((c) => c.category === catId);
              if (!cat) return null;
              const perms = cat.permissions;
              const isCatExpanded = expandedCats.has(catId);
              const catDepth = depth + 1;

              return (
                <div key={catId}>
                  {/* 카테고리 헤더 */}
                  <div
                    className="flex items-stretch border-t transition-colors"
                    style={{ borderColor: 'var(--border)', backgroundColor: hoveredRow === catId ? getCellBg(catId, null) : getDepthBg(catDepth) }}
                    onMouseEnter={() => setHoveredRow(catId)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <div
                      className="shrink-0 flex items-center gap-2 py-2 cursor-pointer select-none"
                      style={{ width: LEFT_COL_WIDTH, minWidth: LEFT_COL_WIDTH, paddingLeft: catDepth * 20 + 16 }}
                      onClick={() => toggleCat(catId)}
                    >
                      {isCatExpanded ? <ChevronDown size={12} className="text-fg-subtle" /> : <ChevronRight size={12} className="text-fg-subtle" />}
                      <span className="text-[12.5px] text-fg-muted">{pickLabel(cat.label)}</span>
                      <span className="text-[10px] text-fg-subtle">({perms.length})</span>
                    </div>
                    <div className="flex items-stretch">
                      {filteredRoles.map((role) => (
                        <div
                          key={role.id}
                          className="shrink-0 flex items-center justify-center py-2 transition-colors"
                          style={{ width: ROLE_COL_WIDTH, backgroundColor: getCellBg(catId, role.id) }}
                          onMouseEnter={() => { setHoveredRow(catId); setHoveredCol(role.id); }}
                          onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}
                        >
                          {renderStatusIcon(getStatus(role, [catId]), role, () => toggleCategoriesForRole(role, [catId]))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 개별 권한 */}
                  {isCatExpanded && perms.map((perm) => {
                    const permDepth = catDepth + 1;
                    if (searchQuery && !perm.key.includes(searchQuery) && !pickLabel(perm.label).includes(searchQuery)) return null;
                    return (
                      <div
                        key={perm.key}
                        className="flex items-stretch border-t transition-colors"
                        style={{ borderColor: 'color-mix(in srgb, var(--border) 30%, transparent)', backgroundColor: hoveredRow === perm.key ? getCellBg(perm.key, null) : getDepthBg(permDepth) }}
                        onMouseEnter={() => setHoveredRow(perm.key)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <div
                          className="shrink-0 flex flex-col justify-center py-1.5"
                          style={{ width: LEFT_COL_WIDTH, minWidth: LEFT_COL_WIDTH, paddingLeft: permDepth * 20 + 16 }}
                        >
                          <span className="text-[12px] text-fg-muted">{pickLabel(perm.label)}</span>
                          <span className="text-[10px] text-fg-subtle font-mono">{perm.key}</span>
                        </div>
                        <div className="flex items-stretch">
                          {filteredRoles.map((role) => {
                            const has = matchPermission(role.permissions ?? [], perm.key);
                            return (
                              <div
                                key={role.id}
                                className="shrink-0 flex items-center justify-center py-1.5 transition-colors"
                                style={{ width: ROLE_COL_WIDTH, backgroundColor: getCellBg(perm.key, role.id) }}
                                onMouseEnter={() => { setHoveredRow(perm.key); setHoveredCol(role.id); }}
                                onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}
                              >
                                {renderStatusIcon(has ? 'all' : 'none', role, () => togglePermission(role, perm.key))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 검색 + 범례 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder={t('settings.rbac.searchPermissions')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search size={14} />}
          />
        </div>
        <div className="flex items-center gap-4 text-[11px] text-fg-subtle">
          <span className="flex items-center gap-1.5"><span className="inline-block p-1 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}><Check size={10} className="text-green-600" /></span> {t('settings.rbac.legendAll')}</span>
          <span className="flex items-center gap-1.5"><span className="inline-block p-1 rounded" style={{ backgroundColor: 'rgba(234,179,8,0.2)' }}><Minus size={10} className="text-yellow-600" /></span> {t('settings.rbac.legendSome')}</span>
          <span className="flex items-center gap-1.5"><span className="inline-block p-1 rounded border opacity-30" style={{ borderColor: 'var(--border)' }}><div className="w-2.5 h-2.5" /></span> {t('settings.rbac.legendNone')}</span>
          <span className="flex items-center gap-1.5"><Star size={10} className="text-amber-500" /> {t('settings.rbac.legendSuper')}</span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'var(--border)', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {/* 헤더 */}
        <div className="flex items-stretch border-b bg-surface-1 sticky top-0 z-10" style={{ borderColor: 'var(--border)' }}>
          <div className="shrink-0 flex items-center py-2.5 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle" style={{ width: LEFT_COL_WIDTH, minWidth: LEFT_COL_WIDTH, paddingLeft: 36 }}>
            {t('settings.rbac.permissionsAndRoles')}
          </div>
          <div className="flex items-stretch">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="shrink-0 flex flex-col items-center justify-center py-2.5 transition-colors"
                style={{ width: ROLE_COL_WIDTH, backgroundColor: hoveredCol === role.id ? 'rgba(57,85,255,0.08)' : 'transparent' }}
                onMouseEnter={() => setHoveredCol(role.id)}
                onMouseLeave={() => setHoveredCol(null)}
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  {role.isSystem && (role.permissions as string[])?.includes('*') && <Star size={10} className="text-amber-500" />}
                  <span className="text-[11px] font-semibold text-primary">{role.roleCode.replace(/^(PLATFORM_|SA_)/, '')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 메뉴 트리 */}
        {menuStructure.map((menu) => renderMenuItem(menu))}
      </div>
    </div>
  );
}
