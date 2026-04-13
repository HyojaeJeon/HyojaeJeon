import { HeaderMap } from '@apollo/server';
import {
  createGraphqlCookiePlugin,
  decodeQueuedCookiesHeader,
  GRAPHQL_COOKIE_BATCH_HEADER,
} from './GraphqlCookie.plugin';

describe('GraphqlCookie.plugin', () => {
  it('stores queued cookies in the batch header when Fastify reply is available', async () => {
    const plugin = createGraphqlCookiePlugin();
    const lifecycle = await plugin.requestDidStart?.({} as never);
    const headers = new HeaderMap();

    await lifecycle?.willSendResponse?.({
      contextValue: {
        responseCookies: ['first=1; Path=/graphql', 'second=2; Path=/graphql'],
        reply: {
          raw: {
            setHeader: jest.fn(),
          },
        },
      },
      response: {
        http: {
          headers,
        },
      },
    } as never);

    expect(decodeQueuedCookiesHeader(headers.get(GRAPHQL_COOKIE_BATCH_HEADER))).toEqual([
      'first=1; Path=/graphql',
      'second=2; Path=/graphql',
    ]);
    expect(headers.has('set-cookie')).toBe(false);
  });

  it('falls back to the last cookie in the GraphQL response headers when reply.raw is unavailable', async () => {
    const plugin = createGraphqlCookiePlugin();
    const lifecycle = await plugin.requestDidStart?.({} as never);
    const headers = new HeaderMap();

    await lifecycle?.willSendResponse?.({
      contextValue: {
        responseCookies: ['first=1; Path=/graphql', 'second=2; Path=/graphql'],
      },
      response: {
        http: {
          headers,
        },
      },
    } as never);

    expect(headers.get('set-cookie')).toBe('second=2; Path=/graphql');
    expect(decodeQueuedCookiesHeader(headers.get(GRAPHQL_COOKIE_BATCH_HEADER))).toEqual([
      'first=1; Path=/graphql',
      'second=2; Path=/graphql',
    ]);
  });

  it('stores queued cookies in the batch header when req.raw.res is available', async () => {
    const plugin = createGraphqlCookiePlugin();
    const lifecycle = await plugin.requestDidStart?.({} as never);
    const headers = new HeaderMap();

    await lifecycle?.willSendResponse?.({
      contextValue: {
        responseCookies: ['first=1; Path=/graphql', 'second=2; Path=/graphql'],
        req: {
          raw: {
            res: { setHeader: jest.fn() },
          },
        },
      },
      response: {
        http: {
          headers,
        },
      },
    } as never);

    expect(decodeQueuedCookiesHeader(headers.get(GRAPHQL_COOKIE_BATCH_HEADER))).toEqual([
      'first=1; Path=/graphql',
      'second=2; Path=/graphql',
    ]);
    expect(headers.has('set-cookie')).toBe(false);
  });

  it('does nothing when no cookies are queued', async () => {
    const plugin = createGraphqlCookiePlugin();
    const lifecycle = await plugin.requestDidStart?.({} as never);
    const headers = new HeaderMap();

    await lifecycle?.willSendResponse?.({
      contextValue: {
        responseCookies: [],
      },
      response: {
        http: {
          headers,
        },
      },
    } as never);

    expect(headers.has('set-cookie')).toBe(false);
  });
});
