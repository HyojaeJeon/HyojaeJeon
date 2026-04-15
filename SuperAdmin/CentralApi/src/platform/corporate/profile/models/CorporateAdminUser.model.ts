/**
 * [KO] CorporateAdminUser GraphQL ObjectType — 기업 관리자 계정.
 * [VI] CorporateAdminUser GraphQL ObjectType — tài khoản quản trị doanh nghiệp.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CorporateAdminUserModel {
  @Field(() => ID) id!: string;
  @Field() corporateId!: string;
  @Field() loginId!: string;
  @Field() displayName!: string;
  @Field(() => String, { nullable: true }) email?: string | null;
  @Field(() => String, { nullable: true }) phone?: string | null;
  @Field() status!: string;
  @Field(() => Date, { nullable: true }) lastLoginAt?: Date | null;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
}
