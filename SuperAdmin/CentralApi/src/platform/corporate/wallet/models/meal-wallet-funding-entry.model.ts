import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealWalletFundingEntryModel {
  @Field(() => ID) id!: string;
  @Field() walletId!: string;
  @Field() sourceType!: string;
  @Field() status!: string;
  @Field(() => GraphQLBigInt) amountVnd!: bigint;
  @Field(() => String, { nullable: true }) sourceBatchId?: string | null;
  @Field(() => String, { nullable: true }) sourceReferenceId?: string | null;
  @Field(() => String, { nullable: true }) note?: string | null;
  @Field(() => Date, { nullable: true }) postedAt?: Date | null;
  @Field(() => Date, { nullable: true }) reversedAt?: Date | null;
  @Field() createdAt!: Date;
}
