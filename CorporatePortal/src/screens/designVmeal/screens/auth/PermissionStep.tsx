'use client';

import { MapPin, Bell, Fingerprint } from 'lucide-react';
import type { ReactNode } from 'react';
import { useVmealT } from '../../i18n/useVmealT';

interface PermissionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}

function PermissionCard({ icon, title, description, enabled }: PermissionCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
      {/* Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs text-gray-400 leading-tight">{description}</p>
      </div>

      {/* Toggle */}
      <div
        className={`relative h-[28px] w-[48px] flex-shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-[#3B82F6]' : 'bg-gray-200'
        }`}
      >
        <div
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'left-[23px]' : 'left-[3px]'
          }`}
        />
      </div>
    </div>
  );
}

export function PermissionStep() {
  const { t } = useVmealT();

  const PERMISSIONS = [
    {
      icon: <MapPin size={20} className="text-[#3B82F6]" />,
      title: t('auth.permission.location'),
      description: t('auth.permission.locationDesc'),
      enabled: true,
    },
    {
      icon: <Bell size={20} className="text-[#3B82F6]" />,
      title: t('auth.permission.notification'),
      description: t('auth.permission.notificationDesc'),
      enabled: true,
    },
    {
      icon: <Fingerprint size={20} className="text-[#3B82F6]" />,
      title: t('auth.permission.biometric'),
      description: t('auth.permission.biometricDesc'),
      enabled: false,
    },
  ];

  return (
    <div className="flex flex-col px-5 pt-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#3B82F6]">{t('auth.step', { current: 3, total: 4 })}</span>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-gray-200">
        <div className="h-1 w-3/4 rounded-full bg-[#3B82F6]" />
      </div>

      {/* Title */}
      <h2 className="mt-6 text-xl font-bold text-gray-900">
        {t('auth.permission.title')}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Cho phép ứng dụng truy cập để trải nghiệm tốt hơn
      </p>

      {/* Permission cards */}
      <div className="mt-6 space-y-3">
        {PERMISSIONS.map((p) => (
          <PermissionCard
            key={p.title}
            icon={p.icon}
            title={p.title}
            description={p.description}
            enabled={p.enabled}
          />
        ))}
      </div>

      {/* Continue button */}
      <button className="mt-8 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
        {t('common.continue')}
      </button>
    </div>
  );
}
