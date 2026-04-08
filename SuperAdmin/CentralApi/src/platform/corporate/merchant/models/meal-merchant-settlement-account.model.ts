import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MealMerchantSettlementAccountModel {
  @Field(() => ID) id!: string;
  @Field() enrollmentId!: string;
  @Field() bankCode!: string;
  @Field() bankAccountNumber!: string;
  @Field() bankAccountHolder!: string;
  @Field() taxCode!: string;
  @Field() isPrimary!: boolean;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
