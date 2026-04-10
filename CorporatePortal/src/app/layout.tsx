import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootProviders } from '@providers/RootProviders';
import { AppShell } from '@shared/layout';
import { getMessages, DEFAULT_LOCALE } from '@i18n/messages';
import '@styles/globals.css';

export function generateMetadata(): Metadata {
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
