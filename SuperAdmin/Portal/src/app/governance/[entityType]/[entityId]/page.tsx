import { Suspense } from 'react';
import { GovernanceDetailScreen } from '@screens/governanceDetailScreen';

function GovernanceDetailFallback() {
  return <div className="p-6 text-sm text-fg-subtle">Loading governance detail...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<GovernanceDetailFallback />}>
      <GovernanceDetailScreen />
    </Suspense>
  );
}
