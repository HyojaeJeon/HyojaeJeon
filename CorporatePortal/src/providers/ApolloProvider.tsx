'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { useMemo, type ReactNode } from 'react';
import { getApolloClient } from '@graphql/client';

export function ApolloProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => getApolloClient(), []);
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
