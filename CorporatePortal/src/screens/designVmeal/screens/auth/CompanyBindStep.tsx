'use client';

import { CheckCircle } from 'lucide-react';
import { MOCK_EMPLOYEE } from '../../mockData';
import { useVmealT } from '../../i18n/useVmealT';

export function CompanyBindStep() {
  const { t } = useVmealT();

  const INFO_ROWS = [
    { label: t('auth.companyBind.name'), value: MOCK_EMPLOYEE.name },
    { label: t('auth.companyBind.employeeCode'), value: MOCK_EMPLOYEE.employeeCode },
    { label: t('auth.companyBind.department'), value: MOCK_EMPLOYEE.department },
    { label: t('auth.companyBind.company'), value: MOCK_EMPLOYEE.corporateName },
  ];

  return (
    <div className="flex flex-col px-5 pt-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#3B82F6]">{t('auth.step', { current: 2, total: 4 })}</span>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-gray-200">
        <div className="h-1 w-1/2 rounded-full bg-[#3B82F6]" />
      </div>

      {/* Title */}
      <h2 className="mt-6 text-xl font-bold text-gray-900">
        {t('auth.companyBind.title')}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Kiểm tra thông tin nhân viên được liên kết
      </p>

      {/* Info card */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {INFO_ROWS.map((row) => (
            <div key={row.label}>
              <p className="text-xs text-gray-400">{row.label}</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Success badge */}
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
        <CheckCircle size={18} className="text-emerald-500" />
        <span className="text-sm font-medium text-emerald-700">
          {t('auth.companyBind.matchSuccess')}
        </span>
      </div>

      {/* Continue button */}
      <button className="mt-8 flex h-[52px] w-full items-center justify-center rounded-xl bg-[#3B82F6] text-[15px] font-semibold text-white">
        {t('common.continue')}
      </button>
    </div>
  );
}
