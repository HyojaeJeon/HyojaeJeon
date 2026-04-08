import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealMerchantEnrollmentModel {
  @Field(() => ID) id!: string;
  @Field() brandHqId!: string;
  @Field() isActive!: boolean;
  @Field() loopType!: string;
  @Field() enrolledAt!: Date;
  @Field(() => Date, { nullable: true }) contractEndsAt?: Date | null;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
