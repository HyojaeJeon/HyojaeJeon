/**
 * 한국어: 계약 템플릿 생성 입력 DTO.
 * Tiếng Việt: DTO đầu vào tạo mẫu hợp đồng.
 */
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';

@InputType()
export class CreateContractTemplateInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  templateCode?: string | null;

  @Field()
  @IsString()
  contractType!: string; // MERCHANT | DISTRIBUTOR | CORPORATE

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

  @Field(() => GraphQLJSON)
  bodyJson!: unknown;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  clausesJson?: unknown;
}
