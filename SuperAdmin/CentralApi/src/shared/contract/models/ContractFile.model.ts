/**
 * 한국어: ContractFile GraphQL 모델 — 계약 첨부/스캔 파일.
 * Tiếng Việt: Model GraphQL ContractFile — file đính kèm hợp đồng.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ContractFileModel {
  @Field(() => ID)
  id!: string;

  @Field()
  contractId!: string;

  @Field()
  fileType!: string; // DRAFT | AGREED | SIGNED_A | SIGNED_B | SIGNED_COMPLETE | EXPORT_DOCX | EXPORT_PDF

  @Field()
  locale!: string;

  @Field()
  filePath!: string;

  @Field()
  fileName!: string;

  @Field(() => Int)
  fileSize!: number;

  @Field()
  mimeType!: string;

  @Field()
  uploadedBy!: string;

  @Field()
  uploadedAt!: Date;
}
