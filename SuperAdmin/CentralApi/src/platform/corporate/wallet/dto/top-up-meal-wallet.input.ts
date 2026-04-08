import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import {
  DEFAULT_MAX_VND_AMOUNT,
  IsBigIntMax,
  IsBigIntMin,
} from '@core/validation/bigint-validators';

@InputType()
export class TopUpMealWalletInput {
  @Field(() => ID) @IsUUID() walletId!: string;

  // P2-4: 개인 충전은 양수 필수, 과도한 금액 차단
  @Field(() => GraphQLBigInt)
  @IsBigIntMin(1n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  amountVnd!: bigint;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentReferenceId?: string;
}
