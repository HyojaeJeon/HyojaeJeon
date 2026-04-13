/**
 * 한국어: CreateRoleInput — rbacCreateRole mutation input.
 *   roleName 은 vi 기본 라벨 (required). nameKo/nameEn 은 선택.
 *   roleCode 는 서버에서 자동 생성한다 (scope + roleName 기반).
 * Tiếng Việt: Input cho mutation rbacCreateRole.
 *   roleCode được server tự tạo (dựa trên scope + roleName).
 */
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field() @IsString() @IsNotEmpty() @MaxLength(30) scope!: string;
  @Field() @IsString() @IsNotEmpty() @MaxLength(200) roleName!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) roleNameKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) roleNameEn?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) description?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionEn?: string | null;
}
