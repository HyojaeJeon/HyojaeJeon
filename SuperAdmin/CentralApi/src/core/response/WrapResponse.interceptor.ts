/**
 * 한국어: WrapResponseInterceptor — 모든 GraphQL 핸들러의 반환 값을 표준 success 응답으로 감싼다.
 *   동작:
 *     1) ResolveField / Subscription / REST 는 무시한다 (Query/Mutation 만 wrap).
 *     2) 이미 wrapped (success 또는 error 필드를 가진 객체) 면 통과.
 *     3) 그 외에는 `{ success: { code: 'OK', message, requestId, data } }` 로 감싼다.
 *
 *   message 는 i18n.message({ domain: 'common', kind: 'success', code: 'OK', locale }) 로 해석된다.
 *
 * Tiếng Việt: Interceptor bọc tự động kết quả resolver thành success response.
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nService } from '@core/i18n/I18n.service';
import type { SupportedLocale } from '@core/i18n/locale.util';
import { SuccessCode } from './responseCodes';
import { isWrappedResponse } from './OperationResponse.factory';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'graphql') {
      return next.handle();
    }
    const gql = GqlExecutionContext.create(context);
    const info = gql.getInfo<{
      operation?: { operation?: 'query' | 'mutation' | 'subscription' };
      parentType?: { name?: string };
    }>();
    const opType =
      info?.operation?.operation ??
      (info?.parentType?.name === 'Mutation'
        ? 'mutation'
        : info?.parentType?.name === 'Query'
          ? 'query'
          : undefined);

    // ResolveField (parent type 이 Query/Mutation 이 아님) → wrap 하지 않음
    if (opType !== 'query' && opType !== 'mutation') {
      return next.handle();
    }

    const ctx = gql.getContext<{
      locale?: SupportedLocale;
      requestId?: string;
      responseCookies?: string[];
      req?: { raw?: { res?: { setHeader?: (name: string, value: string | string[]) => void } } };
    }>();

    return next.handle().pipe(
      map((value) => {

        if (isWrappedResponse(value)) return value;
        const message = this.i18n.message({
          domain: 'common',
          kind: 'success',
          code: SuccessCode.OK,
          locale: ctx.locale,
        });
        // resolver 가 { data, totalCount } 형태로 반환하면 totalCount 를 preserve 한다.
        const isListResult =
          value != null &&
          typeof value === 'object' &&
          'data' in value &&
          'totalCount' in value &&
          Array.isArray((value as { data: unknown }).data);

        if (isListResult) {
          const lr = value as { data: unknown[]; totalCount: number };
          return {
            success: {
              code: SuccessCode.OK,
              message,
              requestId: ctx.requestId,
              data: lr.data,
              totalCount: lr.totalCount,
            },
            error: null,
          };
        }

        return {
          success: {
            code: SuccessCode.OK,
            message,
            requestId: ctx.requestId,
            data: value,
          },
          error: null,
        };
      }),
    );
  }
}
