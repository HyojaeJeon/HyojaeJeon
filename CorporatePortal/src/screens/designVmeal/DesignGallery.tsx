'use client';

import Link from 'next/link';
import {
  Smartphone,
  Wallet,
  UtensilsCrossed,
  MapPin,
  Receipt,
  UserCircle,
} from 'lucide-react';
import { SCREEN_LIST } from './mockData';

const CATEGORY_META: Record<string, { label: string; color: string; icon: typeof Wallet }> = {
  auth: { label: 'Authentication', color: '#6366F1', icon: Smartphone },
  wallet: { label: 'Wallet & Payment', color: '#3B82F6', icon: Wallet },
  order: { label: 'Order Flow', color: '#F59E0B', icon: UtensilsCrossed },
  merchant: { label: 'Merchant & Map', color: '#10B981', icon: MapPin },
  transaction: { label: 'Transaction History', color: '#8B5CF6', icon: Receipt },
  account: { label: 'Account & Settings', color: '#64748B', icon: UserCircle },
};

const CATEGORIES = ['auth', 'wallet', 'order', 'merchant', 'transaction', 'account'];

export function DesignGallery() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]">
              <Smartphone size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">VMeal App Design System</h1>
              <p className="text-sm text-gray-400">
                18 screens &middot; B2E Meal Ticket Mobile App &middot; React Native Ready
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Grid by Category */}
      <div className="mx-auto max-w-7xl px-8 py-8 space-y-10">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const screens = SCREEN_LIST.filter((s) => s.category === cat);
          if (screens.length === 0) return null;
          const Icon = meta.icon;

          return (
            <section key={cat}>
              <div className="mb-4 flex items-center gap-2">
                <Icon size={18} style={{ color: meta.color }} />
                <h2 className="text-lg font-semibold text-white">{meta.label}</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                  {screens.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {screens.map((screen) => (
                  <Link
                    key={screen.id}
                    href={`/design/vmeal/${screen.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-lg"
                  >
                    {/* Preview placeholder */}
                    <div
                      className="mb-3 flex h-[140px] items-center justify-center rounded-xl"
                      style={{ backgroundColor: meta.color + '18' }}
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: meta.color + '30' }}
                      >
                        <Icon size={24} style={{ color: meta.color }} />
                      </div>
                    </div>

                    {/* Info */}
                    <p className="text-sm font-medium text-white">{screen.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{screen.titleVi}</p>

                    {/* Tab badge */}
                    {screen.showBottomTab && (
                      <span className="absolute right-3 top-3 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                        Tab
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
