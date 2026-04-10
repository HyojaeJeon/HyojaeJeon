/**
 * 한국어: UpdatePermissionInput — rbacUpdatePermission mutation input. 모든 필드 선택.
 * Tiếng Việt: Input cho mutation rbacUpdatePermission.
 */
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdatePermissionInput {
  @Field(() => ID) permissionId!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(40) domain?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) name?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameEn?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) description?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionEn?: string | null;
}
