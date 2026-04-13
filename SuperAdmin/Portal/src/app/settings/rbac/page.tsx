import { Suspense } from 'react';
import { SettingsRbacScreen } from '@screens/settingsRbacScreen';

function SettingsRbacFallback() {
  return <div className="p-6 text-sm text-fg-subtle">Loading RBAC settings...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<SettingsRbacFallback />}>
      <SettingsRbacScreen />
    </Suspense>
  );
}
