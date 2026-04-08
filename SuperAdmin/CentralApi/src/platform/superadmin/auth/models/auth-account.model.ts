/**
 * 한국어: 공통 인증 계정 GraphQL 모델.
 *   SuperAdmin / DistributorUser / BrandAdminUser / CorporateAdminUser 의
 *   로그인 응답과 me 쿼리에서 공통으로 사용하는 최소 공통 모델이다.
 *
 * Tiếng Việt: Model GraphQL tài khoản xác thực dùng chung.
 *   Mô hình tối thiểu dùng chung cho phản hồi đăng nhập và query me của mọi loại tài khoản.
 */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AuthUserType } from '@core/auth/constants/user-types.constant';

@ObjectType()
export class AuthAccountModel {
  @Field(() => ID)
  id!: string;

  @Field()
  loginId!: string;

  @Field()
  displayName!: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field()
  userType!: AuthUserType;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  distributorId?: string | null;

  @Field(() => String, { nullable: true })
  brandHQId?: string | null;

  @Field(() => String, { nullable: true })
  corporateId?: string | null;

  @Field(() => Date, { nullable: true })
  lastLoginAt?: Date | null;

  @Field(() => Date, { nullable: true })
  passwordChangedAt?: Date | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
