import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  split,
  Observable,
  type NormalizedCacheObject,
  type FetchResult,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWsClient } from 'graphql-ws';
import {
  getAccessToken,
  refreshSession,
  handleAuthFailure,
  isAuthError,
} from '@auth/session';

const HTTP_URL = process.env.NEXT_PUBLIC_CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql';
const WS_URL = process.env.NEXT_PUBLIC_CENTRAL_API_WS ?? 'ws://localhost:4000/graphql';

function isSessionOperation(operationName?: string): boolean {
  return (
    operationName === 'CorporateLogin' ||
    operationName === 'CorporateRefreshSession' ||
    operationName === 'CorporateLogout'
  );
}

function getClientLocale(): string {
  if (typeof window === 'undefined') return 'ko';
  return window.localStorage.getItem('corporate-portal.locale') || 'ko';
}

const httpLink = new HttpLink({ uri: HTTP_URL, credentials: 'include' });

/**
 * Auth link: HttpOnly cookie handles authentication automatically via credentials: 'include'.
 * No Bearer token injection needed for HTTP requests. Only sets accept-language header.
 */
const authLink = setContext(async (_operation, { headers }) => ({
  headers: {
    ...headers,
    'accept-language': getClientLocale(),
  },
}));

/**
 * Error link: UNAUTHENTICATED/SESSION_REVOKED triggers session refresh + retry.
 * - Session operations (login/refresh/logout) are not retried
 * - Each operation is retried at most ONCE to prevent infinite refresh loops
 * - Cookie-based: refresh sets new cookies server-side, no header update needed on retry
 * - Network errors are logged only — never trigger logout
 * - Server 500 / rate limit errors — never trigger logout
 */
const REFRESH_RETRIED_KEY = '__refreshRetried';

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const code = err.extensions?.code as string | undefined;

      if (code === 'UNAUTHENTICATED' || code === 'SESSION_REVOKED') {
        if (isSessionOperation(operation.operationName)) {
          handleAuthFailure();
          return;
        }

        // Guard: 이미 refresh+retry 한 operation이면 무한 루프 방지
        const context = operation.getContext();
        if (context[REFRESH_RETRIED_KEY]) {
          handleAuthFailure();
          return;
        }
        operation.setContext({ ...context, [REFRESH_RETRIED_KEY]: true });

        return new Observable<FetchResult>((observer) => {
          refreshSession()
            .then((payload) => {
              if (!payload) {
                observer.error(err);
                return;
              }

              // Retry ONCE — cookies are updated automatically
              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
            })
            .catch((refreshErr: unknown) => {
              if (isAuthError(refreshErr)) {
                handleAuthFailure();
              }
              observer.error(err);
            });
        });
      }
    }
  }

  if (networkError) {
    console.error('[Network error]', networkError);
  }
});

function makeWsLink(): GraphQLWsLink | null {
  if (typeof window === 'undefined') return null;
  return new GraphQLWsLink(
    createWsClient({
      url: WS_URL,
      connectionParams: () => {
        const token = getAccessToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      lazy: true,
      retryAttempts: 10,
    }),
  );
}

let browserClient: ApolloClient<NormalizedCacheObject> | null = null;

export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (typeof window === 'undefined') {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: from([errorLink, authLink, httpLink]),
      ssrMode: true,
    });
  }
  if (browserClient) return browserClient;

  const wsLink = makeWsLink();
  const splitLink = wsLink
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return def.kind === 'OperationDefinition' && def.operation === 'subscription';
        },
        wsLink,
        httpLink,
      )
    : httpLink;

  browserClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([errorLink, authLink, splitLink]),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
      query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    },
    devtools: { enabled: process.env.NODE_ENV !== 'production' },
  });
  return browserClient;
}
