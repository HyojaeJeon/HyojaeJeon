import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

@ObjectType()
export class EInvoiceLineModel {
  @Field(() => ID) id!: string;
  @Field() invoiceId!: string;
  @Field(() => Int) seq!: number;
  @Field(() => String, { nullable: true }) itemCode?: string | null;
  @Field() itemName!: string;
  @Field() uom!: string;

  // Decimal 은 string 으로 직렬화 (JS number 정밀도 손실 회피)
  @Field() quantity!: string;
  @Field() unitPriceVnd!: string;

  @Field() vatTreatment!: string;
  @Field() vatRatePct!: string;

  @Field(() => GraphQLBigInt) amountVnd!: bigint;
  @Field(() => GraphQLBigInt) vatAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) payAmountVnd!: bigint;
  @Field() feature!: string;
  @Field(() => String, { nullable: true }) dcRate?: string | null;
  @Field(() => GraphQLBigInt, { nullable: true }) dcAmountVnd?: bigint | null;

  @Field() createdAt!: Date;
}
