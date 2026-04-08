import { ApolloServerPlugin } from '@apollo/server';
import {
  PersistedQueryAllowListState,
  validatePersistedQueryRequest,
} from './persisted-query-allow-list';

export function createPersistedQueryAllowListPlugin(
  state: PersistedQueryAllowListState,
): ApolloServerPlugin {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          validatePersistedQueryRequest(state, {
            query: requestContext.request.query,
            operationName: requestContext.request.operationName,
            extensions: requestContext.request.extensions as {
              persistedQuery?: {
                version?: number;
                sha256Hash?: string;
              };
            },
          });
        },
      };
    },
  };
}
