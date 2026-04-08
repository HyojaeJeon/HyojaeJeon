import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateMealPolicyInput {
  @Field(() => ID) @IsUUID() corporateId!: string;
  @Field() @IsString() policyCode!: string;
  @Field() @IsString() policyName!: string;
  @Field(() => [String], { defaultValue: [] }) appliesToDepartmentIds!: string[];
  @Field(() => [String], { defaultValue: [] }) appliesToRoleCodes!: string[];
  @Field(() => GraphQLBigInt, { defaultValue: 0n }) maxPerTransactionVnd!: bigint;
  @Field(() => GraphQLBigInt, { defaultValue: 0n }) dailyLimitVnd!: bigint;
  @Field({ defaultValue: true }) @IsBoolean() allowSplitPayment!: boolean;
  @Field() effectiveFrom!: Date;
  @Field(() => Date, { nullable: true }) effectiveTo?: Date;
}
