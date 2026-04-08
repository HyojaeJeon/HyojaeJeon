/**
 * 한국어: OperationResponse 팩토리 — Inner type 마다 표준 응답 클래스를 1회 생성/캐시한다.
 *   생성되는 GraphQL type:
 *     - <name>          : { success: <name>Success | null, error: ErrorPayload | null }
 *     - <name>Success   : { code, message, requestId?, data: Inner }
 *
 *   resolver 는 raw 도메인 객체를 그대로 return 하면 된다. WrapResponseInterceptor 가
 *   자동으로 success 필드로 감싸 준다. 예외는 DomainExceptionFilter 가 error 필드로 감싼다.
 *
 *   `createObjectResponse(BrandModel, 'BrandResponse')`     → 단일 객체용
 *   `createListResponse(BrandModel,   'BrandListResponse')` → 배열용
 *   `BooleanResponse`                                       → boolean mutation 용 (싱글톤)
 *   `IdResponse`                                            → 신규 리소스 ID 반환용
 *
 * Tiếng Việt: Factory tạo class OperationResponse có cache theo (Inner, name).
 */
import { Field, ObjectType } from '@nestjs/graphql';
import type { Type } from '@nestjs/common';
import { ErrorPayload } from './error-payload.model';

const cache = new Map<string, Type<unknown>>();

interface ResponseClass<TPayload> {
  success?: TPayload | null;
  error?: ErrorPayload | null;
}

/**
 * 한국어: 단일 객체 응답 클래스 생성. 동일 name 으로 재호출되면 캐시된 클래스를 반환.
 */
export function createObjectResponse<T>(
  InnerClass: Type<T>,
  name: string,
): Type<ResponseClass<{ code: string; message: string; requestId?: string; data: T }>> {
  const cached = cache.get(name);
  if (cached) return cached as Type<ResponseClass<{ code: string; message: string; requestId?: string; data: T }>>;

  @ObjectType(`${name}Success`)
  class SuccessPayload {
    @Field() code!: string;
    @Field() message!: string;
    @Field({ nullable: true }) requestId?: string;
    @Field(() => InnerClass) data!: T;
  }

  @ObjectType(name)
  class OperationResponse {
    @Field(() => SuccessPayload, { nullable: true }) success?: SuccessPayload | null;
    @Field(() => ErrorPayload, { nullable: true }) error?: ErrorPayload | null;
  }

  cache.set(name, OperationResponse as unknown as Type<unknown>);
  return OperationResponse as unknown as Type<
    ResponseClass<{ code: string; message: string; requestId?: string; data: T }>
  >;
}

/**
 * 한국어: 객체 리스트 응답 클래스 생성.
 */
export function createListResponse<T>(
  InnerClass: Type<T>,
  name: string,
): Type<ResponseClass<{ code: string; message: string; requestId?: string; data: T[] }>> {
  const cached = cache.get(name);
  if (cached) return cached as Type<ResponseClass<{ code: string; message: string; requestId?: string; data: T[] }>>;

  @ObjectType(`${name}Success`)
  class SuccessPayload {
    @Field() code!: string;
    @Field() message!: string;
    @Field({ nullable: true }) requestId?: string;
    @Field(() => [InnerClass]) data!: T[];
  }

  @ObjectType(name)
  class OperationResponse {
    @Field(() => SuccessPayload, { nullable: true }) success?: SuccessPayload | null;
    @Field(() => ErrorPayload, { nullable: true }) error?: ErrorPayload | null;
  }

  cache.set(name, OperationResponse as unknown as Type<unknown>);
  return OperationResponse as unknown as Type<
    ResponseClass<{ code: string; message: string; requestId?: string; data: T[] }>
  >;
}

/**
 * 한국어: Boolean 응답 (예: delete mutation) — 전 코드베이스에서 단일 인스턴스 사용.
 */
@ObjectType('BooleanResponseSuccess')
class BooleanSuccessPayload {
  @Field() code!: string;
  @Field() message!: string;
  @Field({ nullable: true }) requestId?: string;
  @Field() data!: boolean;
}

@ObjectType('BooleanResponse')
export class BooleanResponse {
  @Field(() => BooleanSuccessPayload, { nullable: true }) success?: BooleanSuccessPayload | null;
  @Field(() => ErrorPayload, { nullable: true }) error?: ErrorPayload | null;
}

/**
 * 한국어: String 응답 (id, token 등 단일 string 반환).
 */
@ObjectType('StringResponseSuccess')
class StringSuccessPayload {
  @Field() code!: string;
  @Field() message!: string;
  @Field({ nullable: true }) requestId?: string;
  @Field() data!: string;
}

@ObjectType('StringResponse')
export class StringResponse {
  @Field(() => StringSuccessPayload, { nullable: true }) success?: StringSuccessPayload | null;
  @Field(() => ErrorPayload, { nullable: true }) error?: ErrorPayload | null;
}

/**
 * 한국어: String 배열 응답 (effective permissions 등).
 */
@ObjectType('StringListResponseSuccess')
class StringListSuccessPayload {
  @Field() code!: string;
  @Field() message!: string;
  @Field({ nullable: true }) requestId?: string;
  @Field(() => [String]) data!: string[];
}

@ObjectType('StringListResponse')
export class StringListResponse {
  @Field(() => StringListSuccessPayload, { nullable: true }) success?: StringListSuccessPayload | null;
  @Field(() => ErrorPayload, { nullable: true }) error?: ErrorPayload | null;
}

/**
 * 한국어: 응답 객체가 이미 wrapped 인지 식별 (interceptor 가 이중 wrap 을 피한다).
 */
export function isWrappedResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return 'success' in v || 'error' in v;
}
