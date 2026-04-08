import { Field, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsBigIntMax, IsBigIntMin } from '@core/validation/bigint-validators';

const MAX_CORP_AMOUNT_VND: bigint = 10_000_000_000_000n;

@InputType()
export class UpdateMealCorporateInput {
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) companyName?: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(50) taxCode?: string;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['PREPAID_DEPOSIT', 'CREDIT_NET15', 'CREDIT_NET30'])
  fundingModel?: string;
  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  monthlyBudgetVnd?: bigint;
  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  creditLimitVnd?: bigint;
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'TERMINATED'])
  status?: string;
}
