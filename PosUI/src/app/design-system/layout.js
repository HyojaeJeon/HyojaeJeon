'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navSections = [
  {
    title: 'Overview',
    items: [
      { href: '/design-system', label: '개요' },
    ],
  },
  {
    title: 'Components',
    items: [
      { href: '/design-system/components/table-card', label: 'TableCard' },
      { href: '/design-system/components/menu-card', label: 'MenuCard' },
      { href: '/design-system/components/order-sidebar', label: 'OrderSidebar' },
      { href: '/design-system/components/takeout-bar', label: 'TakeoutBar' },
      { href: '/design-system/components/button', label: 'Button' },
      { href: '/design-system/components/input', label: 'Input' },
      { href: '/design-system/components/badge', label: 'Badge' },
    ],
  },
  {
    title: 'Screens',
    items: [
      { href: '/design-system/screens/table', label: '테이블' },
      { href: '/design-system/screens/order', label: '주문' },
      { href: '/design-system/screens/payment', label: '결제' },
    ],
  },
];

export default function DesignSystemLayout({ children }) {
  const pathname = usePathname();

  const isActive = (href) => {
    const clean = (p) => (p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p);
    return clean(pathname) === clean(href);
  };

  return (
    /* position: fixed breaks out of #pos-root's 1024x768 constraint */
    <div className="fixed inset-0 z-[9999] flex" style={{ background: '#F1F5F9' }}>
      {/* ─── Sidebar ─── */}
      <aside
        className="w-[260px] shrink-0 bg-white border-r border-gray-100 flex flex-col"
        style={{ boxShadow: '2px 0 20px rgba(0,0,0,0.03)' }}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-soft-red-500 flex items-center justify-center shadow-pos-soft">
              <span className="text-white text-sm font-black tracking-tight">H</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">Hyojung</div>
              <div className="text-[10px] text-gray-400 font-semibold tracking-[0.1em] uppercase">Design System</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em] px-3 mb-2">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center h-9 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150
                      ${isActive(item.href)
                        ? 'bg-soft-red-50 text-soft-red-500 font-semibold'
                        : 'text-gray-500'}
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-50 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-pos-success" />
            1024 × 768 · Touch POS
          </div>
        </div>
      </aside>

      {/* ─── Preview Area ─── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {/* Label */}
        <div className="absolute top-5 left-8 flex items-center gap-3">
          <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">Preview</span>
          <span className="text-[11px] text-gray-300">1024 × 768</span>
        </div>

        {/* 1024x768 Frame */}
        <main
          className="bg-white rounded-2xl overflow-hidden relative shrink-0"
          style={{
            width: 1024,
            height: 768,
            boxShadow: '0 4px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
