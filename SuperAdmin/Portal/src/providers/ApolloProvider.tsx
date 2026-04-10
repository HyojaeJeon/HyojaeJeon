'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { useMemo, type ReactNode } from 'react';
import { getApolloClient } from '@graphql/client';

export function ApolloProvider({ children }: { children: ReactNode }) {
  // React Compiler로 대체 불가: Apollo Client 는 참조 동일성이 중요 (ApolloProvider context)
  const client = useMemo(() => getApolloClient(), []);
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
