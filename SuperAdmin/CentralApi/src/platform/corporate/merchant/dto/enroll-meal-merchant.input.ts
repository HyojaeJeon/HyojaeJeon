import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsUUID } from 'class-validator';

@InputType()
export class EnrollMealMerchantInput {
  @Field(() => ID) @IsUUID() brandHqId!: string;
  @Field({ defaultValue: 'OPEN_LOOP' })
  @IsIn(['OPEN_LOOP', 'CLOSED_LOOP'])
  loopType!: string;
  @Field(() => Date, { nullable: true }) contractEndsAt?: Date;
}
