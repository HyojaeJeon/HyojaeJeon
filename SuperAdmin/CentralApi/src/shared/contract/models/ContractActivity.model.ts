/**
 * 한국어: ContractActivity GraphQL 모델 — 계약 활동 로그 (타임라인 UI용).
 * Tiếng Việt: Model GraphQL ContractActivity — log hoạt động hợp đồng (cho timeline UI).
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class ContractActivityModel {
  @Field(() => ID)
  id!: string;

  @Field()
  contractId!: string;

  @Field()
  activityType!: string;

  @Field(() => String, { nullable: true })
  fromStatus?: string | null;

  @Field(() => String, { nullable: true })
  toStatus?: string | null;

  @Field()
  actorId!: string;

  @Field()
  actorType!: string; // SUPER_ADMIN | BRAND_ADMIN | CORPORATE_ADMIN | DISTRIBUTOR_USER | SYSTEM

  @Field()
  summary!: string;

  @Field(() => String, { nullable: true })
  summaryKo?: string | null;

  @Field(() => String, { nullable: true })
  summaryEn?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: unknown;

  @Field()
  createdAt!: Date;
}
