'use client';

import {
  Shield,
  CreditCard,
  Wallet,
  Bell,
  Globe,
  Fingerprint,
  HelpCircle,
  Info,
  LogOut,
} from 'lucide-react';
import { MOCK_EMPLOYEE } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';
import { ProfileCard } from './ProfileCard';
import { MenuSection } from './MenuSection';
import type { MenuItem } from './MenuSection';

export default function SettingsScreen() {
  const { t } = useVmealT();

  const mealTicketItems: MenuItem[] = [
    { label: t('settings.policyView'), icon: Shield },
    { label: t('settings.badgeLink'), icon: CreditCard, badge: 'RFID-****7890', badgeColor: 'gray' },
    { label: t('settings.eWallet'), icon: Wallet, badge: t('settings.momoLinked'), badgeColor: 'green' },
  ];

  const appSettingItems: MenuItem[] = [
    { label: t('settings.notification'), icon: Bell, toggle: true },
    { label: t('settings.language'), icon: Globe, badge: t('settings.languageVi'), badgeColor: 'gray' },
    { label: t('settings.biometric'), icon: Fingerprint, toggle: true },
  ];

  const otherItems: MenuItem[] = [
    { label: t('settings.support'), icon: HelpCircle },
    { label: t('settings.appInfo'), icon: Info },
  ];

  return (
    <div className="flex flex-col bg-[#F8FAFC] px-5 pt-2 pb-6">
      {/* Title */}
      <p className="text-lg font-bold text-gray-900 py-3">{t('settings.appSettings')}</p>

      <div className="space-y-5">
        {/* Profile card */}
        <ProfileCard employee={MOCK_EMPLOYEE} />

        {/* Menu sections */}
        <MenuSection title={t('settings.mealManagement')} items={mealTicketItems} />
        <MenuSection title={t('settings.appSettings')} items={appSettingItems} />
        <MenuSection title={t('settings.other')} items={otherItems} />

        {/* Logout */}
        <div className="mt-6 flex flex-col items-center">
          <button className="flex items-center gap-2 text-[15px] font-medium text-[#EF4444]">
            <LogOut size={18} />
            {t('settings.logout')}
          </button>
          <p className="mt-2 text-xs text-gray-300">{t('settings.version', { ver: '1.0.0', build: '100' })}</p>
        </div>
      </div>
    </div>
  );
}
