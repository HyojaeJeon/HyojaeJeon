import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class SetMealMerchantCommissionInput {
  @Field(() => ID) @IsUUID() enrollmentId!: string;
  @Field() effectiveFrom!: Date;
  @Field(() => Date, { nullable: true }) effectiveTo?: Date;
  @Field() baseRatePct!: number;
  @Field({ nullable: true }) specialZoneRatePct?: number;
  @Field({ nullable: true }) franchiseFlatRatePct?: number;
}
