'use client';

import { ChevronRight } from 'lucide-react';
import { useVmealT } from '../../i18n/useVmealT';
import type { MockMealEmployee } from '../../types';

interface ProfileCardProps {
  employee: MockMealEmployee;
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ProfileCard({ employee }: ProfileCardProps) {
  const { t } = useVmealT();
  const initials = getInitials(employee.name);

  return (
    <div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white text-xl font-bold">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-gray-900 truncate">{employee.name}</p>
            <p className="text-sm text-gray-400 mt-0.5">{employee.department}</p>
            <p className="text-xs text-gray-400 mt-0.5">{employee.employeeCode}</p>
            <p className="text-xs text-gray-400 mt-0.5">{employee.corporateName}</p>
          </div>

          {/* Chevron */}
          <ChevronRight size={20} className="shrink-0 text-gray-300" />
        </div>
      </div>

      {/* Account status */}
      <div className="flex items-center gap-1.5 mt-2 px-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        <span className="text-xs text-[#10B981]">{t('settings.activeAccount')}</span>
      </div>
    </div>
  );
}
