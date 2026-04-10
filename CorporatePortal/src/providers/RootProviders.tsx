'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ReduxProvider } from './ReduxProvider';
import { ApolloProvider } from './ApolloProvider';
import { I18nProvider } from '@i18n/I18nProvider';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider>
        <ApolloProvider>
          <I18nProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </I18nProvider>
        </ApolloProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
