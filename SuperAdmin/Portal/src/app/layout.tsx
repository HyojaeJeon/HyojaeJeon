import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootProviders } from '@providers/RootProviders';
import { AppShell } from '@shared/layout';
import { getMessages, DEFAULT_LOCALE } from '@i18n/messages';
import '@styles/globals.css';

export function generateMetadata(): Metadata {
  // 서버 렌더 시점에는 default locale 을 사용한다. 클라이언트 전환은 document.title 로 동기화된다.
  const messages = getMessages(DEFAULT_LOCALE);
  return {
    title: messages.app.metaTitle,
    description: messages.app.metaDescription,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body>
        <RootProviders>
          <AppShell>{children}</AppShell>
        </RootProviders>
      </body>
    </html>
  );
}
