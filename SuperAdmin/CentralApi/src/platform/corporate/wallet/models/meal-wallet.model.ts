import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealWalletModel {
  @Field(() => ID) id!: string;
  @Field() corporateId!: string;
  @Field() employeeId!: string;
  @Field() status!: string;
  @Field(() => GraphQLBigInt) balanceVnd!: bigint;
  @Field(() => GraphQLBigInt) companyAllowanceVnd!: bigint;
  @Field(() => GraphQLBigInt) personalTopUpVnd!: bigint;
  @Field(() => GraphQLBigInt) dailyLimitVnd!: bigint;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
