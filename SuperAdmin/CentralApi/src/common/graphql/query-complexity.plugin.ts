import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError } from 'graphql';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';

export function createQueryComplexityPlugin(maxComplexity: number): ApolloServerPlugin {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(requestContext) {
          const complexity = getComplexity({
            schema: requestContext.schema,
            query: requestContext.document,
            variables: requestContext.request.variables,
            operationName: requestContext.request.operationName,
            estimators: [
              fieldExtensionsEstimator(),
              simpleEstimator({ defaultComplexity: 1 }),
            ],
          });

          if (complexity > maxComplexity) {
            throw new GraphQLError('Query complexity limit exceeded', {
              extensions: {
                code: 'QUERY_TOO_COMPLEX',
                complexity,
                maxComplexity,
              },
            });
          }
        },
      };
    },
  };
}
