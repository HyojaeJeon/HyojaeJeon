import { createHash } from 'node:crypto';
import {
  defaultPersistedQueryAllowListPaths,
  loadPersistedQueryAllowList,
  validatePersistedQueryRequest,
} from './persisted-query-allow-list';

describe('persisted-query-allow-list', () => {
  const knownQuery = 'query Ping { ping }';
  const knownHash = createHash('sha256').update(knownQuery).digest('hex');

  it('returns disabled state when feature flag is off', () => {
    const state = loadPersistedQueryAllowList({
      enabled: false,
      requirePersistedQueries: false,
    });

    expect(state.enabled).toBe(false);
    expect(state.hashes.size).toBe(0);
  });

  it('loads generated manifest from source path', () => {
    const state = loadPersistedQueryAllowList({
      enabled: true,
      requirePersistedQueries: true,
      searchPaths: defaultPersistedQueryAllowListPaths(
        '/Users/hyojae/projects/Platform/SuperAdmin/CentralApi',
      ),
    });

    expect(state.enabled).toBe(true);
    expect(state.manifestPath).toContain('persisted-query-allow-list.generated.json');
    expect(state.hashes.size).toBeGreaterThan(0);
  });

  it('rejects requests without persisted query when required', () => {
    expect(() =>
      validatePersistedQueryRequest(
        {
          enabled: true,
          requirePersistedQueries: true,
          hashes: new Set([knownHash]),
        },
        {
          operationName: 'Ping',
        },
      ),
    ).toThrow('Persisted query extension is required');
  });

  it('rejects hashes that are not in the allow-list', () => {
    expect(() =>
      validatePersistedQueryRequest(
        {
          enabled: true,
          requirePersistedQueries: true,
          hashes: new Set([knownHash]),
        },
        {
          operationName: 'Ping',
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash: 'not-allowed',
            },
          },
        },
      ),
    ).toThrow('Persisted query is not allow-listed');
  });

  it('rejects when the provided query does not match the given hash', () => {
    expect(() =>
      validatePersistedQueryRequest(
        {
          enabled: true,
          requirePersistedQueries: true,
          hashes: new Set([knownHash]),
        },
        {
          operationName: 'Ping',
          query: 'query Ping { pong }',
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash: knownHash,
            },
          },
        },
      ),
    ).toThrow('Persisted query hash mismatch');
  });

  it('accepts allow-listed query + hash pairs', () => {
    expect(() =>
      validatePersistedQueryRequest(
        {
          enabled: true,
          requirePersistedQueries: true,
          hashes: new Set([knownHash]),
        },
        {
          operationName: 'Ping',
          query: knownQuery,
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash: knownHash,
            },
          },
        },
      ),
    ).not.toThrow();
  });
});
