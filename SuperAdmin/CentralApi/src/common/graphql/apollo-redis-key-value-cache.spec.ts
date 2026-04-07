import { ApolloRedisKeyValueCache } from './apollo-redis-key-value-cache';

describe('ApolloRedisKeyValueCache', () => {
  it('uses Redis when available and forwards TTL values', async () => {
    const redisService = {
      isEnabled: () => true,
      get: jest.fn().mockResolvedValue('cached-value'),
      set: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(1),
    };

    const cache = new ApolloRedisKeyValueCache(redisService as never, 'apq:');

    await cache.set('query-hash', 'document', { ttl: 60 });
    const value = await cache.get('query-hash');
    const deleted = await cache.delete('query-hash');

    expect(redisService.set).toHaveBeenCalledWith('apq:query-hash', 'document', 60);
    expect(redisService.get).toHaveBeenCalledWith('apq:query-hash');
    expect(redisService.del).toHaveBeenCalledWith('apq:query-hash');
    expect(value).toBe('cached-value');
    expect(deleted).toBe(true);
  });

  it('falls back to in-memory storage when Redis is disabled', async () => {
    const redisService = {
      isEnabled: () => false,
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const cache = new ApolloRedisKeyValueCache(redisService as never, 'apq:');

    await cache.set('query-hash', 'document', { ttl: 60 });
    const value = await cache.get('query-hash');

    expect(redisService.get).not.toHaveBeenCalled();
    expect(value).toBe('document');
  });
});
