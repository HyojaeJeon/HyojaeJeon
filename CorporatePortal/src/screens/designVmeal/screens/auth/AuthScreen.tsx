'use client';

import { useState } from 'react';
import { PhoneVerifyStep } from './PhoneVerifyStep';
import { CompanyBindStep } from './CompanyBindStep';
import { PermissionStep } from './PermissionStep';
import { useVmealT } from '../../i18n/useVmealT';

type StepKey = 'phone' | 'company' | 'permission';

const STEP_KEYS: { key: StepKey; labelKey: string }[] = [
  { key: 'phone', labelKey: 'auth.tabs.phone' },
  { key: 'company', labelKey: 'auth.tabs.info' },
  { key: 'permission', labelKey: 'auth.tabs.permission' },
];

const STEP_COMPONENTS: Record<StepKey, React.ComponentType> = {
  phone: PhoneVerifyStep,
  company: CompanyBindStep,
  permission: PermissionStep,
};

export default function AuthScreen() {
  const { t } = useVmealT();
  const [activeStep, setActiveStep] = useState<StepKey>('phone');

  const ActiveComponent = STEP_COMPONENTS[activeStep];

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC]">
      {/* Step selector tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        {STEP_KEYS.map((step) => {
          const active = step.key === activeStep;
          return (
            <button
              key={step.key}
              onClick={() => setActiveStep(step.key)}
              className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                active
                  ? 'border-b-2 border-[#3B82F6] text-[#3B82F6]'
                  : 'text-gray-400'
              }`}
            >
              {t(step.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Active step content */}
      <div className="flex-1">
        <ActiveComponent />
      </div>
    </div>
  );
}
