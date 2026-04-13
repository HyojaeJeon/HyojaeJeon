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
import { toast } from 'sonner';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWsClient } from 'graphql-ws';
import {
  getAccessToken,
  refreshSessionWithOutcome,
  handleAuthFailure,
} from '@auth/session';

const HTTP_URL = process.env.NEXT_PUBLIC_CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql';
const WS_URL = process.env.NEXT_PUBLIC_CENTRAL_API_WS ?? 'ws://localhost:4000/graphql';

/** GraphQL 이 아닌 REST 엔드포인트 base URL (health check 등) */
export function getRestBaseUrl(): string {
  return HTTP_URL.replace(/\/graphql$/, '');
}

function isSessionOperation(operationName?: string): boolean {
  return (
    operationName === 'PortalLogin' ||
    operationName === 'PortalRefreshSession' ||
    operationName === 'PortalLogout'
  );
}

function getClientLocale(): string {
  if (typeof window === 'undefined') return 'ko';
  return window.localStorage.getItem('superadmin-portal.locale') || 'ko';
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

        // Guard: 이미 refresh+retry 한 operation이면 무한 루프 방지 → 즉시 에러 전파
        const context = operation.getContext();
        if (context[REFRESH_RETRIED_KEY]) {
          // 이미 1회 retry 했는데 또 UNAUTHENTICATED → 세션 완전 만료
          handleAuthFailure();
          return;
        }

        // Mark this operation as retried
        operation.setContext({ ...context, [REFRESH_RETRIED_KEY]: true });

        return new Observable<FetchResult>((observer) => {
          refreshSessionWithOutcome().then((outcome) => {
            switch (outcome.kind) {
              case 'renewed':
                // Retry ONCE — cookies are updated automatically
                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });
                break;
              case 'auth_expired':
                handleAuthFailure();
                observer.error(err);
                break;
              case 'server_error':
                // 서버 에러 (500, rate limit 등) → 로그아웃하지 않고 에러만 전파
                observer.error(err);
                break;
            }
          });
        });
      }

      console.error('[GraphQL error]', err.message, err.path);
      if (typeof window !== 'undefined') {
        toast.error(`[${operation.operationName}] ${err.message}`, { duration: 5000 });
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
    // SSR: per-request client
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
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            auditLogConnection: {
              keyArgs: ['filter'],
              merge(existing, incoming) {
                if (!existing) return incoming;
                return {
                  ...incoming,
                  edges: [...(existing.edges ?? []), ...(incoming.edges ?? [])],
                };
              },
            },
          },
        },
      },
    }),
    link: from([errorLink, authLink, splitLink]),
    devtools: { enabled: process.env.NODE_ENV !== 'production' },
  });
  return browserClient;
}
