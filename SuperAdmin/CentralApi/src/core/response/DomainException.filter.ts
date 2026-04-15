/**
 * 한국어: DomainExceptionFilter — 모든 예외를 표준 error 응답으로 변환한다.
 *
 *   원칙:
 *     1) DomainError → 그대로 i18n 으로 message 해석 후 error payload 반환.
 *     2) Prisma P2002 (unique 위반) → RESOURCE_CONFLICT.
 *     3) Prisma P2025 (not found)   → RESOURCE_NOT_FOUND.
 *     4) Nest HttpException (Forbidden/Unauthorized/NotFound...) → 코드 매핑.
 *     5) 그 외 → INTERNAL_ERROR (로그 + 일반화).
 *
 *   반환 형식:
 *     - GraphQL: throw 하지 않고 error 필드만 채운 wrapped 응답을 반환.
 *       => GraphQL `errors` 배열에는 들어가지 않고 클라이언트는 항상 `success` 또는 `error` 필드를 본다.
 *     - REST: HttpException 으로 래핑하여 throw (status + body).
 *
 *   본 필터는 APP_FILTER 로 전역 등록한다.
 *
 * Tiếng Việt: Filter chuyển mọi exception thành error response chuẩn.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { I18nService } from '@core/i18n/I18n.service';
import type { SupportedLocale } from '@core/i18n/locale.util';
import { DEFAULT_LOCALE, pickLocaleFromAcceptLanguage } from '@core/i18n/locale.util';
import { DomainError, defaultStatusForCode } from '@core/errors/DomainError';
import { ErrorCode } from '@core/errors/errorCodes';

interface NormalizedError {
  domain: string;
  code: string;
  msgKey: string;
  params?: Record<string, unknown>;
  status: number;
  details?: Record<string, unknown>;
  cause?: unknown;
}

function normalize(exception: unknown): NormalizedError {
  // 1) DomainError
  if (exception instanceof DomainError) {
    return {
      domain: exception.domain,
      code: exception.code,
      msgKey: exception.msgKey,
      params: exception.params,
      status: exception.status,
      details: exception.details,
    };
  }

  // 2) Prisma known errors
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    if (exception.code === 'P2002') {
      const target = (exception.meta?.target as string[] | undefined)?.join(', ') ?? 'unknown';
      return {
        domain: 'common',
        code: ErrorCode.RESOURCE_CONFLICT,
        msgKey: ErrorCode.RESOURCE_CONFLICT,
        params: { resource: 'record', field: target },
        status: HttpStatus.CONFLICT,
        details: { prismaCode: 'P2002', target },
      };
    }
    if (exception.code === 'P2025') {
      return {
        domain: 'common',
        code: ErrorCode.RESOURCE_NOT_FOUND,
        msgKey: ErrorCode.RESOURCE_NOT_FOUND,
        params: { resource: 'record' },
        status: HttpStatus.NOT_FOUND,
        details: { prismaCode: 'P2025' },
      };
    }
    return {
      domain: 'common',
      code: ErrorCode.VALIDATION_ERROR,
      msgKey: ErrorCode.VALIDATION_ERROR,
      status: HttpStatus.BAD_REQUEST,
      details: { prismaCode: exception.code },
    };
  }

  // 3) Nest HttpException — code/details 는 response payload 에서 추출
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const resp = exception.getResponse();
    const isObject = typeof resp === 'object' && resp !== null;
    const code =
      isObject && typeof (resp as { code?: unknown }).code === 'string'
        ? ((resp as { code: string }).code)
        : exception instanceof UnauthorizedException
          ? ErrorCode.UNAUTHENTICATED
          : exception instanceof ForbiddenException
            ? ErrorCode.FORBIDDEN
            : exception instanceof NotFoundException
              ? ErrorCode.NOT_FOUND
              : status === HttpStatus.TOO_MANY_REQUESTS
                ? ErrorCode.RATE_LIMITED
                : ErrorCode.VALIDATION_ERROR;
    const params =
      isObject && typeof (resp as { params?: unknown }).params === 'object'
        ? ((resp as { params: Record<string, unknown> }).params)
        : undefined;
    const details = isObject ? (resp as Record<string, unknown>) : undefined;
    return {
      domain: 'common',
      code,
      msgKey: code,
      params,
      status,
      details,
    };
  }

  // 4) Unknown
  return {
    domain: 'common',
    code: ErrorCode.INTERNAL_ERROR,
    msgKey: ErrorCode.INTERNAL_ERROR,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    cause: exception,
  };
}

@Injectable()
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost): unknown {
    const normalized = normalize(exception);

    // 로깅 — INTERNAL_ERROR 만 stack 포함, 그 외는 단일 라인 warn
    if (normalized.code === ErrorCode.INTERNAL_ERROR) {
      this.logger.error(
        `Unhandled exception: ${(exception as Error)?.message ?? exception}`,
        (exception as Error)?.stack,
      );
    } else {
      this.logger.warn(
        `[${normalized.code}] status=${normalized.status} domain=${normalized.domain}`,
      );
    }

    if (host.getType<GqlContextType>() === 'graphql') {
      const gqlHost = GqlArgumentsHost.create(host);
      const ctx = gqlHost.getContext<{ locale?: SupportedLocale; acceptLanguage?: string; requestId?: string }>();
      const locale = ctx?.locale
        ?? pickLocaleFromAcceptLanguage(ctx?.acceptLanguage)
        ?? DEFAULT_LOCALE;
      const message = this.i18n.message({
        domain: normalized.domain,
        kind: 'error',
        code: normalized.msgKey,
        locale,
        params: normalized.params,
      });
      return {
        success: null,
        error: {
          code: normalized.code,
          message,
          requestId: ctx?.requestId,
          details: normalized.details,
        },
      };
    }

    // REST: HttpException 으로 래핑하여 throw (Nest 가 status + body 를 직렬화)
    const httpHost = host.switchToHttp();
    const res = httpHost.getResponse();
    const req = httpHost.getRequest();
    const locale = (req?.context?.locale as SupportedLocale | undefined) ?? DEFAULT_LOCALE;
    const message = this.i18n.message({
      domain: normalized.domain,
      kind: 'error',
      code: normalized.msgKey,
      locale,
      params: normalized.params,
    });
    const status = normalized.status || defaultStatusForCode(normalized.code);
    res?.status?.(status)?.json?.({
      success: null,
      error: {
        code: normalized.code,
        message,
        requestId: req?.headers?.['x-request-id'],
        details: normalized.details,
      },
    });
    return;
  }
}
