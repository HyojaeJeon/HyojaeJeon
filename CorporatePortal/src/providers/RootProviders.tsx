'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from './ThemeProvider';
import { ReduxProvider } from './ReduxProvider';
import { ApolloProvider } from './ApolloProvider';
import { I18nProvider } from '@i18n/I18nProvider';
import { AuthBootstrap } from '@auth/AuthBootstrap';

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ReduxProvider>
        <ApolloProvider>
          <I18nProvider>
            <AuthBootstrap />
            {children}
            <Toaster position="top-right" richColors closeButton />
          </I18nProvider>
        </ApolloProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
