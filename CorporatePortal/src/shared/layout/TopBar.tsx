'use client';

import { Search, Sun, Moon, Monitor, Languages, Bell, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useTheme } from '@providers/ThemeProvider';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@platform/shared-ui';
import { useI18n } from '@i18n/I18nProvider';
import { SUPPORTED_LOCALES, type Locale } from '@i18n/messages';
import { cn } from '@shared/utils/cn';
import { logoutSession } from '@auth/session';
import { useAppSelector } from '@store/index';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const current = mounted ? theme ?? 'system' : 'system';
  const icon = !mounted ? (
    <Monitor size={15} />
  ) : current === 'dark' ? (
    <Moon size={15} />
  ) : current === 'light' ? (
    <Sun size={15} />
  ) : (
    <Monitor size={15} />
  );
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        aria-label="theme"
      >
        {icon}
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-36 rounded-md border bg-surface-3 p-1 shadow-lg"
          style={{ borderColor: 'var(--border)' }}
          onMouseLeave={() => setOpen(false)}
        >
          {(['light', 'dark', 'system'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[12.5px] text-fg-muted hover:bg-surface-2 hover:text-fg',
                current === opt && 'bg-primary-soft text-primary',
              )}
              onClick={() => {
                setTheme(opt);
                setOpen(false);
              }}
            >
              {opt === 'light' && <Sun size={13} />}
              {opt === 'dark' && <Moon size={13} />}
              {opt === 'system' && <Monitor size={13} />}
              <span className="capitalize">{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LocaleToggle() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const localeLabels: Record<Locale, string> = { ko: '한국어', vi: 'Tiếng Việt', en: 'English' };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Languages size={14} />
        <span className="uppercase">{locale}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-36 rounded-md border bg-surface-3 p-1 shadow-lg"
          style={{ borderColor: 'var(--border)' }}
          onMouseLeave={() => setOpen(false)}
        >
          {SUPPORTED_LOCALES.map((l: Locale) => (
            <button
              key={l}
              type="button"
              className={cn(
                'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-[12.5px] text-fg-muted hover:bg-surface-2 hover:text-fg',
                locale === l && 'bg-primary-soft text-primary',
              )}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
            >
              <span>{localeLabels[l]}</span>
              <span className="text-[10px] uppercase text-fg-subtle">{l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const { t } = useI18n();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const displayName = user?.displayName ?? 'Guest';
  const userType = user?.userType ?? 'CORPORATE_ADMIN';
  const initials = (displayName || 'CP').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    void logoutSession();
  };

  const handleLogin = () => {
    setOpen(false);
    router.push('/login');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-xl bg-surface-1 py-1.5 pl-1.5 pr-4 transition-colors hover:bg-surface-2"
        style={{ boxShadow: 'var(--shadow-sm)' }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[12px] font-black text-primary-fg">
          {initials}
        </div>
        <div className="hidden text-[12.5px] leading-tight sm:block">
          <div className="font-bold text-fg">{displayName}</div>
          <div className="text-[10.5px] font-semibold text-fg-subtle mt-0.5">{userType}</div>
        </div>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-surface-1 p-2"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[14px] font-black text-primary-fg">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-fg">{displayName}</div>
              <div className="truncate text-[11px] font-semibold text-fg-subtle">
                {user?.loginId ?? '—'}
              </div>
            </div>
          </div>
          <div className="my-1 h-px" style={{ background: 'var(--border)' }} />
          <div className="flex items-center justify-between px-3 py-1.5 text-[12px]">
            <span className="flex items-center gap-2 text-fg-muted">
              <Shield size={13} />
              Role
            </span>
            <span className="font-mono text-[11px] font-bold text-fg">{userType}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 text-[12px]">
            <span className="flex items-center gap-2 text-fg-muted">
              <UserIcon size={13} />
              Login ID
            </span>
            <span className="font-mono text-[11px] text-fg">{user?.loginId ?? '—'}</span>
          </div>
          <div className="my-1 h-px" style={{ background: 'var(--border)' }} />
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut size={14} />
              {t('common.signOut')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-primary transition-colors hover:bg-primary-soft"
            >
              <LogOut size={14} className="rotate-180" />
              {t('login.submit')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const { t } = useI18n();
  return (
    <header
      className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 bg-surface-0/90 px-8 backdrop-blur-sm"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex flex-1 items-center">
        <Input
          placeholder={t('common.search')}
          startIcon={<Search size={15} />}
          style={{ minWidth: 320, maxWidth: 460, height: 40, borderRadius: 999 }}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          aria-label="notifications"
        >
          <Bell size={17} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger" />
        </button>
        <LocaleToggle />
        <ThemeToggle />
        <div className="mx-2 h-6 w-px" style={{ background: 'var(--border)' }} />
        <ProfileMenu />
      </div>
    </header>
  );
}
