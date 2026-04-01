'use client';

export default function TakeoutBar({ activeTab, onTabSelect, counts = {} }) {
  const tabs = [
    { id: 'hall', label: '홀' },
    { id: 'takeout', label: '포장', count: counts.takeout },
    { id: 'delivery', label: '배달', count: counts.delivery },
  ];

  return (
    <div className="w-full h-14 bg-white border-t border-gray-100 flex items-center px-5 gap-3 shrink-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabSelect(tab.id)}
            className={`
              flex items-center justify-center gap-2 h-10 px-5 rounded-xl
              text-sm font-semibold transition-transform duration-150 cursor-pointer select-none
              active:scale-[0.97]
              ${isActive
                ? 'bg-soft-red-500 text-white shadow-pos-soft'
                : 'bg-gray-50 text-gray-500'}
            `}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span className={`text-[11px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
