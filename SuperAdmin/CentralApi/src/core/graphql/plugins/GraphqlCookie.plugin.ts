/**
 * 한국어: GraphQL 쿠키 플러그인.
 *   resolver/service 는 responseCookies 버퍼에만 쿠키를 queue 한다.
 *   실제 Set-Cookie flush 는 main.ts onSend hook 의 단일 경로에서만 수행한다.
 *   plugin 단계에서는 batch header 만 남기고, Fastify reply/raw 를 직접 수정하지 않는다.
 *   reply 가 없는 특수 테스트/비표준 경로에서는 Apollo HeaderMap 에 마지막 쿠키만
 *   best-effort 로 남긴다.
 *
 * Tiếng Việt: Plugin cookie GraphQL.
 *   Resolver/service chỉ queue cookie vào responseCookies.
 *   Flush Set-Cookie thật sự chỉ được thực hiện tại onSend hook trong main.ts.
 */
import type { ApolloServerPlugin } from '@apollo/server';

export const GRAPHQL_COOKIE_BATCH_HEADER = 'x-graphql-set-cookie-batch';

interface CookieReplyContext {
  responseCookies?: string[];
  reply?: {
    raw?: {
      setHeader?: (name: string, value: string | string[]) => void;
    };
  };
  req?: {
    raw?: {
      res?: {
        setHeader?: (name: string, value: string | string[]) => void;
      };
    };
    res?: {
      setHeader?: (name: string, value: string | string[]) => void;
    };
  };
}

export function createGraphqlCookiePlugin(): ApolloServerPlugin<CookieReplyContext> {
  return {
    async requestDidStart() {
      return {
        async willSendResponse({ contextValue, response }) {
          const cookies = contextValue.responseCookies;
          if (!cookies?.length) return;

          response.http?.headers.set(
            GRAPHQL_COOKIE_BATCH_HEADER,
            Buffer.from(JSON.stringify(cookies), 'utf8').toString('base64url'),
          );

          const hasNativeHttpResponse = Boolean(
            contextValue.reply?.raw?.setHeader ||
              contextValue.req?.raw?.res?.setHeader ||
              contextValue.req?.res?.setHeader,
          );

          if (hasNativeHttpResponse) return;

          // Apollo HeaderMap 은 동일 header 다중 값을 표현하지 못한다.
          // reply 가 없는 비표준 경로에서는 마지막 쿠키만 best-effort 로 기록한다.
          response.http?.headers.set('set-cookie', cookies[cookies.length - 1]);
        },
      };
    },
  };
}

export function decodeQueuedCookiesHeader(value: string | undefined): string[] | null {
  if (!value) return null;

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) && parsed.every((cookie) => typeof cookie === 'string')
      ? parsed
      : null;
  } catch {
    return null;
  }
}
