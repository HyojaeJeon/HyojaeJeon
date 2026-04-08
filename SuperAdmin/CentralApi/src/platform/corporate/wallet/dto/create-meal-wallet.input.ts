import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsUUID } from 'class-validator';
import {
  DEFAULT_MAX_VND_AMOUNT,
  IsBigIntMax,
  IsBigIntMin,
} from '@core/validation/bigint-validators';

@InputType()
export class CreateMealWalletInput {
  @Field(() => ID) @IsUUID() employeeId!: string;
  // P2-4: 일일 한도는 0 허용 (제한 없음 의미), 음수/과도한 값 차단
  @Field(() => GraphQLBigInt, { defaultValue: 0n })
  @IsBigIntMin(0n)
  @IsBigIntMax(DEFAULT_MAX_VND_AMOUNT)
  dailyLimitVnd!: bigint;
}
