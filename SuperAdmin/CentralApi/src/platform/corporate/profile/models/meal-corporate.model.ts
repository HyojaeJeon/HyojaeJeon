import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealCorporateModel {
  @Field(() => ID) id!: string;
  @Field() tenantCode!: string;
  @Field() companyName!: string;
  @Field() taxCode!: string;
  @Field() fundingModel!: string;
  @Field(() => GraphQLBigInt) monthlyBudgetVnd!: bigint;
  @Field(() => GraphQLBigInt) depositBalanceVnd!: bigint;
  @Field(() => GraphQLBigInt) creditLimitVnd!: bigint;
  @Field(() => String, { nullable: true }) contactName?: string | null;
  @Field(() => String, { nullable: true }) contactEmail?: string | null;
  @Field(() => String, { nullable: true }) contactPhone?: string | null;
  @Field() status!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
