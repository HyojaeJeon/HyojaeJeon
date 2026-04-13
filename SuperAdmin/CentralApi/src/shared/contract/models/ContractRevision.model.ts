/**
 * 한국어: ContractRevision GraphQL 모델 — 계약 수정 이력.
 * Tiếng Việt: Model GraphQL ContractRevision — lịch sử sửa đổi hợp đồng.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class ContractRevisionModel {
  @Field(() => ID)
  id!: string;

  @Field()
  contractId!: string;

  @Field(() => Int)
  revisionNo!: number;

  @Field()
  modifiedBy!: string;

  @Field()
  modifiedByType!: string;

  @Field()
  locale!: string;

  @Field()
  changeType!: string; // CLAUSE_EDIT | TERM_CHANGE | AMOUNT_CHANGE | BODY_EDIT

  @Field()
  fieldPath!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  beforeValue?: unknown;

  @Field(() => GraphQLJSON, { nullable: true })
  afterValue?: unknown;

  @Field(() => String, { nullable: true })
  reason?: string | null;

  @Field(() => String, { nullable: true })
  ackBy?: string | null;

  @Field(() => Date, { nullable: true })
  ackAt?: Date | null;

  @Field()
  createdAt!: Date;
}
