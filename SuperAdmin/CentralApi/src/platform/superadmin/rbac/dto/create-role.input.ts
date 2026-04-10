/**
 * 한국어: CreateRoleInput — rbacCreateRole mutation input.
 *   roleName 은 vi 기본 라벨 (required). nameKo/nameEn 은 선택.
 * Tiếng Việt: Input cho mutation rbacCreateRole.
 */
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field() @IsString() @IsNotEmpty() @MaxLength(80) roleCode!: string;
  @Field() @IsString() @IsNotEmpty() @MaxLength(30) scope!: string;
  @Field() @IsString() @IsNotEmpty() @MaxLength(200) roleName!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameEn?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) description?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionEn?: string | null;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() @Min(0) hierarchyLevel?: number | null;
}
