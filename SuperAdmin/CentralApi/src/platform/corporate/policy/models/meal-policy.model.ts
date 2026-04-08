import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealPolicyModel {
  @Field(() => ID) id!: string;
  @Field() corporateId!: string;
  @Field() policyCode!: string;
  @Field() policyName!: string;
  @Field(() => [String]) appliesToDepartmentIds!: string[];
  @Field(() => [String]) appliesToRoleCodes!: string[];
  @Field(() => GraphQLBigInt) maxPerTransactionVnd!: bigint;
  @Field(() => GraphQLBigInt) dailyLimitVnd!: bigint;
  @Field() allowSplitPayment!: boolean;
  @Field() status!: string;
  @Field() effectiveFrom!: Date;
  @Field(() => Date, { nullable: true }) effectiveTo?: Date | null;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
