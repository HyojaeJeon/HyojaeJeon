/**
 * 한국어: Role GraphQL ObjectType.
 *   roleCode 는 legacy enum (PLATFORM_SUPER_ADMIN 등) 과 일치. scope 는 PLATFORM/BRAND_HQ 등.
 *
 * Tiếng Việt: ObjectType GraphQL cho Role — vai trò RBAC.
 */
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RoleModel {
  @Field(() => ID) id!: string;
  @Field() roleCode!: string;
  @Field() roleName!: string;
  @Field() scope!: string;
  @Field(() => Int) hierarchyLevel!: number;
  @Field() isSystem!: boolean;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
