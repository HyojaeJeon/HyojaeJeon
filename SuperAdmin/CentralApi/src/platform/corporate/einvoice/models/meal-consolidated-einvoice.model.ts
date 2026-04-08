import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class MealConsolidatedEInvoiceModel {
  @Field(() => ID) id!: string;
  @Field() corporateId!: string;
  @Field() periodStart!: Date;
  @Field() periodEnd!: Date;
  @Field(() => GraphQLBigInt) totalAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) vatAmountVnd!: bigint;
  @Field() status!: string;
  @Field(() => String, { nullable: true }) gdtReceiptNo?: string | null;
  @Field(() => String, { nullable: true }) xmlPayloadRef?: string | null;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
