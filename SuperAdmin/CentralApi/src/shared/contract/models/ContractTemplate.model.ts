/**
 * 한국어: ContractTemplate GraphQL 모델 — 계약 템플릿.
 * Tiếng Việt: Model GraphQL ContractTemplate — mẫu hợp đồng.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class ContractTemplateModel {
  @Field(() => ID)
  id!: string;

  @Field()
  templateCode!: string;

  @Field()
  contractType!: string; // MERCHANT | DISTRIBUTOR | CORPORATE

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  titleKo?: string | null;

  @Field(() => String, { nullable: true })
  titleEn?: string | null;

  @Field(() => GraphQLJSON)
  bodyJson!: unknown;

  @Field(() => GraphQLJSON)
  clausesJson!: unknown;

  @Field(() => Int)
  version!: number;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
