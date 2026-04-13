/**
 * 한국어: GraphQL Query Complexity plugin.
 *
 *   P0-3: estimator 순서와 기본값을 조정해 실효 방어벽을 만든다.
 *
 *   estimator 평가 순서 (graphql-query-complexity 는 첫 매칭만 채택):
 *     1) fieldExtensionsEstimator      → ObjectType @Field({ complexity }) 우선 적용
 *     2) defaultListComplexityEstimator → GraphQLList 타입이면 per-item 비용 × 가정 item 수
 *     3) simpleEstimator({ defaultComplexity: 2 }) → 나머지 스칼라/객체 필드 최소 비용
 *
 *   단일 필드 기본값 1 대신 2 를 쓰는 이유: 10 depth × 넓은 selection 쿼리가 한도를 넘기도록 함.
 *   list 필드는 최소 10 배 가중 (argument first/take 가 없을 때).
 *
 * Tiếng Việt: Plugin giới hạn độ phức tạp truy vấn GraphQL — fail-closed đối với truy vấn tốn tài nguyên.
 */
import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError, GraphQLList, GraphQLNonNull } from 'graphql';
import {
  ComplexityEstimator,
  ComplexityEstimatorArgs,
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

const DEFAULT_LIST_MULTIPLIER = 10;
const LIST_ARG_KEYS = ['first', 'take', 'limit', 'last'] as const;

/**
 * 한국어: list 형 필드에 "per-item 비용 × 실제 요청 item 수" 를 적용하는 estimator.
 *   - 필드 반환 타입이 GraphQLList 일 때만 매칭
 *   - args.first/take/limit/last 가 있으면 해당 값, 없으면 기본 10 을 곱함
 *   - childComplexity 가 0 이면 최소 1 로 clamp
 */
function defaultListComplexityEstimator(): ComplexityEstimator {
  return (args: ComplexityEstimatorArgs): number | void => {
    let unwrapped = args.field.type;
    while (unwrapped instanceof GraphQLNonNull) {
      unwrapped = unwrapped.ofType;
    }
    if (!(unwrapped instanceof GraphQLList)) {
      return; // not a list → let next estimator handle
    }

    const fieldArgs = args.args as Record<string, unknown>;
    let multiplier = DEFAULT_LIST_MULTIPLIER;
    for (const key of LIST_ARG_KEYS) {
      const value = fieldArgs[key];
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        multiplier = Math.ceil(value);
        break;
      }
    }

    const perItem = Math.max(args.childComplexity, 1);
    return perItem * multiplier;
  };
}

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
              defaultListComplexityEstimator(),
              simpleEstimator({ defaultComplexity: 2 }),
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
