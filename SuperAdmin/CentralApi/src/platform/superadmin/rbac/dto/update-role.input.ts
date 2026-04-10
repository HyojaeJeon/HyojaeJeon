/**
 * 한국어: UpdateRoleInput — rbacUpdateRole mutation input. 모든 필드 선택.
 * Tiếng Việt: Input cho mutation rbacUpdateRole.
 */
import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

@InputType()
export class UpdateRoleInput {
  @Field(() => ID) roleId!: string;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) roleName?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(200) nameEn?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(30) scope?: string | null;
  @Field(() => Int, { nullable: true }) @IsOptional() @IsInt() @Min(0) hierarchyLevel?: number | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) description?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionKo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() @MaxLength(500) descriptionEn?: string | null;
}
