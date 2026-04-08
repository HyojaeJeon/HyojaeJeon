import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealSettlementBatchModel {
  @Field(() => ID) id!: string;
  @Field() brandHqId!: string;
  @Field() periodStart!: Date;
  @Field() periodEnd!: Date;
  @Field() status!: string;
  @Field(() => GraphQLBigInt) grossAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) commissionAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) netPayableVnd!: bigint;
  @Field(() => Int) threeWayMismatchCount!: number;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
