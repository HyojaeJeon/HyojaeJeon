import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealMerchantCommissionRateModel {
  @Field(() => ID) id!: string;
  @Field() enrollmentId!: string;
  @Field() effectiveFrom!: Date;
  @Field(() => Date, { nullable: true }) effectiveTo?: Date | null;
  @Field(() => Float) baseRatePct!: number;
  @Field(() => Float, { nullable: true }) specialZoneRatePct?: number | null;
  @Field(() => Float, { nullable: true }) franchiseFlatRatePct?: number | null;
  @Field() createdAt!: Date;
}
