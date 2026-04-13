import { Suspense } from 'react';
import { GovernanceHubScreen } from '@screens/governanceHubScreen';

function GovernancePageFallback() {
  return <div className="p-6 text-sm text-fg-subtle">Loading governance...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<GovernancePageFallback />}>
      <GovernanceHubScreen />
    </Suspense>
  );
}
