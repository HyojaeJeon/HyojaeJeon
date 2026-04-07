import type { ReactNode } from 'react';

export default function ConnectedFlowLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[10000] h-screen w-screen overflow-auto bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.97),rgba(15,23,42,1)_58%)] text-white shadow-[0_0_0_9999px_rgba(15,23,42,0.96)]">
      <div className="min-h-full w-full">{children}</div>
    </div>
  );
}
