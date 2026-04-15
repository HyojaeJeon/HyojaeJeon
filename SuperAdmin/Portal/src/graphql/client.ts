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
 *
 * Logout-triggering conditions (exhaustive):
 *   1. UNAUTHENTICATED / SESSION_REVOKED on a session operation → immediate logout
 *   2. UNAUTHENTICATED / SESSION_REVOKED on a normal operation + refresh fails with auth_expired → logout
 *
 * Everything else (500, VALIDATION_ERROR, INTERNAL_SERVER_ERROR, network errors, etc.)
 * is NEVER a reason to logout. These are operational errors, not identity errors.
 */
const REFRESH_RETRIED_KEY = '__refreshRetried';

/** Only these extension codes are genuine identity/session errors that may warrant logout. */
const IDENTITY_ERROR_CODES = new Set(['UNAUTHENTICATED', 'SESSION_REVOKED']);

function isIdentityError(code: string | undefined): boolean {
  return !!code && IDENTITY_ERROR_CODES.has(code);
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    // Find the first identity error (if any) — ignore all others for auth purposes
    const identityErr = graphQLErrors.find((e) =>
      isIdentityError(e.extensions?.code as string | undefined),
    );

    if (identityErr) {
      const code = identityErr.extensions?.code as string;

      // Session operations (login/refresh/logout) should never retry
      if (isSessionOperation(operation.operationName)) {
        handleAuthFailure();
        return;
      }

      // Guard: already retried once → session truly expired
      const context = operation.getContext();
      if (context[REFRESH_RETRIED_KEY]) {
        handleAuthFailure();
        return;
      }

      operation.setContext({ ...context, [REFRESH_RETRIED_KEY]: true });

      return new Observable<FetchResult>((observer) => {
        refreshSessionWithOutcome().then((outcome) => {
          switch (outcome.kind) {
            case 'renewed':
              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
              break;
            case 'auth_expired':
              handleAuthFailure();
              observer.error(identityErr);
              break;
            case 'server_error':
              // Refresh failed due to server issue — propagate original error, do NOT logout
              observer.error(identityErr);
              break;
          }
        });
      });
    }

    // Non-identity errors → toast only, never logout
    for (const err of graphQLErrors) {
      const errCode = err.extensions?.code as string | undefined;
      console.error(`[GraphQL error] ${errCode ?? 'UNKNOWN'}: ${err.message}`, err.path);
      if (typeof window !== 'undefined') {
        toast.error(`[${operation.operationName}] ${err.message}`, { duration: 5000 });
      }
    }
  }

  if (networkError) {
    // Network errors (timeout, DNS, CORS, etc.) are NEVER logout triggers
    console.error('[Network error]', networkError);
    if (typeof window !== 'undefined') {
      toast.error(`Network error: ${networkError.message}`, { duration: 5000 });
    }
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
