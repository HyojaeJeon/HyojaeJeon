'use client';

interface Option {
  id: string;
  name: string;
  price?: number;
}

interface OptionGroup {
  name: string;
  required?: boolean;
  options: Option[];
}

interface OptionSelectorProps {
  groups: OptionGroup[];
  selected: Record<string, string[]>;
  onChange: (selected: Record<string, string[]>) => void;
}

/**
 * OptionSelector -- 메뉴 옵션 선택기
 *
 * 옵션 그룹별로 선택지를 나열한다.
 * 필수 그룹은 (필수) 표시. 선택된 옵션은 primary 색상으로 강조한다.
 */
export default function OptionSelector({
  groups,
  selected,
  onChange,
}: OptionSelectorProps) {
  const handleToggle = (groupName: string, optionId: string) => {
    const current = selected[groupName] || [];
    const exists = current.includes(optionId);
    const updated = exists
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];

    onChange({ ...selected, [groupName]: updated });
  };

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const groupSelected = selected[group.name] || [];
        return (
          <div key={group.name} className="flex flex-col gap-2">
            {/* 그룹 헤더 */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-pos-text">{group.name}</span>
              {group.required && (
                <span className="text-2xs font-semibold text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded-pos-full">
                  필수
                </span>
              )}
            </div>

            {/* 옵션 목록 */}
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const isSelected = groupSelected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggle(group.name, option.id)}
                    className={`
                      h-touch px-3 rounded-pos-btn
                      text-xs font-semibold
                      transition-transform duration-fast ease-default
                      select-none cursor-pointer
                      active:scale-[0.95]
                      ${isSelected
                        ? 'bg-primary-500 text-pos-text-inverse shadow-pos-soft'
                        : 'bg-pos-surface text-pos-text border border-pos-border'}
                    `}
                  >
                    <span>{option.name}</span>
                    {option.price != null && option.price > 0 && (
                      <span className={`ml-1 tabular-nums ${isSelected ? 'text-white/70' : 'text-pos-text-muted'}`}>
                        +{option.price.toLocaleString('ko-KR')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
