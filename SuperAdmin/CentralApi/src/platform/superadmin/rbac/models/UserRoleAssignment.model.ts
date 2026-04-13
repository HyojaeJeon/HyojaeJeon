/**
 * 한국어: UserRoleAssignment GraphQL ObjectType.
 *   userType (SUPER_ADMIN/DISTRIBUTOR_USER/BRAND_ADMIN/CORPORATE_ADMIN) 별로
 *   role 부여를 통합 표현. scope 컬럼은 4 축 (distributor/brand/branch/corporate).
 *
 * Tiếng Việt: ObjectType GraphQL cho gán nhiều role cho user.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserRoleAssignmentModel {
  @Field(() => ID) id!: string;
  @Field() userType!: string;
  @Field() userId!: string;
  @Field() roleId!: string;
  @Field() status!: string;
  @Field(() => String, { nullable: true }) scopeBrandHqId?: string | null;
  @Field(() => String, { nullable: true }) scopeCorporateId?: string | null;
  @Field(() => String, { nullable: true }) scopeBranchId?: string | null;
  @Field() grantedAt!: Date;
  @Field(() => String, { nullable: true }) grantedBy?: string | null;
  @Field(() => Date, { nullable: true }) expiresAt?: Date | null;
  @Field(() => Date, { nullable: true }) revokedAt?: Date | null;
  @Field(() => String, { nullable: true }) revokeReason?: string | null;
}
