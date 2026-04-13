/**
 * 한국어: 계약 생성 입력 DTO.
 * Tiếng Việt: DTO đầu vào tạo hợp đồng.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreateContractInput {
  @Field()
  @IsString()
  contractType!: string; // MERCHANT | DISTRIBUTOR | CORPORATE

  @Field()
  @IsString()
  partyBType!: string; // BRAND_HQ | DISTRIBUTOR | CORPORATE

  @Field(() => ID)
  @IsUUID()
  partyBId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  templateId?: string | null;

  @Field()
  @IsString()
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  titleKo?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  titleEn?: string | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  effectiveFrom?: Date | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  effectiveTo?: Date | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  termsJson?: unknown;
}
