'use client';

import { ChevronLeft, Heart, UtensilsCrossed } from 'lucide-react';
import type { MockMerchant } from '../../types';

interface PhotoHeaderProps {
  merchant: MockMerchant;
}

export function PhotoHeader({ merchant }: PhotoHeaderProps) {
  return (
    <div className="relative h-[200px] w-full bg-gradient-to-br from-amber-100 to-orange-100">
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <UtensilsCrossed size={56} className="text-amber-400" />
      </div>

      {/* Restaurant name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-5 pb-4 pt-10">
        <p className="text-lg font-bold text-white drop-shadow-sm">
          {merchant.branchName}
        </p>
      </div>

      {/* Back button */}
      <button className="absolute left-4 top-4 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/90 shadow-sm">
        <ChevronLeft size={20} className="text-gray-900" />
      </button>

      {/* Heart button */}
      <button className="absolute right-4 top-4 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white/90 shadow-sm">
        <Heart size={18} className="text-gray-400" />
      </button>
    </div>
  );
}
