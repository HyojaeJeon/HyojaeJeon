'use client';

/**
 * MenuCard — HDS Organism
 *
 * 이미지 하단에 frosted glass 오버레이로 메뉴명 표시 (최대 2줄).
 * 가격은 이미지 아래 별도 영역. 언어는 설정 기반 단일 표시 (name 필드 사용).
 * 5x4 그리드 셀 내에서 w-full h-full로 사용.
 */
export default function MenuCard({ menu, onAdd }) {
  const { id, name, price, imageUrl, isSoldOut } = menu;

  return (
    <button
      type="button"
      onClick={() => !isSoldOut && onAdd(id)}
      disabled={isSoldOut}
      className={`
        relative w-full h-full rounded-xl overflow-hidden text-left
        transition-transform duration-150 flex flex-col select-none
        ${isSoldOut
          ? 'opacity-50 cursor-not-allowed'
          : 'active:scale-[0.96] cursor-pointer'}
      `}
    >
      {/* ─── Image Area 1:1 + Frosted Glass Name Overlay ─── */}
      <div className="relative overflow-hidden bg-gray-200 rounded-t-xl shrink-0 w-full" style={{ aspectRatio: '1/1' }}>
        {/* Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-gray-400">
              <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 22l6-6 4 4 6-8 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Frosted glass overlay — menu name at image bottom, always 2-line height */}
        <div
          className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-end"
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            minHeight: 38,
          }}
        >
          <p
            className="text-[11px] font-bold text-white leading-[1.3] line-clamp-2 break-keep w-full"
            style={{ minHeight: '2.6em' }}
          >
            {name}
          </p>
        </div>

        {/* Sold-out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white bg-black/50 px-3 py-1 rounded-full" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
              품절
            </span>
          </div>
        )}
      </div>

      {/* ─── Price (below image, fills remaining) ─── */}
      <div className="flex-1 min-h-0 bg-white px-2 flex items-center justify-end rounded-b-xl border-t border-gray-100">
        <span className="text-[11px] font-bold text-soft-red-500 tabular-nums">
          {price.toLocaleString()}₫
        </span>
      </div>
    </button>
  );
}
