'use client';

import { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  LayoutGrid,
  Smartphone,
  MapPin,
  Wallet,
  Receipt,
  UtensilsCrossed,
  UserCircle,
} from 'lucide-react';
import { MobileFrame } from './shared/MobileFrame';
import { SCREEN_LIST } from './mockData';
import type { ScreenId } from './types';
import { useVmealT, setVmealLocale } from './i18n/useVmealT';

/* ─── Lazy-loaded screen components ─── */
const SplashScreen = lazy(() => import('./screens/splash/SplashScreen'));
const OnboardingScreen = lazy(() => import('./screens/onboarding/OnboardingScreen'));
const AuthScreen = lazy(() => import('./screens/auth/AuthScreen'));
const WalletHomeScreen = lazy(() => import('./screens/walletHome/WalletHomeScreen'));
const OrderScreen = lazy(() => import('./screens/order/OrderScreen'));
const OrderStatusScreen = lazy(() => import('./screens/orderStatus/OrderStatusScreen'));
const MerchantMapScreen = lazy(() => import('./screens/merchantMap/MerchantMapScreen'));
const MerchantDetailScreen = lazy(() => import('./screens/merchantDetail/MerchantDetailScreen'));
const DailyMenuListScreen = lazy(() => import('./screens/dailyMenuList/DailyMenuListScreen'));
const TransactionListScreen = lazy(() => import('./screens/transactionList/TransactionListScreen'));
const TransactionDetailScreen = lazy(() => import('./screens/transactionDetail/TransactionDetailScreen'));
const TopUpScreen = lazy(() => import('./screens/topUp/TopUpScreen'));
const SettingsScreen = lazy(() => import('./screens/settings/SettingsScreen'));
const BadgeLinkScreen = lazy(() => import('./screens/badgeLink/BadgeLinkScreen'));
const PolicyViewScreen = lazy(() => import('./screens/policyView/PolicyViewScreen'));
const PreOrderScreen = lazy(() => import('./screens/preOrder/PreOrderScreen'));
const MyPreOrdersScreen = lazy(() => import('./screens/myPreOrders/MyPreOrdersScreen'));
const GroupPayScreen = lazy(() => import('./screens/groupPay/GroupPayScreen'));

const SCREEN_COMPONENTS: Record<ScreenId, React.LazyExoticComponent<React.ComponentType>> = {
  splash: SplashScreen,
  onboarding: OnboardingScreen,
  auth: AuthScreen,
  walletHome: WalletHomeScreen,
  order: OrderScreen,
  orderStatus: OrderStatusScreen,
  merchantMap: MerchantMapScreen,
  merchantDetail: MerchantDetailScreen,
  dailyMenuList: DailyMenuListScreen,
  transactionList: TransactionListScreen,
  transactionDetail: TransactionDetailScreen,
  topUp: TopUpScreen,
  settings: SettingsScreen,
  badgeLink: BadgeLinkScreen,
  policyView: PolicyViewScreen,
  preOrder: PreOrderScreen,
  myPreOrders: MyPreOrdersScreen,
  groupPay: GroupPayScreen,
};

const CATEGORY_ICONS: Record<string, typeof Wallet> = {
  auth: Smartphone,
  wallet: Wallet,
  order: UtensilsCrossed,
  merchant: MapPin,
  transaction: Receipt,
  account: UserCircle,
};

function ScreenSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

interface DesignViewerProps {
  screenId: string;
}

const LOCALE_LABELS: Record<string, string> = { vi: 'VI', ko: 'KO', en: 'EN' };
const LOCALES = ['vi', 'ko', 'en'] as const;

export function DesignViewer({ screenId }: DesignViewerProps) {
  const router = useRouter();
  const { locale } = useVmealT();
  const currentIndex = SCREEN_LIST.findIndex((s) => s.id === screenId);
  const screen = SCREEN_LIST[currentIndex];
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!screen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] text-white">
        <p>Screen not found: {screenId}</p>
      </div>
    );
  }

  const ScreenComponent = SCREEN_COMPONENTS[screen.id];
  const prevScreen = currentIndex > 0 ? SCREEN_LIST[currentIndex - 1] : null;
  const nextScreen = currentIndex < SCREEN_LIST.length - 1 ? SCREEN_LIST[currentIndex + 1] : null;

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="flex w-[260px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0F172A]">
          {/* Logo */}
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
            <Link
              href="/design/vmeal"
              className="flex items-center gap-2 text-white hover:text-blue-400"
            >
              <LayoutGrid size={16} />
              <span className="text-sm font-semibold">VMeal Screens</span>
            </Link>
          </div>

          {/* Screen List */}
          <nav className="flex-1 overflow-y-auto py-2">
            {SCREEN_LIST.map((s) => {
              const Icon = CATEGORY_ICONS[s.category] ?? Smartphone;
              const active = s.id === screenId;
              return (
                <Link
                  key={s.id}
                  href={`/design/vmeal/${s.id}`}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-blue-500/15 font-medium text-blue-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  <span className="flex-1 truncate">{s.title}</span>
                  {s.showBottomTab && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">Tab</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      {/* Main Area */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex h-[56px] items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            <div>
              <p className="text-sm font-medium text-white">{screen.title}</p>
              <p className="text-xs text-gray-500">{screen.titleVi}</p>
            </div>
          </div>

          {/* Language Switcher + Prev / Next */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
              <Globe size={13} className="ml-1.5 text-gray-500" />
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setVmealLocale(loc)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    locale === loc
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {LOCALE_LABELS[loc]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {prevScreen && (
              <button
                onClick={() => router.push(`/design/vmeal/${prevScreen.id}`)}
                className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={14} />
                {prevScreen.title}
              </button>
            )}
            {nextScreen && (
              <button
                onClick={() => router.push(`/design/vmeal/${nextScreen.id}`)}
                className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white"
              >
                {nextScreen.title}
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Phone Mockup Area */}
        <div className="flex flex-1 items-center justify-center overflow-auto py-8">
          <MobileFrame
            showBottomTab={screen.showBottomTab}
            activeTab={screen.activeTab}
            onTabChange={(tab) => {
              const tabMap: Record<string, ScreenId> = {
                home: 'walletHome',
                explore: 'merchantMap',
                activity: 'transactionList',
                account: 'settings',
              };
              if (tabMap[tab]) router.push(`/design/vmeal/${tabMap[tab]}`);
            }}
          >
            <Suspense fallback={<ScreenSkeleton />}>
              <ScreenComponent />
            </Suspense>
          </MobileFrame>
        </div>
      </div>
    </div>
  );
}
