'use client';

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/**
 * EmployeeSelector -- 직원 선택 그리드
 *
 * 직원 이름 버튼을 그리드로 배치한다.
 * 선택된 직원은 bg-primary-500으로 강조한다.
 */
export default function EmployeeSelector({
  employees,
  selectedId,
  onSelect,
}: EmployeeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {employees.map((emp) => {
        const isActive = selectedId === emp.id;
        return (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelect(emp.id)}
            className={`
              flex flex-col items-center justify-center gap-0.5
              h-touch-xl rounded-pos-btn
              font-semibold
              transition-transform duration-fast ease-default
              select-none cursor-pointer
              active:scale-[0.95]
              ${isActive
                ? 'bg-primary-500 text-pos-text-inverse shadow-pos-soft'
                : 'bg-pos-surface text-pos-text'}
            `}
          >
            <span className="text-md font-bold">{emp.name}</span>
            <span className={`text-2xs ${isActive ? 'text-white/70' : 'text-pos-text-muted'}`}>
              {emp.role}
            </span>
          </button>
        );
      })}
    </div>
  );
}
