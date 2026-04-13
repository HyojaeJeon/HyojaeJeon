'use client';

import type { ReactNode } from 'react';
import {
  Home,
  MapPin,
  Receipt,
  User,
  Signal,
  Wifi,
  Battery,
} from 'lucide-react';
import { useVmealT } from '../i18n/useVmealT';

/* ─── Bottom Tab ─── */

const TABS = [
  { key: 'home', labelKey: 'tab.home', icon: Home },
  { key: 'explore', labelKey: 'tab.explore', icon: MapPin },
  { key: 'activity', labelKey: 'tab.activity', icon: Receipt },
  { key: 'account', labelKey: 'tab.account', icon: User },
] as const;

function BottomTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const { t } = useVmealT();

  return (
    <div className="flex h-[84px] items-end justify-around border-t border-gray-100 bg-white px-2 pb-[28px]">
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange?.(tab.key)}
            className="flex flex-col items-center gap-[2px]"
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.2 : 1.6}
              className={active ? 'text-[#3B82F6]' : 'text-gray-400'}
            />
            <span
              className={`text-[10px] leading-tight ${
                active
                  ? 'font-semibold text-[#3B82F6]'
                  : 'font-normal text-gray-400'
              }`}
            >
              {t(tab.labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Status Bar ─── */

function StatusBar() {
  return (
    <div className="flex h-[54px] items-end justify-between px-8 pb-[6px]">
      <span className="text-[15px] font-semibold text-black">9:41</span>
      <div className="flex items-center gap-[5px]">
        <Signal size={15} className="text-black" />
        <Wifi size={15} className="text-black" />
        <Battery size={15} className="text-black" />
      </div>
    </div>
  );
}

/* ─── Mobile Frame ─── */

/**
 * CorporatePortal 의 @theme 에서 --radius-* 가 웹용으로 크게 설정되어 있으므로,
 * 모바일 앱 목업 영역 안에서는 모바일에 적합한 값으로 오버라이드합니다.
 */
const MOBILE_RADIUS_OVERRIDE: React.CSSProperties = {
  // Tailwind v4: rounded-xs ~ rounded-2xl 이 읽는 CSS 변수
  '--radius-xs': '4px',
  '--radius-sm': '6px',
  '--radius-md': '8px',
  '--radius-lg': '10px',
  '--radius-xl': '12px',
  '--radius-2xl': '16px',
} as React.CSSProperties;

interface MobileFrameProps {
  children: ReactNode;
  showBottomTab?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function MobileFrame({
  children,
  showBottomTab = false,
  activeTab,
  onTabChange,
}: MobileFrameProps) {
  return (
    <div className="relative mx-auto w-[430px] flex-shrink-0">
      {/* Phone bezel */}
      <div className="relative overflow-hidden rounded-[56px] border-[12px] border-[#1c1c1e] bg-[#1c1c1e] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.35)]">
        {/* Dynamic Island */}
        <div className="pointer-events-none absolute left-1/2 top-[10px] z-50 h-[36px] w-[126px] -translate-x-1/2 rounded-full bg-[#1c1c1e]" />

        {/* Screen — radius 오버라이드 적용 */}
        <div
          className="flex h-[882px] flex-col overflow-hidden rounded-[44px] bg-[#F8FAFC]"
          style={MOBILE_RADIUS_OVERRIDE}
        >
          <StatusBar />

          {/* Scrollable content */}
          <div className="relative flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>

          {/* Bottom tab */}
          {showBottomTab && (
            <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
          )}
        </div>
      </div>
    </div>
  );
}
