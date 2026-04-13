'use client';

import { Star, MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMerchant } from '../../types';

interface InfoSectionProps {
  merchant: MockMerchant;
}

export function InfoSection({ merchant }: InfoSectionProps) {
  const { t } = useVmealT();
  return (
    <div className="space-y-3 px-5 pt-4">
      {/* Name */}
      <h2 className="text-xl font-bold text-gray-900">{merchant.branchName}</h2>

      {/* Rating row */}
      <div className="flex items-center gap-1.5 text-sm">
        <Star size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
        <span className="font-medium text-gray-900">{merchant.rating}</span>
        <span className="text-gray-400">
          ({merchant.reviewCount} {t('merchant.rating')})
        </span>
        <span className="text-gray-300">&middot;</span>
        <span className="text-gray-600">{merchant.cuisineType}</span>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2.5">
        <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
        <p className="text-sm text-gray-600">{merchant.address}</p>
      </div>

      {/* Hours */}
      <div className="flex items-center gap-2.5">
        <Clock size={16} className="flex-shrink-0 text-gray-400" />
        <p className="text-sm text-gray-600">{merchant.operatingHours}</p>
        {merchant.isOpen ? (
          <span className="rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[11px] font-medium text-[#10B981]">
            {t('merchant.open')}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-400">
            {t('merchant.closed')}
          </span>
        )}
      </div>

      {/* Phone */}
      <div className="flex items-center gap-2.5">
        <Phone size={16} className="flex-shrink-0 text-gray-400" />
        <p className="text-sm text-gray-600">{merchant.phone}</p>
      </div>

      {/* Distance */}
      <div className="flex items-center gap-2.5">
        <Navigation size={16} className="flex-shrink-0 text-gray-400" />
        <p className="text-sm text-gray-600">{merchant.distanceKm} km</p>
      </div>
    </div>
  );
}
