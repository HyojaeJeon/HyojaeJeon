'use client';

interface Floor {
  id: string;
  name: string;
}

interface FloorSelectorProps {
  floors: Floor[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function FloorSelector({ floors, activeId, onSelect }: FloorSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 shrink-0">
      {floors.map((floor) => {
        const isActive = activeId === floor.id;
        return (
          <button
            key={floor.id}
            type="button"
            onClick={() => onSelect(floor.id)}
            className={`
              h-touch-nav px-5 rounded-pos-btn text-xs font-semibold
              transition-transform duration-fast cursor-pointer select-none
              active:scale-[0.95]
              ${isActive
                ? 'bg-primary-500 text-pos-text-inverse shadow-pos-soft'
                : 'bg-pos-surface text-pos-text-secondary'}
            `}
          >
            {floor.name}
          </button>
        );
      })}
    </div>
  );
}
