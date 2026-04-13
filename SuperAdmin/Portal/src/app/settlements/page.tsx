import { Suspense } from 'react';
import { SettlementDashboardScreen } from '@screens/settlementDashboardScreen';

function SettlementFallback() {
  return <div className="p-6 text-sm text-fg-subtle">Loading settlement dashboard...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<SettlementFallback />}>
      <SettlementDashboardScreen />
    </Suspense>
  );
}
