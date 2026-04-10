/**
 * 한국어: CreatePermissionInput — rbacCreatePermission mutation input.
 * Tiếng Việt: Input cho mutation rbacCreatePermission.
 */
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreatePermissionInput {
  @Field() @IsString() @IsNotEmpty() @MaxLength(120) permissionKey!: string;
  @Field() @IsString() @IsNotEmpty() @MaxLength(40) domain!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) name?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameEn?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) description?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionEn?: string | null;
}
