import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import {
  DEFAULT_MAX_VND_AMOUNT,
  IsBigIntMax,
  IsBigIntMin,
} from '@core/validation/bigintValidators';

@InputType()
export class AuthorizeMealTransactionInput {
  @Field(() => ID) @IsUUID() walletId!: string;
  @Field(() => ID) @IsUUID() brandHqId!: string;
  @Field(() => ID) @IsUUID() branchId!: string;
  @Field(() => ID, { nullable: true }) @IsOptional() @IsUUID() terminalId?: string;
  @Field()
  @IsIn(['OPEN_LOOP', 'CLOSED_LOOP'])
  loopType!: string;
  @Field()
  @IsIn(['APP_QR', 'DYNAMIC_BARCODE', 'RFID_BADGE', 'BIOMETRIC_FACE', 'BIOMETRIC_FINGERPRINT'])
  authMethod!: string;
  // P2-4: 요청 금액은 양수 필수, 과도한 금액 차단
  @Field(() => GraphQLBigInt)
  @IsBigIntMin(1n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  requestedAmountVnd!: bigint;
  @Field() @IsString() @IsNotEmpty() @MaxLength(128) idempotencyKey!: string;
}
