/**
 * 한국어: Role GraphQL ObjectType.
 *   roleCode 는 legacy enum (PLATFORM_SUPER_ADMIN 등) 과 일치. scope 는 PLATFORM/BRAND_HQ 등.
 *
 * Tiếng Việt: ObjectType GraphQL cho Role — vai trò RBAC.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class RoleModel {
  @Field(() => ID) id!: string;
  @Field() roleCode!: string;
  @Field() roleName!: string;
  @Field() scope!: string;
  @Field() isSystem!: boolean;
  @Field(() => GraphQLJSON) permissions!: unknown;
  @Field(() => Int) permissionVersion!: number;
  @Field(() => String, { nullable: true }) roleNameKo?: string | null;
  @Field(() => String, { nullable: true }) roleNameEn?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) descriptionKo?: string | null;
  @Field(() => String, { nullable: true }) descriptionEn?: string | null;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
