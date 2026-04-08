/**
 * 한국어: 표준 ErrorPayload — 모든 OperationResponse 의 `error` 필드가 사용한다.
 *   public 노출 필드만 보유. msgKey/params/locale 같은 internal metadata 는 노출하지 않는다.
 *
 * Tiếng Việt: ErrorPayload công khai dùng chung cho mọi response.
 */
import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';

@ObjectType('ErrorPayload')
export class ErrorPayload {
  @Field() code!: string;
  @Field() message!: string;
  @Field({ nullable: true }) requestId?: string;
  @Field(() => GraphQLJSONObject, { nullable: true }) details?: Record<string, unknown>;
}
