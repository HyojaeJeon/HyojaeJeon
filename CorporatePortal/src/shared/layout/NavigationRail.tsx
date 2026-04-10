'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Network,
  Store,
  Users,
  SlidersHorizontal,
  Wallet,
  FileText,
  Plug,
  Settings,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { NAV_ITEMS, type NavItem } from './nav-items';
import { cn } from '@shared/utils/cn';
import { useI18n } from '@i18n/I18nProvider';
import { useHasPermission } from '@rbac/useHasPermission';
import { useAppDispatch, useAppSelector } from '@store/index';
import { toggleNavCollapsed } from '@store/slices/navigationSlice';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Network,
  Store,
  Users,
  SlidersHorizontal,
  Wallet,
  FileText,
  Plug,
  Settings,
  ShieldCheck,
  User,
};

function isPathInItem(item: NavItem, pathname: string): boolean {
  if (pathname === item.href || pathname.startsWith(item.href + '/')) {
    return true;
  }
  return item.children?.some((c) => isPathInItem(c, pathname)) ?? false;
}

function LeafLink({
  item,
  collapsed,
  depth,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  depth: number;
  active: boolean;
}) {
  const { t } = useI18n();
  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
  return (
    <Link
      href={item.href}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition-all',
        'text-fg-muted hover:bg-surface-2 hover:text-fg',
        active && 'bg-primary text-primary-fg shadow-[0_2px_8px_rgb(57_85_255_/_0.25)]',
        depth > 0 && 'ml-5 py-2 text-[12.5px] font-medium',
        depth > 0 && active && 'bg-primary-soft text-primary shadow-none',
      )}
      title={collapsed ? t(item.labelKey) : undefined}
    >
      <Icon size={depth > 0 ? 14 : 18} strokeWidth={active && depth === 0 ? 2.25 : 2} className="shrink-0" />
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </Link>
  );
}

function NavLink({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
  const allowed = useHasPermission(item.permissions ?? [], item.permissionMode ?? 'any');

  const active = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildInPath = !!item.children?.some((c) => isPathInItem(c, pathname));

  const [open, setOpen] = useState<boolean>(hasChildInPath);
  if (hasChildInPath && !open) {
    queueMicrotask(() => setOpen(true));
  }

  if (!allowed) return null;

  if (!item.children || item.children.length === 0) {
    return <LeafLink item={item} collapsed={collapsed} depth={depth} active={active} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition-all',
          'text-fg-muted hover:bg-surface-2 hover:text-fg',
          active && !open && 'bg-surface-2 text-fg',
          depth > 0 && 'ml-5 py-2 text-[12.5px] font-medium',
        )}
        title={collapsed ? t(item.labelKey) : undefined}
        aria-expanded={open}
      >
        <Icon size={depth > 0 ? 14 : 18} strokeWidth={2} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{t(item.labelKey)}</span>
            <ChevronRight
              size={14}
              className={cn('shrink-0 text-fg-subtle transition-transform', open && 'rotate-90')}
            />
          </>
        )}
      </button>
      {!collapsed && open && (
        <div className="mt-1 mb-1 flex flex-col gap-0.5">
          {item.children.map((child) => (
            <NavLink key={child.key} item={child} collapsed={false} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

export function NavigationRail() {
  const collapsed = useAppSelector((s) => s.navigation.navCollapsed);
  const dispatch = useAppDispatch();
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col bg-surface-1 transition-[width] duration-200',
        collapsed ? 'w-[80px]' : 'w-[260px]',
      )}
      style={{ borderRight: '1px solid var(--border)' }}
    >
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-[14px] font-black text-primary-fg shadow-[0_4px_12px_rgb(57_85_255_/_0.3)]">
          CP
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-[14px] font-black leading-tight text-fg tracking-tight">{t('app.name')}</div>
            <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-fg-subtle mt-0.5">
              {t('app.tagline')}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => dispatch(toggleNavCollapsed())}
        className="flex h-11 items-center justify-center text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        style={{ borderTop: '1px solid var(--border)' }}
        aria-label="Toggle navigation"
      >
        <ChevronLeft
          size={16}
          className={cn('transition-transform', collapsed && 'rotate-180')}
        />
      </button>
    </aside>
  );
}
