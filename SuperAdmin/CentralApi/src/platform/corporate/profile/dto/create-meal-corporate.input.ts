import { Field, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsBigIntMax, IsBigIntMin } from '@core/validation/bigint-validators';

// P2-4: 월간 예산/여신 한도 상한. 거대 기업 대상이므로 기본 max 보다 여유롭게 10조 VND.
const MAX_CORP_AMOUNT_VND: bigint = 10_000_000_000_000n;

@InputType()
export class CreateMealCorporateInput {
  @Field() @IsString() @IsNotEmpty() @MaxLength(50) tenantCode!: string;
  @Field() @IsString() @IsNotEmpty() @MaxLength(200) companyName!: string;
  @Field() @IsString() @IsNotEmpty() @MaxLength(50) taxCode!: string;
  @Field({ defaultValue: 'PREPAID_DEPOSIT' })
  @IsIn(['PREPAID_DEPOSIT', 'CREDIT_NET15', 'CREDIT_NET30'])
  fundingModel!: string;
  @Field(() => GraphQLBigInt, { defaultValue: 0n })
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  monthlyBudgetVnd!: bigint;
  @Field(() => GraphQLBigInt, { defaultValue: 0n })
  @IsBigIntMin(0n)
  @IsBigIntMax(MAX_CORP_AMOUNT_VND)
  creditLimitVnd!: bigint;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(100) contactName?: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsEmail() contactEmail?: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(30) contactPhone?: string;
}
