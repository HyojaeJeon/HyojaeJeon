import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class EInvoiceModel {
  @Field(() => ID) id!: string;

  // Polymorphic 발급 주체
  @Field() subjectType!: string;
  @Field() subjectId!: string;
  @Field() issuanceMode!: string;

  @Field() periodStart!: Date;
  @Field() periodEnd!: Date;
  @Field() status!: string;

  // 금액 4분할
  @Field(() => GraphQLBigInt) totAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) totDiscountVnd!: bigint;
  @Field(() => GraphQLBigInt) totVatAmountVnd!: bigint;
  @Field(() => GraphQLBigInt) totPayableVnd!: bigint;

  // 통합 모드 메타
  @Field(() => String, { nullable: true }) consolidationStrategy?: string | null;
  @Field(() => Int, { nullable: true }) sourceTransactionCount?: number | null;

  // Seller 정형 + snapshot
  @Field(() => String, { nullable: true }) sellerTaxCode?: string | null;
  @Field(() => String, { nullable: true }) sellerCompanyName?: string | null;
  @Field(() => String, { nullable: true }) sellerAddress?: string | null;
  @Field(() => String, { nullable: true }) sellerEmail?: string | null;
  @Field(() => GraphQLJSON, { nullable: true }) sellerSnapshot?: unknown;

  // Buyer 정형 + snapshot
  @Field(() => String, { nullable: true }) buyerTaxCode?: string | null;
  @Field(() => String, { nullable: true }) buyerCompanyName?: string | null;
  @Field(() => String, { nullable: true }) buyerAddress?: string | null;
  @Field(() => String, { nullable: true }) buyerEmail?: string | null;
  @Field(() => GraphQLJSON, { nullable: true }) buyerSnapshot?: unknown;

  // 워크플로우
  @Field(() => Date, { nullable: true }) reviewDueAt?: Date | null;
  @Field(() => String, { nullable: true }) requestedByAdminId?: string | null;
  @Field(() => Date, { nullable: true }) requestedAt?: Date | null;
  @Field(() => String, { nullable: true }) disputedByAdminId?: string | null;
  @Field(() => Date, { nullable: true }) disputedAt?: Date | null;
  @Field(() => String, { nullable: true }) disputeReason?: string | null;
  @Field() autoPromoted!: boolean;
  @Field(() => String, { nullable: true }) submittedByAdminId?: string | null;
  @Field(() => Date, { nullable: true }) submittedAt?: Date | null;

  // 법적 timestamp
  @Field(() => Date, { nullable: true }) invoiceIssuedAt?: Date | null;
  @Field(() => Date, { nullable: true }) signedAt?: Date | null;
  @Field(() => Date, { nullable: true }) acceptedAt?: Date | null;
  @Field(() => Date, { nullable: true }) rejectedAt?: Date | null;
  @Field(() => String, { nullable: true }) rejectionReason?: string | null;

  // Cancellation / Replacement / Adjustment
  @Field(() => String, { nullable: true }) replacedByInvoiceId?: string | null;
  @Field(() => String, { nullable: true }) adjustmentOfInvoiceId?: string | null;
  @Field(() => String, { nullable: true }) cancellationDecisionRef?: string | null;
  @Field(() => String, { nullable: true }) cancellationReason?: string | null;
  @Field(() => Date, { nullable: true }) cancelledAt?: Date | null;

  // WeTax provider
  @Field(() => String, { nullable: true }) refId?: string | null;
  @Field(() => String, { nullable: true }) cqtCode?: string | null;
  @Field() isCqtCertified!: boolean;
  @Field(() => String, { nullable: true }) formNo?: string | null;
  @Field(() => String, { nullable: true }) serialNo?: string | null;
  @Field(() => String, { nullable: true }) invoiceNo?: string | null;
  @Field(() => String, { nullable: true }) lookupCode?: string | null;
  @Field(() => String, { nullable: true }) gdtReceiptNo?: string | null;
  @Field(() => String, { nullable: true }) xmlPayloadRef?: string | null;
  @Field(() => String, { nullable: true }) transType?: string | null;
  @Field(() => String, { nullable: true }) currencyCode?: string | null;
  @Field(() => String, { nullable: true }) exchangeRate?: string | null;
  @Field(() => String, { nullable: true }) paymentMethod?: string | null;
  @Field(() => String, { nullable: true }) providerType?: string | null;
  @Field(() => GraphQLJSON, { nullable: true }) providerRequestJson?: unknown;
  @Field(() => GraphQLJSON, { nullable: true }) providerResponseJson?: unknown;

  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
