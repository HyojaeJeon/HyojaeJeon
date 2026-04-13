import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class EInvoiceSubmissionLogModel {
  @Field(() => ID) id!: string;
  @Field() invoiceId!: string;
  @Field(() => Int) attempt!: number;
  @Field() providerType!: string;
  @Field() environment!: string;
  @Field(() => GraphQLJSON, { nullable: true }) requestJson?: unknown;
  @Field(() => GraphQLJSON, { nullable: true }) responseJson?: unknown;
  @Field() status!: string;
  @Field(() => String, { nullable: true }) errorCode?: string | null;
  @Field(() => String, { nullable: true }) errorMessage?: string | null;
  @Field(() => Int, { nullable: true }) durationMs?: number | null;
  @Field() createdAt!: Date;
}
