import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class SetMealMerchantSettlementAccountInput {
  @Field(() => ID) @IsUUID() enrollmentId!: string;
  @Field() bankCode!: string;
  @Field() bankAccountNumber!: string;
  @Field() bankAccountHolder!: string;
  @Field() taxCode!: string;
}
