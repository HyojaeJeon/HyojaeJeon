import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  split,
  type NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient as createWsClient } from 'graphql-ws';

const HTTP_URL = process.env.NEXT_PUBLIC_CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql';
const WS_URL = process.env.NEXT_PUBLIC_CENTRAL_API_WS ?? 'ws://localhost:4000/graphql';

const TOKEN_KEY = 'corporate-portal.token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

const httpLink = new HttpLink({ uri: HTTP_URL, credentials: 'include' });

const authLink = setContext((_op, { headers }) => {
  const token = getAuthToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error('[GraphQL error]', err.message, err.path);
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
        const token = getAuthToken();
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
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            mealEmployeesByCorporate: {
              keyArgs: ['corporateId', 'filter'],
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
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-first' },
      query: { fetchPolicy: 'cache-first' },
    },
    devtools: { enabled: process.env.NODE_ENV !== 'production' },
  });
  return browserClient;
}
