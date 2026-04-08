import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Corporate Portal — MealTicket',
  description:
    '식권 플랫폼 B2B 고객 기업(Corporate) 전용 관리 포털. 기준서 §2.1 Corporate 계층 단독 UI 프로젝트.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
