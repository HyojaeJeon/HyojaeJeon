'use client';

interface CustomerData {
  name: string;
  phone: string;
  address?: string;
  points?: number;
}

interface CustomerInfoPanelProps {
  customer?: CustomerData;
  onSearch?: () => void;
  onEdit?: () => void;
}

/**
 * CustomerInfoPanel -- 고객 정보 패널
 *
 * 고객 이름, 전화번호, 주소, 적립 포인트를 표시한다.
 * 고객이 없으면 검색 안내를 보여준다.
 */
export default function CustomerInfoPanel({
  customer,
  onSearch,
  onEdit,
}: CustomerInfoPanelProps) {
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 bg-pos-surface rounded-pos-card border border-pos-border">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-pos-text-muted">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-pos-text-muted">등록된 고객 정보가 없습니다</p>
        {onSearch && (
          <button
            type="button"
            onClick={onSearch}
            className="h-touch px-4 rounded-pos-btn bg-primary-500 text-pos-text-inverse text-sm font-semibold active:bg-primary-700 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
          >
            고객 검색
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-pos-bg rounded-pos-card border border-pos-border">
      {/* 고객 이름 + 수정 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-pos-full bg-primary-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary-500">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-md font-bold text-pos-text">{customer.name}</span>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="h-9 px-3 rounded-pos-btn text-2xs font-semibold text-primary-500 bg-primary-50 active:bg-primary-100 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
          >
            수정
          </button>
        )}
      </div>

      {/* 정보 항목 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-pos-text-muted w-14 shrink-0">전화번호</span>
          <span className="text-xs font-medium text-pos-text">{customer.phone}</span>
        </div>
        {customer.address && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-pos-text-muted w-14 shrink-0">주소</span>
            <span className="text-xs font-medium text-pos-text truncate">{customer.address}</span>
          </div>
        )}
        {customer.points != null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-pos-text-muted w-14 shrink-0">적립포인트</span>
            <span className="text-xs font-bold text-primary-500 tabular-nums">
              {customer.points.toLocaleString('ko-KR')}P
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
