import { Kind } from 'graphql';
import {
  createGraphqlRateLimitPlugin,
  extractRefreshSessionId,
  extractRootFieldNames,
} from './RateLimit.plugin';

function makeOperation(...fieldNames: string[]) {
  return {
    selectionSet: {
      selections: fieldNames.map((fieldName) => ({
        kind: Kind.FIELD,
        name: { value: fieldName },
      })),
    },
  };
}

describe('RateLimit.plugin', () => {
  const config = {
    userPerMinute: 600,
    ipPerMinute: 120,
    sessionPerMinute: 240,
    windowSeconds: 60,
  };

  it('extracts GraphQL root field names from the resolved operation', () => {
    expect(extractRootFieldNames(makeOperation('refreshSession', 'me') as never)).toEqual([
      'refreshSession',
      'me',
    ]);
  });

  it('extracts the stable refresh-session id from the rotating cookie token', () => {
    expect(extractRefreshSessionId('session-123.secret-456')).toBe('session-123');
    expect(extractRefreshSessionId('invalid-token')).toBeNull();
  });

  it('uses the session bucket for refreshSession when a refresh cookie is present', async () => {
    const redis = {
      consumeRateLimit: jest.fn().mockResolvedValue({ allowed: true, count: 1 }),
    };
    const plugin = createGraphqlRateLimitPlugin(redis as never, config);
    const lifecycle = await plugin.requestDidStart?.({} as never);

    await lifecycle?.didResolveOperation?.({
      operationName: 'PortalRefreshSession',
      operation: makeOperation('refreshSession'),
      contextValue: {
        req: {
          cookies: {
            refresh_token: 'session-abc.secret-xyz',
          },
          headers: {
            'x-forwarded-for': '203.0.113.10',
          },
        },
      },
    } as never);

    expect(redis.consumeRateLimit).toHaveBeenCalledWith('gql:rl:session:session-abc', 240, 60);
  });

  it('falls back to the IP bucket for refreshSession when the refresh cookie is missing', async () => {
    const redis = {
      consumeRateLimit: jest.fn().mockResolvedValue({ allowed: true, count: 1 }),
    };
    const plugin = createGraphqlRateLimitPlugin(redis as never, config);
    const lifecycle = await plugin.requestDidStart?.({} as never);

    await lifecycle?.didResolveOperation?.({
      operationName: 'PortalRefreshSession',
      operation: makeOperation('refreshSession'),
      contextValue: {
        req: {
          headers: {
            'x-forwarded-for': '203.0.113.20',
          },
        },
      },
    } as never);

    expect(redis.consumeRateLimit).toHaveBeenCalledWith('gql:rl:ip:203.0.113.20', 120, 60);
  });

  it('uses the authenticated user bucket for protected operations', async () => {
    const redis = {
      consumeRateLimit: jest.fn().mockResolvedValue({ allowed: true, count: 1 }),
    };
    const plugin = createGraphqlRateLimitPlugin(redis as never, config);
    const lifecycle = await plugin.requestDidStart?.({} as never);

    await lifecycle?.didResolveOperation?.({
      operationName: 'AuditLogList',
      operation: makeOperation('auditLogConnection'),
      contextValue: {
        req: {
          user: {
            userType: 'SUPER_ADMIN',
            userId: 'user-1',
          },
          headers: {
            'x-forwarded-for': '203.0.113.30',
          },
        },
      },
    } as never);

    expect(redis.consumeRateLimit).toHaveBeenCalledWith(
      'gql:rl:user:SUPER_ADMIN:user-1',
      600,
      60,
    );
  });
});
