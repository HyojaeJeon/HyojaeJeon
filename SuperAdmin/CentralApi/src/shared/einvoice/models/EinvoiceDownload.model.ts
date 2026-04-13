import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EInvoiceDownloadModel {
  @Field() url!: string;
  @Field() fileName!: string;
  @Field() expiresAt!: string;
}
