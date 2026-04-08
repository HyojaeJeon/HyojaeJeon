/**
 * 한국어: Permission GraphQL ObjectType.
 *   동적 RBAC 의 권한 어휘 (단일 원본). 'mealticket.policy.write' 등의 dot-notation key.
 *
 * Tiếng Việt: ObjectType GraphQL cho Permission — từ vựng quyền hạn duy nhất.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PermissionModel {
  @Field(() => ID) id!: string;
  @Field() permissionKey!: string;
  @Field() domain!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field() isSystem!: boolean;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}
