'use client';

interface MenuData {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  isSoldOut?: boolean;
  [key: string]: unknown;
}

interface MenuCardProps {
  menu: MenuData;
  onAdd: (id: string) => void;
  /** compact: 이미지 없이 이름+가격만 (POS 주문 그리드용) */
  compact?: boolean;
}

export default function MenuCard({ menu, onAdd, compact = false }: MenuCardProps) {
  const { id, name, price, imageUrl, isSoldOut } = menu;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => !isSoldOut && onAdd(id)}
        disabled={isSoldOut}
        className={`
          w-full h-full bg-pos-bg shadow-pos-card rounded-xl flex flex-col items-center justify-center
          gap-0.5 px-1.5 py-1 text-center select-none
          [&>*]:pointer-events-none
          ${isSoldOut
            ? 'opacity-40 cursor-not-allowed'
            : 'cursor-pointer active:bg-primary-50'}
        `}
      >
        <span className="text-[11px] font-semibold text-pos-text leading-[1.15] line-clamp-2 w-full">{name}</span>
        <span className="text-[10px] font-bold text-primary-500 tabular-nums">{price.toLocaleString()}</span>
        {isSoldOut && <span className="text-[9px] text-pos-error font-bold">품절</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !isSoldOut && onAdd(id)}
      disabled={isSoldOut}
      className={`
        relative w-full h-full overflow-hidden text-left
        transition-transform duration-normal flex flex-col select-none
        ${isSoldOut
          ? 'opacity-40 cursor-not-allowed'
          : 'active:scale-[0.96] cursor-pointer'}
      `}
    >
      {/* Image Area */}
      <div className="relative overflow-hidden bg-gray-100 shrink-0 w-full" style={{ aspectRatio: '1/1' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-gray-300">
              <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 22l6-6 4 4 6-8 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/40 backdrop-blur-sm">
          <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">{name}</p>
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full">품절</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex-1 min-h-0 bg-white px-2 flex items-center justify-end">
        <span className="text-[11px] font-bold text-primary-500 tabular-nums">{price.toLocaleString()}</span>
      </div>
    </button>
  );
}
