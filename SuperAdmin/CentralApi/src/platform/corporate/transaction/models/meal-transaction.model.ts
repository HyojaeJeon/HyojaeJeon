import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealTransactionModel {
  @Field(() => ID) id!: string;
  @Field() walletId!: string;
  @Field() corporateId!: string;
  @Field() brandHqId!: string;
  @Field() branchId!: string;
  @Field(() => String, { nullable: true }) terminalId?: string | null;
  @Field() loopType!: string;
  @Field() authMethod!: string;
  @Field(() => GraphQLBigInt) requestedAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) approvedAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) companyShareVnd!: bigint;
  @Field(() => GraphQLBigInt) employeeShareVnd!: bigint;
  @Field() status!: string;
  @Field(() => String, { nullable: true }) declineReason?: string | null;
  @Field() idempotencyKey!: string;
  @Field(() => Date, { nullable: true }) authorizedAt?: Date | null;
  @Field(() => Date, { nullable: true }) settledAt?: Date | null;
  @Field() createdAt!: Date;
}
