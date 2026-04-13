/**
 * 한국어: Contract GraphQL 모델 — 계약 본문.
 * Tiếng Việt: Model GraphQL Contract — hợp đồng.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class ContractModel {
  @Field(() => ID)
  id!: string;

  @Field()
  contractCode!: string;

  @Field()
  contractType!: string; // MERCHANT | DISTRIBUTOR | CORPORATE

  @Field()
  partyAType!: string; // PLATFORM

  @Field()
  partyAId!: string;

  @Field()
  partyBType!: string; // BRAND_HQ | DISTRIBUTOR | CORPORATE

  @Field()
  partyBId!: string;

  @Field(() => String, { nullable: true })
  templateId?: string | null;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  titleKo?: string | null;

  @Field(() => String, { nullable: true })
  titleEn?: string | null;

  @Field(() => GraphQLJSON)
  bodyJson!: unknown;

  @Field(() => GraphQLJSON)
  termsJson!: unknown;

  @Field()
  status!: string;

  @Field(() => Int)
  version!: number;

  @Field(() => String, { nullable: true })
  parentContractId?: string | null;

  @Field(() => Date, { nullable: true })
  effectiveFrom?: Date | null;

  @Field(() => Date, { nullable: true })
  effectiveTo?: Date | null;

  @Field(() => Date, { nullable: true })
  reviewDeadlineAt?: Date | null;

  @Field(() => Date, { nullable: true })
  signedAt?: Date | null;

  @Field(() => Date, { nullable: true })
  terminatedAt?: Date | null;

  @Field(() => String, { nullable: true })
  terminationReason?: string | null;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
