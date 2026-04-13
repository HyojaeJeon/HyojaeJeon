import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import Config from 'react-native-config';
import { store } from '@store/index';

const HTTP_URL = Config.CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql';
const WS_URL = Config.CENTRAL_API_WS ?? 'ws://localhost:4000/graphql';

const httpLink = createHttpLink({ uri: HTTP_URL });

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: () => {
      const token = store.getState().auth.accessToken;
      return token ? { authorization: `Bearer ${token}` } : {};
    },
    lazy: true,
    retryAttempts: 10,
  }),
);

const authLink = setContext((_, { headers }) => {
  const token = store.getState().auth.accessToken;
  const locale = store.getState().settings.locale;
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
      'accept-language': locale,
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.warn('[GraphQL Error]', err.message, err.extensions?.code);
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // TODO: trigger session refresh or logout
      }
    }
  }
  if (networkError) {
    console.warn('[Network Error]', networkError.message);
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink),
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
    query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
  },
});
