import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { PhoneVerifyStep } from './PhoneVerifyStep';
import { CompanyBindStep } from './CompanyBindStep';
import { PermissionStep } from './PermissionStep';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<StepKey>('phone');

  const ActiveComponent = STEP_COMPONENTS[activeStep];

  return (
    <View className="flex h-full flex-col bg-[#F8FAFC]">
      {/* Step selector tabs */}
      <View className="flex flex-row border-b border-gray-100 bg-white">
        {STEP_KEYS.map((step) => {
          const active = step.key === activeStep;
          return (
            <Pressable
              key={step.key}
              onPress={() => setActiveStep(step.key)}
              className={`flex-1 py-3 items-center ${
                active
                  ? 'border-b-2 border-[#3B82F6]'
                  : ''
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  active ? 'text-[#3B82F6]' : 'text-gray-400'
                }`}
              >
                {t(step.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Active step content */}
      <View className="flex-1">
        <ActiveComponent />
      </View>
    </View>
  );
}
