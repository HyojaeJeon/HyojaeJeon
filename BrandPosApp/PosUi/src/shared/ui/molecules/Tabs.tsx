'use client';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Tabs -- 탭 네비게이션
 *
 * 수평 탭 바. 활성 탭은 primary-500, 비활성은 gray-100.
 */
export default function Tabs({
  tabs,
  activeId,
  onSelect,
}: TabsProps) {
  return (
    <div className="flex items-center gap-1.5 w-full overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`
              h-touch px-5
              flex items-center justify-center
              rounded-pos-btn
              text-md font-semibold
              transition-transform duration-fast ease-default
              select-none cursor-pointer shrink-0
              active:scale-[0.97]
              ${isActive
                ? 'bg-primary-500 text-white shadow-pos-soft'
                : 'bg-pos-surface text-pos-text-secondary active:bg-gray-200'}
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
